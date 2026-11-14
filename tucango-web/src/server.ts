import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TucanGoFacade } from "./application/TucanGoFacade.ts";
import { SqliteSistemaRepository } from "./infrastructure/SqliteSistemaRepository.ts";
import type { SectorCampus } from "./domain/model/SectorCampus.ts";
import type { EventoDominio } from "./domain/patterns/EventBus.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_PUBLIC_DIR = path.join(__dirname, "..", "public");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function parseJsonBody<T>(req: http.IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown): void {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(data));
}

function serveStatic(res: http.ServerResponse, filePath: string, contentType: string): void {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found");
      return;
    }
    res.writeHead(200, { "Content-Type": `${contentType}; charset=utf-8` });
    res.end(content);
  });
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

function construirEstadoDTO(facade: TucanGoFacade) {
  const estudiantes = facade.obtenerEstudiantes().map((e) => ({
    identificacion: e.identificacion,
    nombre: e.nombre,
    telefono: e.telefono,
    correo: e.correoInstitucional,
    codigo: e.codigoEstudiantil,
    carrera: e.carrera
  }));

  const motoristas = facade.obtenerMotoristas().map((m) => {
    const motoActiva = m.obtenerMotoActiva();
    return {
      identificacion: m.identificacion,
      nombre: m.nombre,
      telefono: m.telefono,
      correo: m.correoInstitucional,
      disponible: m.disponible,
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
  });

  const viajes = facade.obtenerTodosLosViajes().map((v) => ({
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

  return {
    metricas: facade.obtenerMetricas(),
    sectores: facade.obtenerSectoresCampus().map(serializarSector),
    estudiantes,
    motoristas,
    viajes
  };
}

function resolverArchivoPublico(publicDir: string, pathname: string): string | null {
  const baseResuelta = path.resolve(publicDir);
  const relativo = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const candidato = path.resolve(baseResuelta, relativo);
  if (candidato !== baseResuelta && !candidato.startsWith(baseResuelta + path.sep)) {
    return null;
  }
  return candidato;
}

export function crearServidor(
  facade: TucanGoFacade,
  options: { persistencia?: string; publicDir?: string } = {}
): http.Server {
  const publicDir = options.publicDir || DEFAULT_PUBLIC_DIR;
  const persistencia = options.persistencia || "memoria";
  const clientesSse = new Set<http.ServerResponse>();

  const desuscribirBus = facade.obtenerEventBus().suscribir((evento: EventoDominio) => {
    const trama = `event: dominio\ndata: ${JSON.stringify(evento)}\n\n`;
    for (const cliente of clientesSse) {
      if (!cliente.writableEnded) {
        cliente.write(trama);
      }
    }
  });

  const keepaliveTimer = setInterval(() => {
    for (const cliente of clientesSse) {
      if (!cliente.writableEnded) {
        cliente.write(": keepalive\n\n");
      }
    }
  }, 25000);
  keepaliveTimer.unref();

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = url.pathname;

    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      });
      res.end();
      return;
    }

    try {
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
        res.writeHead(200, {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
          "X-Accel-Buffering": "no"
        });
        res.write(`event: conectado\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
        clientesSse.add(res);
        req.on("close", () => {
          clientesSse.delete(res);
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
        const origenId = url.searchParams.get("origenId") || "";
        const destinoId = url.searchParams.get("destinoId") || "";
        const ruta = facade.calcularRutaEntreSectores(origenId, destinoId);
        const distanciaParaTarifa = Math.max(0.5, ruta.distanciaKm);
        const tarifas = {
          estudiantil: facade.cotizarTarifa(distanciaParaTarifa, "estudiantil"),
          distancia: facade.cotizarTarifa(distanciaParaTarifa, "distancia"),
          lluvia: facade.cotizarTarifa(distanciaParaTarifa, "lluvia"),
          nocturna: facade.cotizarTarifa(distanciaParaTarifa, "nocturna")
        };
        sendJson(res, 200, {
          origen: serializarSector(ruta.origen),
          destino: serializarSector(ruta.destino),
          distanciaKm: ruta.distanciaKm,
          tiempoEstimadoMin: ruta.tiempoEstimadoMin,
          tarifas
        });
        return;
      }

      if (pathname === "/api/estado" && req.method === "GET") {
        sendJson(res, 200, construirEstadoDTO(facade));
        return;
      }

      if (pathname === "/api/estudiantes" && req.method === "POST") {
        const body = await parseJsonBody<{
          identificacion: string;
          nombre: string;
          telefono: string;
          correoInstitucional: string;
          codigoEstudiantil: string;
          carrera: string;
        }>(req);
        const est = facade.registrarEstudiante(body);
        sendJson(res, 201, {
          mensaje: "Estudiante registrado en la comunidad TucanGo",
          identificacion: est.identificacion,
          nombre: est.nombre
        });
        return;
      }

      if (pathname === "/api/motoristas" && req.method === "POST") {
        const body = await parseJsonBody<{
          identificacion: string;
          nombre: string;
          telefono: string;
          correoInstitucional: string;
          placa: string;
          marca: string;
          modelo: string;
          cilindraje: number;
          soatVigente: boolean;
          numeroSoat?: string;
        }>(req);
        const mot = facade.registrarMotoristaConMoto(body);
        sendJson(res, 201, {
          mensaje: "Motorista y motocicleta verificados con SOAT vigente",
          identificacion: mot.identificacion,
          nombre: mot.nombre,
          placa: mot.obtenerMotoActiva()?.placa || null
        });
        return;
      }

      if (pathname === "/api/viajes/solicitar" && req.method === "POST") {
        const body = await parseJsonBody<{
          estudianteId: string;
          origen: string;
          destino: string;
          distanciaKm: number;
          tipoTarifa: string;
          metodoPago: string;
        }>(req);

        const viaje = facade.solicitarViaje(
          body.estudianteId,
          body.origen,
          body.destino,
          body.distanciaKm,
          body.tipoTarifa,
          body.metodoPago as any
        );

        sendJson(res, 201, {
          mensaje: "Viaje solicitado con éxito",
          codigo: viaje.codigoViaje,
          tarifa: viaje.tarifa,
          estado: viaje.estado.nombre
        });
        return;
      }

      if (pathname === "/api/viajes/aceptar" && req.method === "POST") {
        const body = await parseJsonBody<{ codigoViaje: string; motoristaId: string }>(req);
        const viaje = facade.aceptarViaje(body.codigoViaje, body.motoristaId);
        sendJson(res, 200, {
          mensaje: "Viaje aceptado por el motorista",
          codigo: viaje.codigoViaje,
          estado: viaje.estado.nombre,
          motorista: viaje.motorista?.nombre
        });
        return;
      }

      if (pathname === "/api/viajes/iniciar" && req.method === "POST") {
        const body = await parseJsonBody<{ codigoViaje: string }>(req);
        const viaje = facade.iniciarViaje(body.codigoViaje);
        sendJson(res, 200, {
          mensaje: "Viaje en marcha",
          codigo: viaje.codigoViaje,
          estado: viaje.estado.nombre
        });
        return;
      }

      if (pathname === "/api/viajes/finalizar" && req.method === "POST") {
        const body = await parseJsonBody<{ codigoViaje: string }>(req);
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
        const body = await parseJsonBody<{ codigoViaje: string }>(req);
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
        const body = await parseJsonBody<{ codigoViaje: string; motivo: string }>(req);
        const viaje = facade.cancelarViaje(body.codigoViaje, body.motivo || "Cancelado por usuario");
        sendJson(res, 200, {
          mensaje: "Viaje cancelado",
          codigo: viaje.codigoViaje,
          estado: viaje.estado.nombre
        });
        return;
      }

      if (pathname === "/api/viajes/calificar" && req.method === "POST") {
        const body = await parseJsonBody<{
          codigoViaje: string;
          puntuacion: number;
          comentario: string;
          autorId: string;
        }>(req);
        const viaje = facade.calificarViaje(
          body.codigoViaje,
          body.puntuacion,
          body.comentario,
          body.autorId
        );
        sendJson(res, 200, {
          mensaje: "Calificación registrada con éxito",
          codigo: viaje.codigoViaje,
          totalCalificaciones: viaje.calificaciones.length
        });
        return;
      }
    } catch (err: any) {
      sendJson(res, 400, { error: err.message || "Error procesando solicitud" });
      return;
    }

    const filePath = resolverArchivoPublico(publicDir, pathname);
    if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      serveStatic(res, filePath, MIME_TYPES[ext] || "text/plain");
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Ruta no encontrada");
  });

  server.on("close", () => {
    clearInterval(keepaliveTimer);
    desuscribirBus();
    for (const cliente of clientesSse) {
      if (!cliente.writableEnded) {
        cliente.end();
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
