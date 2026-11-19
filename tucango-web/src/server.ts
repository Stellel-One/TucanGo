import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { TucanGoFacade, type ActualizarPerfilDTO } from "./application/TucanGoFacade.ts";
import { SqliteSistemaRepository } from "./infrastructure/SqliteSistemaRepository.ts";
import type { SectorCampus } from "./domain/model/SectorCampus.ts";
import type { EventoDominio } from "./domain/patterns/EventBus.ts";
import {
  AuthError,
  CredencialesInvalidasError,
  NoAutenticadoError,
  AccesoDenegadoError,
  ValidacionError,
  DemasiadasPeticionesError,
  CuerpoExcesivoError
} from "./domain/security/ErroresAuth.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_PUBLIC_DIR = path.join(__dirname, "..", "public");

// Cargar variables de entorno desde tucango-web/.env si existe (sin pisar variables ya definidas)
const ENV_FILE_PATH = path.join(__dirname, "..", ".env");
if (fs.existsSync(ENV_FILE_PATH)) {
  try {
    const rawEnv = fs.readFileSync(ENV_FILE_PATH, "utf8");
    for (const line of rawEnv.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx <= 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (key && process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  } catch {
    // Continuar si el archivo .env no puede leerse
  }
}

const IS_PROD = process.env.NODE_ENV === "production";
const RAW_SESSION_SECRET = process.env.SESSION_SECRET;

// B1: Exigir SESSION_SECRET en producción con fallo al arranque si falta o es débil
if (IS_PROD && (!RAW_SESSION_SECRET || RAW_SESSION_SECRET.length < 32)) {
  console.error(
    "FATAL: SESSION_SECRET es obligatoria en producción y debe tener al menos 32 caracteres."
  );
  process.exit(1);
}

// B1: Keyring con soporte de rotación mediante 'kid' en el token
const ACTIVE_KID = "k1";
const KEY_RING: Record<string, Buffer> = {
  k1: RAW_SESSION_SECRET
    ? Buffer.from(RAW_SESSION_SECRET, "utf8")
    : crypto.randomBytes(32)
};

const SESSION_COOKIE_NAME = "tucango_sid";
const HOST_SESSION_COOKIE_NAME = "__Host-tucango_sid";
const MAX_BODY_BYTES = 64 * 1024; // 64 KB (B14)

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

// B16: Cabeceras de seguridad universales
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(self), camera=(), microphone=()",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://unpkg.com https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com https://static.cloudflareinsights.com; worker-src 'self' blob:; child-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com https://*.googleapis.com; font-src 'self' data: https://fonts.gstatic.com https://*.gstatic.com; img-src 'self' data: blob: https: http:; connect-src 'self' data: blob: https://router.project-osrm.org https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://maps.googleapis.com https://routes.googleapis.com https://*.googleapis.com https://*.gstatic.com https://cloudflareinsights.com;"
};

// B6: Rate Limiting en memoria con backoff exponencial
interface RateLimitEntry {
  intentos: number;
  bloqueadoHasta: number;
  ultimoIntento: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

function obtenerClienteIp(req: http.IncomingMessage): string {
  // Cloudflare sobrescribe este header con la IP real del cliente.
  const cfConnectingIp = req.headers["cf-connecting-ip"];
  if (typeof cfConnectingIp === "string" && cfConnectingIp.trim().length > 0) {
    return cfConnectingIp.trim();
  }

  // Detrás de un proxy de confianza, el ÚLTIMO salto de X-Forwarded-For es el
  // que agregó el proxy. El primero lo controla el cliente, así que confiar en
  // él permitía evadir cualquier rate limit rotando el header.
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (typeof xForwardedFor === "string") {
    const saltos = xForwardedFor
      .split(",")
      .map((salto) => salto.trim())
      .filter((salto) => salto.length > 0);
    if (saltos.length > 0) {
      return saltos[saltos.length - 1];
    }
  }
  return req.socket.remoteAddress || "127.0.0.1";
}

const DOMINIOS_INSTITUCIONALES = ["uniamazonia.edu.co", "udla.edu.co"];

/**
 * El correo institucional es exclusivo de estudiantes y egresados. El Tucán
 * se registra con correo personal, porque no pertenece a la comunidad académica.
 */
function esCorreoInstitucional(valor: string | undefined): boolean {
  const correo = (valor || "").trim().toLowerCase();
  const arroba = correo.lastIndexOf("@");
  if (arroba === -1) return false;
  const dominio = correo.slice(arroba + 1);
  return DOMINIOS_INSTITUCIONALES.includes(dominio);
}

function verificarRateLimit(
  clave: string,
  maxIntentos = 5,
  ventanaMs = 60000
): { permitido: boolean; retryAfterSegundos: number } {
  const ahora = Date.now();
  const entry = rateLimitMap.get(clave);
  if (!entry) {
    return { permitido: true, retryAfterSegundos: 0 };
  }

  if (entry.bloqueadoHasta > ahora) {
    const retryAfterSegundos = Math.ceil((entry.bloqueadoHasta - ahora) / 1000);
    return { permitido: false, retryAfterSegundos };
  }

  if (ahora - entry.ultimoIntento > ventanaMs) {
    rateLimitMap.delete(clave);
    return { permitido: true, retryAfterSegundos: 0 };
  }

  return { permitido: true, retryAfterSegundos: 0 };
}

function registrarFalloRateLimit(clave: string, maxIntentos = 5, backoffBaseMs = 15000): void {
  const ahora = Date.now();
  const entry = rateLimitMap.get(clave) || { intentos: 0, bloqueadoHasta: 0, ultimoIntento: ahora };
  entry.intentos += 1;
  entry.ultimoIntento = ahora;

  if (entry.intentos >= maxIntentos) {
    const exponente = Math.min(entry.intentos - maxIntentos, 5);
    const bloqueoMs = backoffBaseMs * Math.pow(2, exponente);
    entry.bloqueadoHasta = ahora + bloqueoMs;
  }
  rateLimitMap.set(clave, entry);
}

function resetearRateLimit(clave: string): void {
  rateLimitMap.delete(clave);
}

// B15: Parseo y construcción de Cookies seguras
function parseCookies(req: http.IncomingMessage): Record<string, string> {
  const header = req.headers.cookie || "";
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

function obtenerCookieSesion(req: http.IncomingMessage): string {
  const cookies = parseCookies(req);
  return cookies[HOST_SESSION_COOKIE_NAME] || cookies[SESSION_COOKIE_NAME] || "";
}

function construirSetCookie(
  req: http.IncomingMessage,
  valor: string,
  maxAgeSeconds: number
): string {
  const esHttps =
    req.headers["x-forwarded-proto"] === "https" ||
    Boolean((req.socket as { encrypted?: boolean }).encrypted);

  const cookieName = esHttps ? HOST_SESSION_COOKIE_NAME : SESSION_COOKIE_NAME;
  const expires = new Date(Date.now() + maxAgeSeconds * 1000).toUTCString();

  const parts = [
    `${cookieName}=${encodeURIComponent(valor)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${maxAgeSeconds}`,
    `Expires=${expires}`
  ];

  if (esHttps) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

// B1 & B4: Firma y verificación de tokens con rotación kid y revocación jti
interface SessionTokenPayload {
  kid: string;
  jti: string;
  rol: "pasajero" | "motorista" | "admin";
  identificacion: string;
  exp: number;
}

function firmarSesionCookie(payload: {
  rol: "pasajero" | "motorista" | "admin";
  identificacion: string;
  exp: number;
  jti?: string;
  kid?: string;
}): string {
  const kid = payload.kid || ACTIVE_KID;
  const key = KEY_RING[kid] || KEY_RING[ACTIVE_KID];
  const fullPayload: SessionTokenPayload = {
    kid,
    jti: payload.jti || crypto.randomUUID(),
    rol: payload.rol,
    identificacion: payload.identificacion,
    exp: payload.exp
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", key).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

function verificarSesionCookie(
  token: string,
  facade: TucanGoFacade
): SessionTokenPayload | null {
  if (!token || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".", 2);
  if (!encoded || !sig) return null;

  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionTokenPayload;
    if (!parsed || typeof parsed.exp !== "number" || parsed.exp <= Date.now()) {
      return null;
    }
    const kid = parsed.kid || "k1";
    const key = KEY_RING[kid];
    if (!key) return null;

    const expected = crypto.createHmac("sha256", key).update(encoded).digest("base64url");
    const bufSig = Buffer.from(sig);
    const bufExp = Buffer.from(expected);
    if (bufSig.length !== bufExp.length || !crypto.timingSafeEqual(bufSig, bufExp)) {
      return null;
    }

    // B4: Revocación por jti
    if (parsed.jti && facade.repository?.estaSesionRevocada(parsed.jti)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

// B14: Validación de tamaño (64 KB por defecto, configurable para carga de documentos) y Content-Type
function parseJsonBody<T>(req: http.IncomingMessage, maxBytes: number = MAX_BODY_BYTES): Promise<T> {
  return new Promise((resolve, reject) => {
    const contentType = req.headers["content-type"] || "";
    if (req.method !== "GET" && req.method !== "HEAD" && req.headers["content-length"] !== "0") {
      if (contentType && !contentType.toLowerCase().includes("application/json")) {
        return reject(new ValidacionError("Content-Type debe ser application/json."));
      }
    }

    let body = "";
    let byteCount = 0;

    req.on("data", (chunk) => {
      byteCount += chunk.length;
      if (byteCount > maxBytes) {
        req.destroy();
        return reject(new CuerpoExcesivoError(`El cuerpo de la solicitud excede el límite permitido.`));
      }
      body += chunk;
    });

    req.on("end", () => {
      try {
        resolve(body.trim() ? JSON.parse(body) : ({} as T));
      } catch {
        reject(new ValidacionError("JSON malformado en el cuerpo de la solicitud."));
      }
    });

    req.on("error", reject);
  });
}

function sendJson(
  res: http.ServerResponse,
  statusCode: number,
  data: unknown,
  extraHeaders: Record<string, string> = {}
): void {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...SECURITY_HEADERS,
    ...extraHeaders
  });
  res.end(JSON.stringify(data));
}

// F7: Cache Control estricto
function serveStatic(
  res: http.ServerResponse,
  filePath: string,
  contentType: string,
  cacheControl?: string
): void {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8",
        ...SECURITY_HEADERS
      });
      res.end("404 Not Found");
      return;
    }

    const defaultCache =
      contentType === "text/html" ||
      contentType === "text/css" ||
      contentType === "text/javascript"
        ? "no-cache, must-revalidate"
        : "public, max-age=3600";

    res.writeHead(200, {
      "Content-Type": `${contentType}; charset=utf-8`,
      "Cache-Control": cacheControl || defaultCache,
      ...SECURITY_HEADERS
    });
    res.end(content);
  });
}

function redirectTo(res: http.ServerResponse, location: string): void {
  res.writeHead(302, {
    Location: location,
    "Cache-Control": "no-store",
    ...SECURITY_HEADERS
  });
  res.end();
}

// B3 & B8: Autenticación e Hidratación de Sesión separadas
function obtenerSesionRequest(req: http.IncomingMessage, facade: TucanGoFacade) {
  const token = obtenerCookieSesion(req);
  const parsed = verificarSesionCookie(token, facade);
  if (!parsed) return null;
  try {
    const usuario = facade.resolverSesion(parsed.identificacion, parsed.rol);
    return {
      rol: usuario.rol,
      identificacion: usuario.identificacion,
      usuario,
      token,
      payload: parsed
    };
  } catch {
    return null;
  }
}

function requerirSesion(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  facade: TucanGoFacade
): NonNullable<ReturnType<typeof obtenerSesionRequest>> | null {
  const sesion = obtenerSesionRequest(req, facade);
  if (!sesion) {
    sendJson(res, 401, { error: "Autenticación requerida. Inicia sesión para continuar." });
    return null;
  }
  return sesion;
}

function requerirRol(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  facade: TucanGoFacade,
  rolRequerido: "pasajero" | "motorista" | "admin"
): NonNullable<ReturnType<typeof obtenerSesionRequest>> | null {
  const sesion = requerirSesion(req, res, facade);
  if (!sesion) return null;

  if (sesion.rol !== rolRequerido) {
    sendJson(res, 403, { error: `Operación restringida al rol ${rolRequerido}.` });
    return null;
  }
  return sesion;
}

function verificarPropiedadViaje(
  res: http.ServerResponse,
  facade: TucanGoFacade,
  auth: NonNullable<ReturnType<typeof obtenerSesionRequest>>,
  codigoViaje: string,
  tipoPropiedad: "pasajero" | "motorista" | "participante"
): boolean {
  const viaje = facade.obtenerViaje(codigoViaje);
  if (!viaje) {
    sendJson(res, 404, { error: `Viaje con código ${codigoViaje} no existe.` });
    return false;
  }

  const esPasajero = viaje.estudiante.identificacion === auth.identificacion;
  const esMotorista = viaje.motorista?.identificacion === auth.identificacion;
  const autorizado =
    tipoPropiedad === "pasajero"
      ? esPasajero
      : tipoPropiedad === "motorista"
        ? esMotorista
        : esPasajero || esMotorista;

  if (!autorizado) {
    sendJson(res, 403, { error: "No tienes permisos sobre este viaje." });
    return false;
  }
  return true;
}

function serializarSector(sector: SectorCampus) {
  return {
    id: sector.id,
    nombre: sector.nombre,
    referencia: sector.referencia,
    esCampusUniamazonia: sector.esCampusUniamazonia,
    latitud: sector.coordenada.latitud,
    longitud: sector.coordenada.longitud
  };
}

function construirEstadoDTO(
  facade: TucanGoFacade,
  sesion?: ReturnType<typeof obtenerSesionRequest>
) {
  const rol = sesion?.rol;
  const userId = sesion?.identificacion;
  const todosViajes = facade.obtenerTodosLosViajes();

  const estudiantes =
    rol === "admin"
      ? facade.obtenerEstudiantes().map((e) => ({
          identificacion: e.identificacion,
          nombre: e.nombre,
          telefono: e.telefono,
          correo: e.correoInstitucional,
          codigo: e.codigoEstudiantil,
          carrera: e.carrera,
          barrioResidencia: e.barrioResidencia,
          ubicacionesFrecuentes: e.ubicacionesFrecuentes
        }))
      : rol === "pasajero" && userId
        ? facade
            .obtenerEstudiantes()
            .filter((e) => e.identificacion === userId)
            .map((e) => ({
              identificacion: e.identificacion,
              nombre: e.nombre,
              telefono: e.telefono,
              correo: e.correoInstitucional,
              codigo: e.codigoEstudiantil,
              carrera: e.carrera,
              barrioResidencia: e.barrioResidencia,
              ubicacionesFrecuentes: e.ubicacionesFrecuentes
            }))
        : [];

  const motoristas =
    rol === "admin"
      ? facade.obtenerMotoristas().map((m) => {
          const motoActiva = m.obtenerMotoActiva();
          return {
            identificacion: m.identificacion,
            nombre: m.nombre,
            telefono: m.telefono,
            correo: m.correoInstitucional,
            estadoAprobacion: m.estadoAprobacion,
            disponible: m.disponible,
            latitud: m.ubicacionActual.latitud,
            longitud: m.ubicacionActual.longitud,
            direccionGrados: m.direccionGrados,
            motoActiva: motoActiva
              ? {
                  placa: motoActiva.placa,
                  marca: motoActiva.marca,
                  modelo: motoActiva.modelo,
                  cilindraje: motoActiva.cilindraje,
                  soatVigente: motoActiva.soatVigente,
                  numeroSoat: motoActiva.numeroSoat
                }
              : null,
            motos: m.motos.map((moto) => ({
              placa: moto.placa,
              descripcion: moto.descripcionCorta,
              activa: moto.activa,
              soatVigente: moto.soatVigente,
              numeroSoat: moto.numeroSoat
            }))
          };
        })
      : rol === "motorista" && userId
        ? facade
            .obtenerMotoristas()
            .filter((m) => m.identificacion === userId)
            .map((m) => {
              const motoActiva = m.obtenerMotoActiva();
              return {
                identificacion: m.identificacion,
                nombre: m.nombre,
                telefono: m.telefono,
                correo: m.correoInstitucional,
                estadoAprobacion: m.estadoAprobacion,
                disponible: m.disponible,
                latitud: m.ubicacionActual.latitud,
                longitud: m.ubicacionActual.longitud,
                direccionGrados: m.direccionGrados,
                motoActiva: motoActiva
                  ? {
                      placa: motoActiva.placa,
                      marca: motoActiva.marca,
                      modelo: motoActiva.modelo,
                      cilindraje: motoActiva.cilindraje,
                      soatVigente: motoActiva.soatVigente,
                      numeroSoat: motoActiva.numeroSoat
                    }
                  : null,
                motos: []
              };
            })
        : [];

  const viajesFiltrados =
    rol === "admin"
      ? todosViajes
      : rol === "pasajero" && userId
        ? todosViajes.filter((v) => v.estudiante.identificacion === userId)
        : rol === "motorista" && userId
          ? todosViajes.filter(
              (v) => v.estado.nombre === "SOLICITADO" || v.motorista?.identificacion === userId
            )
          : [];

  const viajes = viajesFiltrados.map((v) => ({
    codigo: v.codigoViaje,
    origen: v.origen,
    destino: v.destino,
    distanciaKm: v.distanciaKm,
    tarifa: v.tarifa,
    estrategia: v.estrategiaTarifa.nombre,
    estado: v.estado.nombre,
    motivoCancelacion: v.motivoCancelacion ?? null,
    llegadaSeguraConfirmada: v.llegadaSeguraConfirmada,
    fechaLlegadaSegura: v.fechaLlegadaSegura ? v.fechaLlegadaSegura.toISOString() : null,
    pinSeguridad: rol === "motorista" ? null : v.pinSeguridad,
    progresoRuta: v.progresoRuta,
    etapaTracking: v.etapaTracking,
    ubicacionMotoristaLat: v.ubicacionMotoristaLat ?? null,
    ubicacionMotoristaLng: v.ubicacionMotoristaLng ?? null,
    direccionMotoristaGrados: v.direccionMotoristaGrados,
    estudiante: {
      id: v.estudiante.identificacion,
      nombre: v.estudiante.nombre
    },
    motorista: v.motorista
      ? {
          id: v.motorista.identificacion,
          nombre: v.motorista.nombre,
          placaMoto: v.motorista.obtenerMotoActiva()?.placa || "Sin moto",
          soatVigente: v.motorista.obtenerMotoActiva()?.soatVigente ?? true
        }
      : null,
    pago: {
      monto: v.pago.monto,
      metodo: v.pago.metodo,
      estado: v.pago.estado
    },
    calificaciones: v.calificaciones.map((c) => ({
      puntuacion: c.puntuacion,
      comentario: c.comentario,
      autor: c.autorIdentificacion
    })),
    fecha: v.fechaCreacion.toISOString()
  }));

  // Métricas segmentadas por rol: la fachada decide qué ve cada uno.
  const metricas = facade.obtenerMetricasPorRol(rol, userId);

  return {
    rolActivo: rol ?? null,
    metricas,
    sectores: facade.obtenerSectoresCampus().map(serializarSector),
    estudiantes,
    motoristas,
    viajes,
    analiticaAdmin: rol === "admin" ? facade.obtenerAnaliticaAdmin() : null,
    bitacoraAuditoria: rol === "admin" ? facade.obtenerBitacoraAuditoria() : [],
    tucanesPendientes:
      rol === "admin"
        ? facade.obtenerTucanesPendientes().map((m) => ({
            identificacion: m.identificacion,
            nombre: m.nombre,
            telefono: m.telefono,
            correo: m.correoInstitucional,
            estadoAprobacion: m.estadoAprobacion,
            fotoRostroUrl: m.fotoRostroUrl,
            fotoCedulaUrl: m.fotoCedulaUrl,
            fotoMotoUrl: m.fotoMotoUrl,
            fotoSoatUrl: m.fotoSoatUrl,
            fotoLicenciaUrl: m.fotoLicenciaUrl,
            numeroLicencia: m.numeroLicencia,
            compromisoAceptado: m.compromisoAceptado,
            fechaAprobacion: m.fechaAprobacion?.toISOString() ?? null,
            moto: m.obtenerMotoActiva()
              ? {
                  placa: m.obtenerMotoActiva()!.placa,
                  marca: m.obtenerMotoActiva()!.marca,
                  modelo: m.obtenerMotoActiva()!.modelo,
                  cilindraje: m.obtenerMotoActiva()!.cilindraje,
                  soatVigente: m.obtenerMotoActiva()!.soatVigente,
                  numeroSoat: m.obtenerMotoActiva()!.numeroSoat
                }
              : null
          }))
        : [],
    tucanesExpedientes:
      rol === "admin"
        ? facade.obtenerMotoristas().map((m) => ({
            identificacion: m.identificacion,
            nombre: m.nombre,
            telefono: m.telefono,
            correo: m.correoInstitucional,
            disponible: m.disponible,
            estadoAprobacion: m.estadoAprobacion,
            fotoRostroUrl: m.fotoRostroUrl,
            fotoCedulaUrl: m.fotoCedulaUrl,
            fotoMotoUrl: m.fotoMotoUrl,
            fotoSoatUrl: m.fotoSoatUrl,
            fotoLicenciaUrl: m.fotoLicenciaUrl,
            numeroLicencia: m.numeroLicencia,
            compromisoAceptado: m.compromisoAceptado,
            fechaAprobacion: m.fechaAprobacion?.toISOString() ?? null,
            correoBienvenidaEnviado: m.correoBienvenidaEnviado,
            moto: m.obtenerMotoActiva()
              ? {
                  placa: m.obtenerMotoActiva()!.placa,
                  marca: m.obtenerMotoActiva()!.marca,
                  modelo: m.obtenerMotoActiva()!.modelo,
                  cilindraje: m.obtenerMotoActiva()!.cilindraje,
                  soatVigente: m.obtenerMotoActiva()!.soatVigente,
                  numeroSoat: m.obtenerMotoActiva()!.numeroSoat
                }
              : null
          }))
        : [],
    notificacionesCorreo: rol === "admin" ? facade.obtenerNotificacionesCorreo() : []
  };
}

function resolverArchivoPublico(publicDir: string, pathname: string): string | null {
  const baseResuelta = path.resolve(publicDir);
  const limpio =
    pathname === "/"
      ? "index.html"
      : pathname === "/login" || pathname === "/login/"
        ? "login.html"
        : pathname === "/politicas" || pathname === "/politicas/"
          ? "politicas.html"
          : pathname === "/favicon.ico" || pathname === "/favicon.svg"
          ? "assets/brand/tucango-moto-logo.svg"
          : pathname.replace(/^\/+/, "");
  const candidato = path.resolve(baseResuelta, limpio);
  if (candidato !== baseResuelta && !candidato.startsWith(baseResuelta + path.sep)) {
    return null;
  }
  return candidato;
}

interface ClienteSse {
  res: http.ServerResponse;
  rol: "admin" | "pasajero" | "motorista";
  identificacion: string;
}

/**
 * Un cliente solo recibe eventos que le conciernen. El administrador ve la
 * operación completa; nadie más recibe PII de terceros ni ubicaciones ajenas.
 */
function eventoVisiblePara(cliente: ClienteSse, evento: EventoDominio): boolean {
  if (cliente.rol === "admin") return true;
  const payload = evento.payload || {};
  const esPropio = payload.identificacion === cliente.identificacion;
  const esEstudiante = payload.estudianteId === cliente.identificacion;
  const esMotorista = payload.motoristaId === cliente.identificacion;

  switch (evento.tipo) {
    case "USUARIO_AUTENTICADO":
    case "TUCAN_APROBADO":
    case "TUCAN_RECHAZADO":
    case "PERFIL_ACTUALIZADO":
    case "PASSWORD_CAMBIADO":
      return esPropio;
    case "UBICACION_FRECUENTE_ACTUALIZADA":
      return esEstudiante;
    case "MOTORISTA_DISPONIBILIDAD_CAMBIADA":
      return esMotorista;
    case "VIAJE_SOLICITADO":
      // La cola de solicitudes la consumen los Tucanes y no incluye datos
      // personales del estudiante.
      return cliente.rol === "motorista";
    case "VIAJE_ACEPTADO":
    case "VIAJE_INICIADO":
    case "VIAJE_FINALIZADO":
    case "VIAJE_CANCELADO":
    case "VIAJE_CALIFICADO":
    case "LLEGADA_SEGURA_CONFIRMADA":
    case "TRACKING_VIAJE_ACTUALIZADO":
    case "UBICACION_MOTORISTA_ACTUALIZADA":
      return esEstudiante || esMotorista;
    default:
      return false;
  }
}

export function crearServidor(
  facade: TucanGoFacade,
  options: { persistencia?: string; publicDir?: string } = {}
): http.Server {
  const publicDir = options.publicDir || DEFAULT_PUBLIC_DIR;
  const persistencia = options.persistencia || "memoria";
  const clientesSse = new Set<ClienteSse>();

  const desuscribirBus = facade.obtenerEventBus().suscribir((evento: EventoDominio) => {
    const trama = `event: dominio\ndata: ${JSON.stringify(evento)}\n\n`;
    for (const cliente of clientesSse) {
      if (!cliente.res.writableEnded && eventoVisiblePara(cliente, evento)) {
        cliente.res.write(trama);
      }
    }
  });

  const keepaliveTimer = setInterval(() => {
    for (const cliente of clientesSse) {
      if (!cliente.res.writableEnded) {
        cliente.res.write(": keepalive\n\n");
      }
    }
  }, 25000);
  keepaliveTimer.unref();

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = url.pathname;

    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        ...SECURITY_HEADERS
      });
      res.end();
      return;
    }

    try {
      if (pathname === "/" || pathname === "/index.html") {
        const sesion = obtenerSesionRequest(req, facade);
        redirectTo(res, sesion ? "/app" : "/login");
        return;
      }

      if (pathname === "/app" || pathname === "/app/") {
        const sesion = obtenerSesionRequest(req, facade);
        if (!sesion) {
          redirectTo(res, "/login");
          return;
        }
        const appHtml = path.join(path.resolve(publicDir), "index.html");
        serveStatic(res, appHtml, "text/html", "no-store, private");
        return;
      }

      if (pathname === "/api/salud" && req.method === "GET") {
        sendJson(res, 200, {
          ok: true,
          version: "beta-v1",
          persistencia,
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (pathname === "/api/eventos" && req.method === "GET") {
        const sesion = obtenerSesionRequest(req, facade);
        if (!sesion) {
          sendJson(res, 401, { error: "Sesión no autenticada o expirada." });
          return;
        }
        res.writeHead(200, {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
          ...SECURITY_HEADERS
        });
        const cliente: ClienteSse = {
          res,
          rol: sesion.rol as ClienteSse["rol"],
          identificacion: sesion.identificacion
        };
        res.write(
          `event: conectado\ndata: ${JSON.stringify({
            timestamp: new Date().toISOString(),
            rol: cliente.rol
          })}\n\n`
        );
        clientesSse.add(cliente);
        req.on("close", () => {
          clientesSse.delete(cliente);
        });
        return;
      }

      if (pathname === "/api/mapa/config" && req.method === "GET") {
        const googleKey = process.env.GOOGLE_MAPS_API_KEY || null;
        const googleMapId =
          process.env.GOOGLE_MAPS_MAP_ID ||
          process.env.GOOGLE_MAPS_MAP_ID_OR_STYLE_ID ||
          "828229759a91b5f6f45066f4";
        const cartoKey = process.env.CARTO_API_KEY || null;
        const tileUrlDidi = cartoKey
          ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(cartoKey)}`
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
        sendJson(res, 200, {
          proveedorActivo: googleKey ? "google_maps" : cartoKey ? "carto_osrm" : "osm_osrm",
          googleMapsApiKey: googleKey,
          googleMapsMapId: googleKey ? googleMapId : null,
          tileUrlDidi,
          osrmRouteUrl: "https://router.project-osrm.org/route/v1/driving",
          googleApisRequeridas: [
            "Maps JavaScript API",
            "Directions API (Routes API)",
            "Places API",
            "Roads API"
          ],
          limiteGeografico: {
            ciudad: "Florencia, Caquetá, Colombia",
            centro: [1.6144, -75.6062],
            zoomInicial: 14,
            minZoom: 12,
            maxZoom: 19,
            bounds: {
              southwest: [1.5200, -75.6800],
              northeast: [1.6600, -75.5400]
            }
          }
        });
        return;
      }

      if (pathname === "/api/sectores" && req.method === "GET") {
        sendJson(res, 200, {
          sectores: facade.obtenerSectoresCampus().map(serializarSector)
        });
        return;
      }

      if (pathname === "/api/ruta" && req.method === "GET") {
        const hasCoords =
          url.searchParams.has("origenLat") &&
          url.searchParams.has("origenLng") &&
          url.searchParams.has("destinoLat") &&
          url.searchParams.has("destinoLng");
        const origenLat = hasCoords ? Number(url.searchParams.get("origenLat")) : NaN;
        const origenLng = hasCoords ? Number(url.searchParams.get("origenLng")) : NaN;
        const destinoLat = hasCoords ? Number(url.searchParams.get("destinoLat")) : NaN;
        const destinoLng = hasCoords ? Number(url.searchParams.get("destinoLng")) : NaN;

        let ruta: any;
        if (
          hasCoords &&
          Number.isFinite(origenLat) &&
          Number.isFinite(origenLng) &&
          Number.isFinite(destinoLat) &&
          Number.isFinite(destinoLng)
        ) {
          ruta = facade.calcularRutaEntreCoordenadas(
            {
              id: url.searchParams.get("origenId") || "ORIGEN_CUSTOM",
              nombre: url.searchParams.get("origenNombre") || "Origen Seleccionado",
              latitud: origenLat,
              longitud: origenLng
            },
            {
              id: url.searchParams.get("destinoId") || "DESTINO_CUSTOM",
              nombre: url.searchParams.get("destinoNombre") || "Destino Seleccionado",
              latitud: destinoLat,
              longitud: destinoLng
            }
          );
        } else {
          const origenId = url.searchParams.get("origenId") || "";
          const destinoId = url.searchParams.get("destinoId") || "";
          const r = facade.calcularRutaEntreSectores(origenId, destinoId);
          ruta = {
            origen: serializarSector(r.origen),
            destino: serializarSector(r.destino),
            distanciaKm: r.distanciaKm,
            tiempoEstimadoMin: r.tiempoEstimadoMin,
            polilinea: r.polilinea,
            direccionInicialGrados: r.direccionInicialGrados
          };
        }

        const distanciaParaTarifa = Math.max(0.5, ruta.distanciaKm);
        const tarifas = {
          estudiantil: facade.cotizarTarifa(distanciaParaTarifa, "estudiantil"),
          distancia: facade.cotizarTarifa(distanciaParaTarifa, "distancia"),
          lluvia: facade.cotizarTarifa(distanciaParaTarifa, "lluvia"),
          nocturna: facade.cotizarTarifa(distanciaParaTarifa, "nocturna")
        };
        sendJson(res, 200, {
          ...ruta,
          tarifas
        });
        return;
      }

      if (pathname === "/api/cotizar" && req.method === "GET") {
        const rawDist = Number(url.searchParams.get("distanciaKm"));
        const distanciaParaTarifa = Number.isFinite(rawDist) && rawDist > 0 ? Math.max(0.5, rawDist) : 1.0;
        sendJson(res, 200, {
          distanciaKm: Number(distanciaParaTarifa.toFixed(2)),
          tarifas: {
            estudiantil: facade.cotizarTarifa(distanciaParaTarifa, "estudiantil"),
            distancia: facade.cotizarTarifa(distanciaParaTarifa, "distancia"),
            lluvia: facade.cotizarTarifa(distanciaParaTarifa, "lluvia"),
            nocturna: facade.cotizarTarifa(distanciaParaTarifa, "nocturna")
          }
        });
        return;
      }

      if (pathname === "/api/estado" && req.method === "GET") {
        const sesion = obtenerSesionRequest(req, facade);
        sendJson(res, 200, construirEstadoDTO(facade, sesion));
        return;
      }

      if (pathname === "/api/estudiante/ubicaciones" && req.method === "GET") {
        const auth = requerirRol(req, res, facade, "pasajero");
        if (!auth) return;
        const perfil = facade.obtenerPerfilUsuario("pasajero", auth.identificacion) as any;
        sendJson(res, 200, {
          ok: true,
          barrioResidencia: perfil.barrioResidencia || "Sin especificar",
          ubicaciones: perfil.ubicacionesFrecuentes || []
        });
        return;
      }

      if (pathname === "/api/estudiante/ubicaciones" && req.method === "POST") {
        const auth = requerirRol(req, res, facade, "pasajero");
        if (!auth) return;
        const body = await parseJsonBody<{
          id?: string;
          etiqueta: string;
          nombre: string;
          barrio?: string;
          referencia?: string;
          latitud: number;
          longitud: number;
        }>(req);
        const guardada = facade.registrarUbicacionEstudiante(auth.identificacion, body);
        sendJson(res, 201, { ok: true, ubicacion: guardada });
        return;
      }

      if (pathname === "/api/estudiante/ubicaciones" && req.method === "DELETE") {
        const auth = requerirRol(req, res, facade, "pasajero");
        if (!auth) return;
        const id = url.searchParams.get("id") || "";
        const eliminada = facade.eliminarUbicacionEstudiante(auth.identificacion, id);
        sendJson(res, 200, { ok: true, eliminada });
        return;
      }

      if (pathname === "/api/catalogos/programas" && req.method === "GET") {
        // Oferta oficial de pregrado: dato institucional público.
        sendJson(res, 200, {
          programas: facade.obtenerProgramasAcademicos()
        });
        return;
      }

      if (pathname === "/api/catalogos/barrios" && req.method === "GET") {
        // División oficial por comunas y barrios de Florencia, Caquetá.
        sendJson(res, 200, {
          comunas: facade.obtenerBarriosFlorencia()
        });
        return;
      }

      if (pathname === "/api/admin/analitica" && req.method === "GET") {
        const auth = requerirRol(req, res, facade, "admin");
        if (!auth) return;
        sendJson(res, 200, {
          ok: true,
          analitica: facade.obtenerAnaliticaAdmin()
        });
        return;
      }

      if (pathname === "/api/admin/auditoria/eventos" && req.method === "GET") {
        const auth = requerirRol(req, res, facade, "admin");
        if (!auth) return;
        sendJson(res, 200, {
          ok: true,
          eventos: facade.obtenerBitacoraAuditoria()
        });
        return;
      }

      // B6, B8, B9, B10, B11: Endpoint Login endurecido
      if (pathname === "/api/auth/login" && req.method === "POST") {
        const ip = obtenerClienteIp(req);
        const rateCheckIp = verificarRateLimit(`ip:${ip}`, 10, 60000);
        if (!rateCheckIp.permitido) {
          sendJson(
            res,
            429,
            { error: `Demasiados intentos fallidos. Intenta nuevamente en ${rateCheckIp.retryAfterSegundos} segundos.` },
            { "Retry-After": String(rateCheckIp.retryAfterSegundos) }
          );
          return;
        }

        const body = await parseJsonBody<{
          identificador?: string;
          password?: string;
        }>(req);

        const identificador = (body.identificador || "").trim();
        if (!identificador || !body.password || body.password.trim().length === 0) {
          sendJson(res, 401, { error: "Credenciales inválidas." });
          return;
        }

        const rateCheckUser = verificarRateLimit(`user:${identificador.toLowerCase()}`, 5, 60000);
        if (!rateCheckUser.permitido) {
          sendJson(
            res,
            429,
            { error: `Demasiados intentos para esta cuenta. Intenta nuevamente en ${rateCheckUser.retryAfterSegundos} segundos.` },
            { "Retry-After": String(rateCheckUser.retryAfterSegundos) }
          );
          return;
        }

        try {
          // B8: Iniciar sesión valida credenciales de forma asíncrona; el rol se deriva de la cuenta (B9)
          const sesion = await facade.iniciarSesion(identificador, body.password);
          resetearRateLimit(`ip:${ip}`);
          resetearRateLimit(`user:${identificador.toLowerCase()}`);

          // B4: Asignar jti único para revocabilidad en logout
          const jti = crypto.randomUUID();
          const token = firmarSesionCookie({
            rol: sesion.rol,
            identificacion: sesion.identificacion,
            exp: Date.now() + 8 * 3600 * 1000, // 8h TTL
            jti,
            kid: ACTIVE_KID
          });

          sendJson(res, 200, sesion, {
            "Set-Cookie": construirSetCookie(req, token, 8 * 3600)
          });
        } catch (authErr) {
          registrarFalloRateLimit(`ip:${ip}`);
          registrarFalloRateLimit(`user:${identificador.toLowerCase()}`);

          if (authErr instanceof AuthError) {
            sendJson(res, authErr.statusHttp, { error: authErr.message });
          } else {
            sendJson(res, 401, { error: "Credenciales inválidas." });
          }
        }
        return;
      }

      if (pathname === "/api/auth/me" && req.method === "GET") {
        const sesion = obtenerSesionRequest(req, facade);
        if (!sesion) {
          sendJson(res, 200, { autenticado: false, usuario: null });
          return;
        }
        sendJson(res, 200, { autenticado: true, usuario: sesion.usuario });
        return;
      }

      // B4: Revocar jti en logout
      if (pathname === "/api/auth/logout" && req.method === "POST") {
        const sesion = obtenerSesionRequest(req, facade);
        if (sesion && sesion.payload && sesion.payload.jti && facade.repository) {
          facade.repository.revocarSesion(sesion.payload.jti, sesion.payload.exp);
        }
        sendJson(
          res,
          200,
          { ok: true },
          { "Set-Cookie": construirSetCookie(req, "", 0) }
        );
        return;
      }

      if (pathname === "/api/auth/perfil" && req.method === "GET") {
        const sesion = obtenerSesionRequest(req, facade);
        if (!sesion) {
          sendJson(res, 401, { error: "Debes iniciar sesión para consultar tu perfil." });
          return;
        }
        let rolEfectivo: "pasajero" | "motorista" | "admin" = sesion.rol;
        let idEfectivo = sesion.identificacion;
        if (sesion.rol === "admin") {
          const targetRol = url.searchParams.get("rol");
          const targetId = url.searchParams.get("identificacion");
          if (
            (targetRol === "pasajero" || targetRol === "motorista" || targetRol === "admin") &&
            targetId
          ) {
            rolEfectivo = targetRol;
            idEfectivo = targetId;
          }
        }
        const perfil = facade.obtenerPerfilUsuario(rolEfectivo, idEfectivo);
        sendJson(res, 200, { ok: true, perfil });
        return;
      }

      if (pathname === "/api/auth/perfil" && (req.method === "POST" || req.method === "PUT")) {
        const sesion = obtenerSesionRequest(req, facade);
        if (!sesion) {
          sendJson(res, 401, { error: "Debes iniciar sesión para editar tu perfil." });
          return;
        }
        const body = await parseJsonBody<
          ActualizarPerfilDTO & {
            passwordActual?: string;
            passwordNueva?: string;
            targetRol?: string;
            targetId?: string;
          }
        >(req);

        let rolEfectivo: "pasajero" | "motorista" | "admin" = sesion.rol;
        let idEfectivo = sesion.identificacion;
        if (
          sesion.rol === "admin" &&
          (body.targetRol === "pasajero" || body.targetRol === "motorista" || body.targetRol === "admin") &&
          body.targetId
        ) {
          rolEfectivo = body.targetRol;
          idEfectivo = body.targetId;
        }

        if (body.passwordActual && body.passwordNueva) {
          await facade.cambiarPassword(idEfectivo, rolEfectivo, body.passwordActual, body.passwordNueva);
        }

        const perfil = facade.actualizarPerfilUsuario(rolEfectivo, idEfectivo, body);
        sendJson(res, 200, { ok: true, perfil });
        return;
      }

      // B3: Motoristas disponibilidad
      if (pathname === "/api/motoristas/disponibilidad" && req.method === "POST") {
        const auth = requerirRol(req, res, facade, "motorista");
        if (!auth) return;
        const body = await parseJsonBody<{ motoristaId?: string; disponible: boolean }>(req);
        const motoristaId =
          auth.rol === "admin" && body.motoristaId ? body.motoristaId : auth.identificacion;
        const mot = facade.cambiarDisponibilidadMotorista(motoristaId, body.disponible);
        sendJson(res, 200, {
          identificacion: mot.identificacion,
          nombre: mot.nombre,
          disponible: mot.disponible
        });
        return;
      }

      // B3: Motoristas ubicación
      if (pathname === "/api/motoristas/ubicacion" && req.method === "POST") {
        const auth = requerirRol(req, res, facade, "motorista");
        if (!auth) return;
        const body = await parseJsonBody<{
          motoristaId?: string;
          latitud: number;
          longitud: number;
          direccionGrados?: number;
        }>(req);
        const motoristaId =
          auth.rol === "admin" && body.motoristaId ? body.motoristaId : auth.identificacion;
        const mot = facade.actualizarUbicacionMotorista(
          motoristaId,
          body.latitud,
          body.longitud,
          body.direccionGrados
        );
        sendJson(res, 200, {
          identificacion: mot.identificacion,
          latitud: mot.ubicacionActual.latitud,
          longitud: mot.ubicacionActual.longitud,
          direccionGrados: mot.direccionGrados
        });
        return;
      }

      // B13: Registro público de estudiante con rate limiting y password obligatoria
      if (pathname === "/api/estudiantes" && req.method === "POST") {
        const ip = obtenerClienteIp(req);
        const rateCheck = verificarRateLimit(`reg:${ip}`, 10, 600000);
        if (!rateCheck.permitido) {
          sendJson(
            res,
            429,
            { error: `Demasiados registros desde esta IP. Espera ${rateCheck.retryAfterSegundos} segundos.` },
            { "Retry-After": String(rateCheck.retryAfterSegundos) }
          );
          return;
        }

        const body = await parseJsonBody<{
          identificacion: string;
          nombre: string;
          telefono: string;
          correoInstitucional: string;
          codigoEstudiantil: string;
          carrera: string;
          barrioResidencia?: string;
          usuario?: string;
          password?: string;
        }>(req);

        if (!body.password || body.password.trim().length === 0) {
          sendJson(res, 422, { error: "La contraseña es obligatoria (mínimo 10 caracteres)." });
          return;
        }

        const est = facade.registrarEstudiante(body);
        sendJson(res, 201, {
          mensaje: "Estudiante registrado en la comunidad TucanGo",
          identificacion: est.identificacion,
          nombre: est.nombre,
          usuario: est.usuario
        });
        return;
      }

      // Registro de Motorista / Onboarding Aspirante a Tucán (con Políticas y Compromiso Institucional)
      if ((pathname === "/api/tucanes/registro" || pathname === "/api/motoristas") && req.method === "POST") {
        // El registro público de Tucanes es la única vía anónima. El alta
        // administrativa directa exige sesión de administrador.
        if (pathname === "/api/motoristas") {
          const auth = requerirRol(req, res, facade, "admin");
          if (!auth) return;
        }
        const esRutaTucanes = pathname === "/api/tucanes/registro";
        const ip = obtenerClienteIp(req);
        const rateCheck = verificarRateLimit(`reg:${ip}`, 10, 600000);
        if (!rateCheck.permitido) {
          sendJson(
            res,
            429,
            { error: `Demasiados registros desde esta IP. Espera ${rateCheck.retryAfterSegundos} segundos.` },
            { "Retry-After": String(rateCheck.retryAfterSegundos) }
          );
          return;
        }

        // Tope global: no depende de headers ni de la IP, así que no se puede
        // rotar para inundar la base con registros de hasta 2 MB.
        const rateCheckGlobal = verificarRateLimit("global:registro", 30, 60000);
        if (!rateCheckGlobal.permitido) {
          sendJson(
            res,
            429,
            { error: "El servicio de registro está saturado. Intenta nuevamente en unos segundos." },
            { "Retry-After": String(rateCheckGlobal.retryAfterSegundos) }
          );
          return;
        }
        registrarFalloRateLimit(`reg:${ip}`, 10, 600000);
        registrarFalloRateLimit("global:registro", 30, 60000);

        const body = await parseJsonBody<{
          identificacion: string;
          nombre: string;
          telefono: string;
          correoInstitucional?: string;
          correoPersonal?: string;
          placa: string;
          marca: string;
          modelo: string;
          cilindraje: number;
          soatVigente: boolean;
          numeroSoat?: string;
          password?: string;
          fotoRostroUrl?: string;
          fotoCedulaUrl?: string;
          fotoMotoUrl?: string;
          fotoSoatUrl?: string;
          fotoLicenciaUrl?: string;
          numeroLicencia?: string;
          compromisoAceptado?: boolean;
          estadoAprobacion?: "PENDIENTE_APROBACION" | "ACTIVO" | "RECHAZADO";
        }>(req, esRutaTucanes ? 2 * 1024 * 1024 : MAX_BODY_BYTES);

        const correoContacto = (body.correoPersonal || body.correoInstitucional || "").trim();

        if (!body.password || body.password.trim().length === 0) {
          sendJson(res, 422, { error: "La contraseña es obligatoria (mínimo 10 caracteres)." });
          return;
        }

        if (esRutaTucanes && body.compromisoAceptado === false) {
          sendJson(res, 422, {
            error: "Debes aceptar solemnemente cumplir las políticas y normas de movilidad de la Universidad de la Amazonia para postular tu Licencia Tucán."
          });
          return;
        }

        // El Tucán no es estudiante: su correo de contacto debe ser personal.
        if (esRutaTucanes && esCorreoInstitucional(correoContacto)) {
          sendJson(res, 422, {
            error:
              "El correo del Tucán debe ser personal. El correo institucional (@uniamazonia.edu.co / @udla.edu.co) es exclusivo de estudiantes."
          });
          return;
        }

        const estadoAprobacion = esRutaTucanes
          ? "PENDIENTE_APROBACION"
          : (body.estadoAprobacion ?? "PENDIENTE_APROBACION");

        // Un Tucán habilitado necesita expediente completo, venga del registro
        // público o de un alta administrativa.
        if (esRutaTucanes || estadoAprobacion === "ACTIVO") {
          const documentosRequeridos: Array<[string, string]> = [
            [body.fotoRostroUrl || "", "la selfie de reconocimiento facial"],
            [body.fotoCedulaUrl || "", "la fotografía de la cédula"],
            [body.fotoMotoUrl || "", "la fotografía de la motocicleta"],
            [body.fotoSoatUrl || "", "la fotografía de la póliza SOAT"],
            [body.fotoLicenciaUrl || "", "la fotografía de la licencia de conducción"],
            [body.numeroLicencia || "", "el número de la licencia de conducción"]
          ];
          const faltantes = documentosRequeridos
            .filter(([valor]) => !valor.trim())
            .map(([, etiqueta]) => etiqueta);
          if (faltantes.length > 0) {
            sendJson(res, 422, {
              error: `Faltan documentos obligatorios para la hoja de vida: ${faltantes.join(", ")}.`
            });
            return;
          }
        }

        const mot = facade.registrarMotoristaConMoto({
          ...body,
          correoInstitucional: correoContacto,
          estadoAprobacion
        });

        sendJson(res, 201, {
          mensaje:
            estadoAprobacion === "PENDIENTE_APROBACION"
              ? "Solicitud de Licencia Tucán recibida. Tus documentos y SOAT están en proceso de auditoría por la administración. Pronto nos pondremos en contacto contigo vía correo electrónico o WhatsApp."
              : "Motorista y motocicleta verificados con SOAT vigente",
          identificacion: mot.identificacion,
          nombre: mot.nombre,
          placa: mot.obtenerMotoActiva()?.placa || null,
          estadoAprobacion: mot.estadoAprobacion
        });
        return;
      }

      // Endpoints de Auditoría y Aprobación de Tucanes (Exclusivo Administrador)
      if (pathname === "/api/admin/tucanes/pendientes" && req.method === "GET") {
        const auth = requerirRol(req, res, facade, "admin");
        if (!auth) return;
        const pendientes = facade.obtenerTucanesPendientes().map((m) => ({
          identificacion: m.identificacion,
          nombre: m.nombre,
          telefono: m.telefono,
          correo: m.correoInstitucional,
          estadoAprobacion: m.estadoAprobacion,
          fotoRostroUrl: m.fotoRostroUrl,
          fotoCedulaUrl: m.fotoCedulaUrl,
          fotoMotoUrl: m.fotoMotoUrl,
          fotoSoatUrl: m.fotoSoatUrl,
          fotoLicenciaUrl: m.fotoLicenciaUrl,
          numeroLicencia: m.numeroLicencia,
          compromisoAceptado: m.compromisoAceptado,
          moto: m.obtenerMotoActiva()
            ? {
                placa: m.obtenerMotoActiva()!.placa,
                marca: m.obtenerMotoActiva()!.marca,
                modelo: m.obtenerMotoActiva()!.modelo,
                cilindraje: m.obtenerMotoActiva()!.cilindraje,
                soatVigente: m.obtenerMotoActiva()!.soatVigente,
                numeroSoat: m.obtenerMotoActiva()!.numeroSoat
              }
            : null
        }));
        sendJson(res, 200, { pendientes, total: pendientes.length });
        return;
      }

      if (pathname === "/api/admin/tucanes/aprobar" && req.method === "POST") {
        const auth = requerirRol(req, res, facade, "admin");
        if (!auth) return;
        const adminActor = facade.obtenerAdministradorPorIdentificacion(auth.identificacion);
        if (adminActor && !adminActor.puedeGestionarFlota()) {
          sendJson(res, 403, {
            error: "El rol de Auditor Institucional no tiene privilegios para modificar el estado de la flota (Principio de Menor Privilegio)."
          });
          return;
        }
        const body = await parseJsonBody<{ identificacion?: string; identificador?: string }>(req);
        const identificacion = (body.identificacion || body.identificador || "").trim();
        if (!identificacion) {
          sendJson(res, 422, { error: "La identificación del Tucán es obligatoria." });
          return;
        }
        const { tucan, correo } = facade.aprobarTucan(identificacion);
        sendJson(res, 200, {
          ok: true,
          mensaje: `Tucán ${tucan.nombre} aprobado exitosamente. Se ha emitido y enviado el correo institucional de bienvenida.`,
          tucan: {
            identificacion: tucan.identificacion,
            nombre: tucan.nombre,
            estadoAprobacion: tucan.estadoAprobacion
          },
          correo
        });
        return;
      }

      if (pathname === "/api/admin/tucanes/rechazar" && req.method === "POST") {
        const auth = requerirRol(req, res, facade, "admin");
        if (!auth) return;
        const adminActor = facade.obtenerAdministradorPorIdentificacion(auth.identificacion);
        if (adminActor && !adminActor.puedeGestionarFlota()) {
          sendJson(res, 403, {
            error: "El rol de Auditor Institucional no tiene privilegios para modificar el estado de la flota (Principio de Menor Privilegio)."
          });
          return;
        }
        const body = await parseJsonBody<{ identificacion?: string; identificador?: string; motivo?: string }>(req);
        const identificacion = (body.identificacion || body.identificador || "").trim();
        if (!identificacion) {
          sendJson(res, 422, { error: "La identificación del Tucán es obligatoria." });
          return;
        }
        const tucan = facade.rechazarTucan(identificacion, body.motivo);
        sendJson(res, 200, {
          ok: true,
          mensaje: `Solicitud del Tucán ${tucan.nombre} rechazada.`,
          tucan: {
            identificacion: tucan.identificacion,
            nombre: tucan.nombre,
            estadoAprobacion: tucan.estadoAprobacion,
            motivo: tucan.motivoRechazo
          }
        });
        return;
      }

      if (pathname === "/api/admin/notificaciones" && req.method === "GET") {
        const auth = requerirRol(req, res, facade, "admin");
        if (!auth) return;
        sendJson(res, 200, {
          notificaciones: facade.obtenerNotificacionesCorreo()
        });
        return;
      }

      // §6 Auditoría: Endpoint autenticado para consulta de documentos cifrados
      if (pathname.startsWith("/api/admin/documentos/") && req.method === "GET") {
        const auth = requerirRol(req, res, facade, "admin");
        if (!auth) return;
        const partes = pathname.split("/").filter(Boolean);
        const tucanId = partes[3];
        const tipoDoc = partes[4];
        if (!tucanId || !tipoDoc) {
          sendJson(res, 400, { error: "Faltan parámetros identificacion o tipo en la ruta." });
          return;
        }
        const dataUrl = facade.obtenerDocumentoTucanDescifrado(auth.identificacion, tucanId, tipoDoc);
        if (!dataUrl) {
          sendJson(res, 404, { error: "Documento no encontrado o no disponible." });
          return;
        }
        sendJson(res, 200, {
          ok: true,
          identificacion: tucanId,
          tipo: tipoDoc,
          documentoUrl: dataUrl
        });
        return;
      }

      // B3: Solicitar viaje — actor estrictamente desde la sesión verificada
      if (pathname === "/api/viajes/solicitar" && req.method === "POST") {
        const auth = requerirRol(req, res, facade, "pasajero");
        if (!auth) return;

        const body = await parseJsonBody<{
          estudianteId?: string;
          origenId?: string;
          destinoId?: string;
          tipoTarifa?: string;
          metodoPago?: string;
        }>(req);

        const estudianteId =
          auth.rol === "admin" && body.estudianteId ? body.estudianteId : auth.identificacion;

        if (!body.origenId || !body.destinoId) {
          sendJson(res, 422, {
            error: "El origen y el destino son obligatorios para calcular la tarifa del viaje."
          });
          return;
        }

        let ruta: ReturnType<typeof facade.calcularRutaEntreSectores>;
        try {
          ruta = facade.calcularRutaEntreSectores(body.origenId, body.destinoId);
        } catch {
          sendJson(res, 422, {
            error: "El origen o el destino no pertenecen al catálogo de sectores del campus."
          });
          return;
        }

        const viaje = facade.solicitarViaje(
          estudianteId,
          ruta.origen.nombre,
          ruta.destino.nombre,
          ruta.distanciaKm,
          body.tipoTarifa || "estudiantil",
          (body.metodoPago || "EFECTIVO") as any
        );

        sendJson(res, 201, {
          mensaje: "Viaje solicitado con éxito",
          codigo: viaje.codigoViaje,
          tarifa: viaje.tarifa,
          estado: viaje.estado.nombre,
          pinSeguridad: viaje.pinSeguridad
        });
        return;
      }

      // B3: Aceptar viaje — motorista estrictamente desde sesión
      if (pathname === "/api/viajes/aceptar" && req.method === "POST") {
        const auth = requerirRol(req, res, facade, "motorista");
        if (!auth) return;

        const body = await parseJsonBody<{ codigoViaje: string; motoristaId?: string }>(req);
        const motoristaId =
          auth.rol === "admin" && body.motoristaId ? body.motoristaId : auth.identificacion;

        const viaje = facade.aceptarViaje(body.codigoViaje, motoristaId);
        sendJson(res, 200, {
          mensaje: "Viaje aceptado por el motorista",
          codigo: viaje.codigoViaje,
          estado: viaje.estado.nombre,
          motorista: viaje.motorista?.nombre
        });
        return;
      }

      if (pathname === "/api/viajes/tracking" && req.method === "POST") {
        const auth = requerirSesion(req, res, facade);
        if (!auth) return;

        const body = await parseJsonBody<{ codigoViaje: string; incremento?: number }>(req);
        if (!verificarPropiedadViaje(res, facade, auth, body.codigoViaje, "participante")) return;

        const viaje = facade.avanzarSimulacionViaje(body.codigoViaje, body.incremento ?? 25);
        sendJson(res, 200, {
          codigo: viaje.codigoViaje,
          estado: viaje.estado.nombre,
          etapaTracking: viaje.etapaTracking,
          progresoRuta: viaje.progresoRuta,
          latitud: viaje.ubicacionMotoristaLat,
          longitud: viaje.ubicacionMotoristaLng,
          direccionGrados: viaje.direccionMotoristaGrados
        });
        return;
      }

      if (pathname === "/api/viajes/iniciar" && req.method === "POST") {
        const auth = requerirRol(req, res, facade, "motorista");
        if (!auth) return;

        // El PIN tiene 9.000 combinaciones: se limita el intento por conductor.
        const ratePin = verificarRateLimit(`pin:${auth.identificacion}`, 5, 60000);
        if (!ratePin.permitido) {
          sendJson(res, 429, {
            error: `Demasiados intentos de PIN. Espera ${ratePin.retryAfterSegundos} segundos.`
          });
          return;
        }
        registrarFalloRateLimit(`pin:${auth.identificacion}`, 5, 60000);

        const body = await parseJsonBody<{ codigoViaje: string; pinSeguridad?: string }>(req);
        if (!body.pinSeguridad || !body.pinSeguridad.trim()) {
          sendJson(res, 422, {
            error: "El PIN de seguridad del estudiante es obligatorio para iniciar el viaje."
          });
          return;
        }
        if (!verificarPropiedadViaje(res, facade, auth, body.codigoViaje, "motorista")) return;

        const viaje = facade.iniciarViaje(body.codigoViaje, body.pinSeguridad);
        resetearRateLimit(`pin:${auth.identificacion}`);
        sendJson(res, 200, {
          mensaje: "Viaje en marcha",
          codigo: viaje.codigoViaje,
          estado: viaje.estado.nombre
        });
        return;
      }

      if (pathname === "/api/viajes/finalizar" && req.method === "POST") {
        const auth = requerirRol(req, res, facade, "motorista");
        if (!auth) return;

        const body = await parseJsonBody<{ codigoViaje: string }>(req);
        if (!verificarPropiedadViaje(res, facade, auth, body.codigoViaje, "motorista")) return;

        const viaje = facade.finalizarViaje(body.codigoViaje);
        sendJson(res, 200, {
          mensaje: "Viaje finalizado y pago procesado",
          codigo: viaje.codigoViaje,
          estado: viaje.estado.nombre,
          pago: viaje.pago.estado
        });
        return;
      }

      if (pathname === "/api/viajes/llegada-segura" && req.method === "POST") {
        const auth = requerirRol(req, res, facade, "pasajero");
        if (!auth) return;

        const body = await parseJsonBody<{ codigoViaje: string }>(req);
        if (!verificarPropiedadViaje(res, facade, auth, body.codigoViaje, "pasajero")) return;

        const viaje = facade.marcarLlegadaSegura(body.codigoViaje);
        sendJson(res, 200, {
          mensaje: "Llegada segura confirmada en campus",
          codigo: viaje.codigoViaje,
          llegadaSeguraConfirmada: viaje.llegadaSeguraConfirmada,
          fechaLlegadaSegura: viaje.fechaLlegadaSegura?.toISOString()
        });
        return;
      }

      if (pathname === "/api/viajes/cancelar" && req.method === "POST") {
        const auth = requerirSesion(req, res, facade);
        if (!auth) return;

        const body = await parseJsonBody<{ codigoViaje: string; motivo: string }>(req);
        if (!verificarPropiedadViaje(res, facade, auth, body.codigoViaje, "participante")) return;

        const viaje = facade.cancelarViaje(body.codigoViaje, body.motivo || "Cancelado por usuario");
        sendJson(res, 200, {
          mensaje: "Viaje cancelado",
          codigo: viaje.codigoViaje,
          estado: viaje.estado.nombre
        });
        return;
      }

      if (pathname === "/api/viajes/calificar" && req.method === "POST") {
        const auth = requerirRol(req, res, facade, "pasajero");
        if (!auth) return;

        const body = await parseJsonBody<{
          codigoViaje: string;
          puntuacion: number;
          comentario: string;
        }>(req);
        if (!verificarPropiedadViaje(res, facade, auth, body.codigoViaje, "pasajero")) return;

        const autorId = auth.identificacion;
        const viaje = facade.calificarViaje(
          body.codigoViaje,
          body.puntuacion,
          body.comentario,
          autorId
        );
        sendJson(res, 200, {
          mensaje: "Calificación registrada con éxito",
          codigo: viaje.codigoViaje,
          totalCalificaciones: viaje.calificaciones.length
        });
        return;
      }
    } catch (err: any) {
      if (err instanceof AuthError) {
        sendJson(res, err.statusHttp, { error: err.message });
        return;
      }
      // Un fallo no controlado es un 500, no un 400: no se filtra al cliente
      // el mensaje interno (rutas, SQL, detalles de implementación).
      console.error("[tucango] Error no controlado:", err);
      sendJson(res, 500, { error: "Error interno del servidor." });
      return;
    }

    const filePath = resolverArchivoPublico(publicDir, pathname);
    if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      serveStatic(res, filePath, MIME_TYPES[ext] || "text/plain");
      return;
    }

    res.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
      ...SECURITY_HEADERS
    });
    res.end("Ruta no encontrada");
  });

  server.on("close", () => {
    clearInterval(keepaliveTimer);
    desuscribirBus();
    for (const cliente of clientesSse) {
      if (!cliente.res.writableEnded) {
        cliente.res.end();
      }
    }
    clientesSse.clear();
  });

  return server;
}

const esModuloPrincipal =
  Boolean(process.argv[1]) && path.resolve(process.argv[1]) === path.resolve(__filename);

if (esModuloPrincipal) {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");
  const repository = new SqliteSistemaRepository(path.join(DATA_DIR, "tucango.db"));
  const facade = new TucanGoFacade(repository);
  const server = crearServidor(facade, { persistencia: "sqlite" });

  server.listen(PORT, () => {
    console.log(`[TucanGo Web Beta v1] Servidor activo en http://localhost:${PORT}`);
    console.log(`[TucanGo Web Beta v1] Persistencia SQLite WAL: ${repository.dbPath}`);
  });
}
