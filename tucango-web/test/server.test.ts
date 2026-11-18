import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";

import { SqliteSistemaRepository } from "../src/infrastructure/SqliteSistemaRepository.ts";
import { TucanGoFacade } from "../src/application/TucanGoFacade.ts";
import { crearServidor } from "../src/server.ts";

// Documento mínimo válido para los expedientes de prueba (PNG 1x1)
const DOC_FOTO =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

// Determinismo: la cuenta administrativa se siembra con una clave conocida
// por los tests y que cumple la política de producción.
process.env.SEED_ADMIN_PASSWORD = "TestAdmin*Segura2026";

describe("TucanGo Beta v1 - API HTTP y Telemetría en Tiempo Real (SSE)", () => {
  it("Expone salud, sectores, cálculo de ruta, registro SOAT, llegada segura y eventos SSE en tiempo real", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tucango-http-"));
    const repo = new SqliteSistemaRepository(path.join(tmpDir, "tucango.db"));
    const facade = new TucanGoFacade(repo);
    const server = crearServidor(facade, { persistencia: "sqlite" });

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const { port } = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${port}`;

    const sseController = new AbortController();

    try {
      const resSalud = await fetch(`${baseUrl}/api/salud`);
      assert.equal(resSalud.status, 200);
      const salud = (await resSalud.json()) as any;
      assert.equal(salud.ok, true);
      assert.equal(salud.persistencia, "sqlite");
      assert.equal(salud.version, "beta-v1");

      const resSectores = await fetch(`${baseUrl}/api/sectores`);
      assert.equal(resSectores.status, 200);
      const sectoresData = (await resSectores.json()) as any;
      assert.equal(Array.isArray(sectoresData.sectores), true);
      assert.equal(sectoresData.sectores.some((s: any) => s.id === "PORVENIR"), true);

      const resRuta = await fetch(`${baseUrl}/api/ruta?origenId=PORVENIR&destinoId=BALCANES`);
      assert.equal(resRuta.status, 200);
      const ruta = (await resRuta.json()) as any;
      assert.equal(ruta.distanciaKm > 5, true);
      assert.equal(ruta.tiempoEstimadoMin >= 3, true);

      // Conectar stream SSE antes de disparar eventos de viaje
      const sseRes = await fetch(`${baseUrl}/api/eventos`, {
        signal: sseController.signal
      });
      assert.equal(sseRes.status, 200);
      assert.match(sseRes.headers.get("content-type") || "", /text\/event-stream/);
      const reader = sseRes.body!.getReader();
      const decoder = new TextDecoder();

      // Consumir handshake inicial conectado
      const firstChunk = await reader.read();
      const firstText = decoder.decode(firstChunk.value || new Uint8Array());
      assert.match(firstText, /conectado/);

      // Las altas administrativas exigen sesión de administrador.
      const adminLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "tucangoadmin", password: "TestAdmin*Segura2026" })
      });
      assert.equal(adminLogin.status, 200);
      const adminCookie = (adminLogin.headers.get("set-cookie") || "").split(";")[0];

      // Validar rechazo SOAT vencido (retorna 422 ValidacionError)
      const resMotInvalido = await fetch(`${baseUrl}/api/motoristas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: adminCookie },
        body: JSON.stringify({
          identificacion: "3001001",
          nombre: "Pedro Pérez",
          telefono: "3112223344",
          correoInstitucional: "p.perez@udla.edu.co",
          placa: "SIN-001",
          marca: "Bajaj",
          modelo: "Boxer",
          cilindraje: 100,
          soatVigente: false,
          numeroLicencia: "LIC-3001-A2",
          password: "PedroPassword*2026"
        })
      });
      assert.equal(resMotInvalido.status, 422);

      // Registrar motorista con SOAT vigente y contraseña segura
      const resMotValido = await fetch(`${baseUrl}/api/motoristas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: adminCookie },
        body: JSON.stringify({
          identificacion: "3002002",
          nombre: "Camila Torres",
          telefono: "3156667788",
          correoInstitucional: "c.torres@udla.edu.co",
          placa: "AMZ-77G",
          marca: "Suzuki",
          modelo: "Gixxer 150",
          cilindraje: 150,
          soatVigente: true,
          numeroSoat: "SOAT-8899",
          numeroLicencia: "LIC-3002-A2",
          password: "CamilaPassword*2026",
          estadoAprobacion: "ACTIVO",
          fotoRostroUrl: DOC_FOTO,
          fotoCedulaUrl: DOC_FOTO,
          fotoMotoUrl: DOC_FOTO,
          fotoSoatUrl: DOC_FOTO,
          fotoLicenciaUrl: DOC_FOTO
        })
      });
      assert.equal(resMotValido.status, 201);

      // Registrar nuevo estudiante
      const resEst = await fetch(`${baseUrl}/api/estudiantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identificacion: "4001001",
          nombre: "Sofía Muñoz",
          telefono: "3189990011",
          correoInstitucional: "s.munoz@udla.edu.co",
          codigoEstudiantil: "20261001",
          carrera: "Derecho (Caquetá)",
          password: "SofiaPassword*2026"
        })
      });
      assert.equal(resEst.status, 201);

      // Iniciar sesión como estudiante para obtener cookie de sesión (B3)
      const estLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "4001001", password: "SofiaPassword*2026" })
      });
      assert.equal(estLogin.status, 200);
      const estCookie = (estLogin.headers.get("set-cookie") || "").split(";")[0];

      // Iniciar sesión como motorista para obtener cookie de sesión (B3)
      const motLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "3002002", password: "CamilaPassword*2026" })
      });
      assert.equal(motLogin.status, 200);
      const motCookie = (motLogin.headers.get("set-cookie") || "").split(";")[0];

      // Solicitar viaje autenticado (B3)
      const resSol = await fetch(`${baseUrl}/api/viajes/solicitar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: estCookie },
        body: JSON.stringify({
          origen: "Campus Porvenir - Portería Principal",
          destino: "Sede Centro - Edificio Administrativo",
          distanciaKm: 1.5,
          tipoTarifa: "estudiantil",
          metodoPago: "NEQUI"
        })
      });
      assert.equal(resSol.status, 201);
      const solJson = (await resSol.json()) as any;

      // Leer siguientes chunks del SSE hasta observar VIAJE_SOLICITADO
      let bufferSse = "";
      for (let i = 0; i < 6 && !bufferSse.includes("VIAJE_SOLICITADO"); i++) {
        const chunk = await reader.read();
        bufferSse += decoder.decode(chunk.value || new Uint8Array());
      }
      assert.match(bufferSse, /VIAJE_SOLICITADO/);

      // Aceptar, iniciar y finalizar con sesión de motorista
      await fetch(`${baseUrl}/api/viajes/aceptar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: motCookie },
        body: JSON.stringify({ codigoViaje: solJson.codigo })
      });
      await fetch(`${baseUrl}/api/viajes/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: motCookie },
        body: JSON.stringify({ codigoViaje: solJson.codigo })
      });
      await fetch(`${baseUrl}/api/viajes/finalizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: motCookie },
        body: JSON.stringify({ codigoViaje: solJson.codigo })
      });

      // Confirmar llegada segura con sesión de estudiante
      const resLlegada = await fetch(`${baseUrl}/api/viajes/llegada-segura`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: estCookie },
        body: JSON.stringify({ codigoViaje: solJson.codigo })
      });
      assert.equal(resLlegada.status, 200);
      const llegadaJson = (await resLlegada.json()) as any;
      assert.equal(llegadaJson.llegadaSeguraConfirmada, true);

      // Consultar estado consolidado autenticado como estudiante (segmentado por rol)
      const resEstado = await fetch(`${baseUrl}/api/estado`, {
        headers: { Cookie: estCookie }
      });
      assert.equal(resEstado.status, 200);
      const estado = (await resEstado.json()) as any;
      assert.equal(estado.viajes.some((v: any) => v.codigo === solJson.codigo), true);
      assert.equal(estado.metricas.ingresosGenerados, undefined);
      assert.equal(typeof estado.metricas.gastoTotalCop, "number");
    } finally {
      sseController.abort();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      repo.cerrar();
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("Expone /api/mapa/config, /api/auth/login, disponibilidad/ubicación de motorista y tracking GPS vía SSE", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tucango-didi-"));
    const repo = new SqliteSistemaRepository(path.join(tmpDir, "tucango.db"));
    const facade = new TucanGoFacade(repo);
    const server = crearServidor(facade, { persistencia: "sqlite" });

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const { port } = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${port}`;
    const sseController = new AbortController();

    try {
      const resConfig = await fetch(`${baseUrl}/api/mapa/config`);
      assert.equal(resConfig.status, 200);
      const cfg = (await resConfig.json()) as any;
      assert.equal(typeof cfg.tileUrlDidi, "string");
      assert.equal(Array.isArray(cfg.googleApisRequeridas), true);
      if (process.env.GOOGLE_MAPS_API_KEY) {
        assert.equal(cfg.proveedorActivo, "google_maps");
        assert.equal(typeof cfg.googleMapsMapId, "string");
      }

      const resRuta = await fetch(`${baseUrl}/api/ruta?origenId=PORVENIR&destinoId=CENTRO`);
      assert.equal(resRuta.status, 200);
      const ruta = (await resRuta.json()) as any;
      assert.equal(Array.isArray(ruta.polilinea), true);
      assert.equal(ruta.polilinea.length >= 2, true);

      // La semilla solo crea la cuenta administrativa: el test crea su pasajero.
      const resSeedEst = await fetch(`${baseUrl}/api/estudiantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identificacion: "1001001",
          nombre: "Carlos Rivera",
          telefono: "3115551234",
          correoInstitucional: "c.rivera@uniamazonia.edu.co",
          codigoEstudiantil: "202610001",
          carrera: "Ingeniería de Sistemas",
          password: "EstudianteSeguro*2026"
        })
      });
      assert.equal(resSeedEst.status, 201);

      // Login exitoso de estudiante registrado
      const resLoginOk = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "1001001", password: "EstudianteSeguro*2026" })
      });
      assert.equal(resLoginOk.status, 200);
      const sesion = (await resLoginOk.json()) as any;
      assert.equal(sesion.rol, "pasajero");
      const estCookie = (resLoginOk.headers.get("set-cookie") || "").split(";")[0];

      // Login con contraseña incorrecta (401)
      const resLoginWrongPass = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "1001001", password: "clave-incorrecta" })
      });
      assert.equal(resLoginWrongPass.status, 401);

      // Login usuario inexistente: anti-timing unificado 401 (B10)
      const resLoginFail = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "usuario-inexistente", password: "EstudianteSeguro*2026" })
      });
      assert.equal(resLoginFail.status, 401);

      // El alta administrativa exige sesión de administrador.
      const regMotSinSesion = await fetch(`${baseUrl}/api/motoristas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificacion: "2001001" })
      });
      assert.equal(regMotSinSesion.status, 401);

      const adminSeedLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "tucangoadmin", password: "TestAdmin*Segura2026" })
      });
      assert.equal(adminSeedLogin.status, 200);
      const adminSeedCookie = (adminSeedLogin.headers.get("set-cookie") || "").split(";")[0];

      // Un Tucán habilitado necesita expediente completo, incluso por alta admin.
      const regMotSinDocs = await fetch(`${baseUrl}/api/motoristas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: adminSeedCookie },
        body: JSON.stringify({
          identificacion: "2001001",
          nombre: "Jhonatan Silva",
          telefono: "3201234567",
          correoInstitucional: "j.silva@gmail.com",
          placa: "GNX-45F",
          marca: "Suzuki",
          modelo: "GN 125",
          cilindraje: 125,
          soatVigente: true,
          numeroSoat: "SOAT-2026-FLR",
          numeroLicencia: "LIC-2001-A2",
          password: "MotoristaSeguro*2026",
          estadoAprobacion: "ACTIVO"
        })
      });
      assert.equal(regMotSinDocs.status, 422);

      const regMotRes = await fetch(`${baseUrl}/api/motoristas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: adminSeedCookie },
        body: JSON.stringify({
          identificacion: "2001001",
          nombre: "Jhonatan Silva",
          telefono: "3201234567",
          correoInstitucional: "j.silva@gmail.com",
          placa: "GNX-45F",
          marca: "Suzuki",
          modelo: "GN 125",
          cilindraje: 125,
          soatVigente: true,
          numeroSoat: "SOAT-2026-FLR",
          numeroLicencia: "LIC-2001-A2",
          password: "MotoristaSeguro*2026",
          estadoAprobacion: "ACTIVO",
          compromisoAceptado: true,
          fotoRostroUrl: DOC_FOTO,
          fotoCedulaUrl: DOC_FOTO,
          fotoMotoUrl: DOC_FOTO,
          fotoSoatUrl: DOC_FOTO,
          fotoLicenciaUrl: DOC_FOTO
        })
      });
      assert.equal(regMotRes.status, 201);

      // Login motorista
      const motLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "2001001", password: "MotoristaSeguro*2026" })
      });
      assert.equal(motLoginRes.status, 200);
      const motCookie = (motLoginRes.headers.get("set-cookie") || "").split(";")[0];

      // Disponibilidad y ubicación autenticadas de motorista (B3)
      const resDisp = await fetch(`${baseUrl}/api/motoristas/disponibilidad`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: motCookie },
        body: JSON.stringify({ disponible: true })
      });
      assert.equal(resDisp.status, 200);

      const resUbic = await fetch(`${baseUrl}/api/motoristas/ubicacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: motCookie },
        body: JSON.stringify({ latitud: 1.618, longitud: -75.607 })
      });
      assert.equal(resUbic.status, 200);

      const sseRes = await fetch(`${baseUrl}/api/eventos`, { signal: sseController.signal });
      const reader = sseRes.body!.getReader();
      const decoder = new TextDecoder();
      await reader.read();

      const resSol = await fetch(`${baseUrl}/api/viajes/solicitar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: estCookie },
        body: JSON.stringify({
          origen: "Campus Porvenir - Portería Principal",
          destino: "Sede Centro - Edificio Administrativo",
          distanciaKm: 1.15,
          tipoTarifa: "estudiantil",
          metodoPago: "NEQUI"
        })
      });
      const sol = (await resSol.json()) as any;
      assert.match(sol.pinSeguridad, /^\d{4}$/);

      await fetch(`${baseUrl}/api/viajes/aceptar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: motCookie },
        body: JSON.stringify({ codigoViaje: sol.codigo })
      });

      const resTracking = await fetch(`${baseUrl}/api/viajes/tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: motCookie },
        body: JSON.stringify({ codigoViaje: sol.codigo, incremento: 30 })
      });
      assert.equal(resTracking.status, 200);
      const track = (await resTracking.json()) as any;
      assert.equal(track.progresoRuta, 30);
      assert.equal(track.etapaTracking, "CAMINO_ORIGEN");

      let bufferSse = "";
      for (let i = 0; i < 6 && !bufferSse.includes("TRACKING_VIAJE_ACTUALIZADO"); i++) {
        const chunk = await reader.read();
        bufferSse += decoder.decode(chunk.value || new Uint8Array());
      }
      assert.match(bufferSse, /TRACKING_VIAJE_ACTUALIZADO/);
    } finally {
      sseController.abort();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      repo.cerrar();
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("GET /login, assets del portal y sesión cookie HttpOnly (/api/auth/me & /logout)", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tucango-auth-portal-"));
    const repo = new SqliteSistemaRepository(path.join(tmpDir, "tucango.db"));
    const facade = new TucanGoFacade(repo);
    const server = crearServidor(facade, { persistencia: "sqlite" });

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const { port } = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      const loginHtmlRes = await fetch(`${baseUrl}/login`);
      assert.equal(loginHtmlRes.status, 200);
      const html = await loginHtmlRes.text();
      assert.match(html, /TucanGo · Acceso Universitario/);
      assert.match(html, /view-login/);
      assert.match(html, /view-register/);

      const cssRes = await fetch(`${baseUrl}/login.css`);
      assert.equal(cssRes.status, 200);
      assert.match(cssRes.headers.get("content-type") || "", /text\/css/);

      const jsRes = await fetch(`${baseUrl}/login.js`);
      assert.equal(jsRes.status, 200);
      assert.match(jsRes.headers.get("content-type") || "", /text\/javascript/);

      const assetRes = await fetch(`${baseUrl}/assets/portal/tucan-portal-badge.png`);
      assert.equal(assetRes.status, 200);
      assert.match(assetRes.headers.get("content-type") || "", /image\/png/);

      const spriteRes = await fetch(`${baseUrl}/assets/icons/iconly-sprite.svg`);
      assert.equal(spriteRes.status, 200);
      assert.match(spriteRes.headers.get("content-type") || "", /image\/svg\+xml/);
      const spriteText = await spriteRes.text();
      assert.match(spriteText, /id="iconly-shield-done"/);
      assert.match(spriteText, /id="tg-moto"/);

      const brandLogoRes = await fetch(`${baseUrl}/assets/brand/tucango-moto-logo.svg`);
      assert.equal(brandLogoRes.status, 200);
      assert.match(brandLogoRes.headers.get("content-type") || "", /image\/svg\+xml/);
      const brandLogoText = await brandLogoRes.text();
      assert.match(brandLogoText, /id="tg-wheel-front"/);
      assert.match(brandLogoText, /id="tg-moto-body"/);
      assert.match(brandLogoText, /id="passenger-student"/);
      assert.match(brandLogoText, /id="rider-tucan"/);
      assert.match(html, /tucango-story-reel/);
      assert.match(html, /tucango-moto-logo\.svg/);

      const faviconRes = await fetch(`${baseUrl}/favicon.ico`);
      assert.equal(faviconRes.status, 200);
      assert.match(faviconRes.headers.get("content-type") || "", /image\/svg\+xml/);

      const anonMeRes = await fetch(`${baseUrl}/api/auth/me`);
      assert.equal(anonMeRes.status, 200);
      const anonMe = (await anonMeRes.json()) as { autenticado: boolean };
      assert.equal(anonMe.autenticado, false);

      // La semilla solo crea el admin: el test crea el pasajero.
      const seedEstRes = await fetch(`${baseUrl}/api/estudiantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identificacion: "1001001",
          nombre: "Carlos Rivera",
          telefono: "3115551234",
          correoInstitucional: "c.rivera@uniamazonia.edu.co",
          codigoEstudiantil: "202610001",
          carrera: "Ingeniería de Sistemas",
          password: "EstudianteSeguro*2026"
        })
      });
      assert.equal(seedEstRes.status, 201);

      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "1001001", password: "EstudianteSeguro*2026" })
      });
      assert.equal(loginRes.status, 200);
      const setCookie = loginRes.headers.get("set-cookie") || "";
      assert.match(setCookie, /tucango_sid=/);
      assert.match(setCookie, /HttpOnly/i);
      assert.match(setCookie, /SameSite=Strict/i);

      const cookiePair = setCookie.split(";")[0];
      const authMeRes = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Cookie: cookiePair }
      });
      assert.equal(authMeRes.status, 200);
      const authMe = (await authMeRes.json()) as {
        autenticado: boolean;
        usuario?: { rol: string; identificacion: string };
      };
      assert.equal(authMe.autenticado, true);
      assert.equal(authMe.usuario?.rol, "pasajero");
      assert.equal(authMe.usuario?.identificacion, "1001001");

      // Consulta y edición de perfil autenticado (GET & POST /api/auth/perfil)
      const getPerfilRes = await fetch(`${baseUrl}/api/auth/perfil`, {
        headers: { Cookie: cookiePair }
      });
      assert.equal(getPerfilRes.status, 200);
      const getPerfil = (await getPerfilRes.json()) as {
        ok: boolean;
        perfil: { identificacion: string; rol: string; nombre: string };
      };
      assert.equal(getPerfil.ok, true);
      assert.equal(getPerfil.perfil.identificacion, "1001001");

      const updatePerfilRes = await fetch(`${baseUrl}/api/auth/perfil`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookiePair },
        body: JSON.stringify({
          nombre: "Carlos Rivera Actualizado",
          telefono: "3159998877",
          carrera: "Ingeniería Agroecológica (Caquetá)",
          contactoEmergencia: "Marta Rivera · 3101112233",
          sedeFavorita: "CENTRO"
        })
      });
      assert.equal(updatePerfilRes.status, 200);
      const updatedPerfil = (await updatePerfilRes.json()) as {
        ok: boolean;
        perfil: {
          nombre: string;
          telefono: string;
          carrera: string;
          contactoEmergencia: string;
          sedeFavorita: string;
        };
      };
      assert.equal(updatedPerfil.ok, true);
      assert.equal(updatedPerfil.perfil.nombre, "Carlos Rivera Actualizado");
      assert.equal(updatedPerfil.perfil.telefono, "3159998877");
      assert.equal(updatedPerfil.perfil.carrera, "Ingeniería Agroecológica (Caquetá)");
      assert.equal(updatedPerfil.perfil.contactoEmergencia, "Marta Rivera · 3101112233");
      assert.equal(updatedPerfil.perfil.sedeFavorita, "CENTRO");

      const afterUpdateMeRes = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Cookie: cookiePair }
      });
      const afterUpdateMe = (await afterUpdateMeRes.json()) as {
        usuario?: { nombre: string; telefono: string };
      };
      assert.equal(afterUpdateMe.usuario?.nombre, "Carlos Rivera Actualizado");
      assert.equal(afterUpdateMe.usuario?.telefono, "3159998877");

      const estadoRes = await fetch(`${baseUrl}/api/estado`, {
        headers: { Cookie: cookiePair }
      });
      const estadoJson = (await estadoRes.json()) as {
        estudiantes: Array<{ identificacion: string; nombre: string; carrera: string }>;
      };
      const estActualizado = estadoJson.estudiantes.find((e) => e.identificacion === "1001001");
      assert.equal(estActualizado?.nombre, "Carlos Rivera Actualizado");
      assert.equal(estActualizado?.carrera, "Ingeniería Agroecológica (Caquetá)");

      // Estudiante guarda su Casa en lugares frecuentes
      const saveLocRes = await fetch(`${baseUrl}/api/estudiante/ubicaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookiePair },
        body: JSON.stringify({
          etiqueta: "Casa",
          nombre: "Mi Casa La Vega",
          barrio: "La Vega",
          latitud: 1.6238,
          longitud: -75.6121
        })
      });
      assert.equal(saveLocRes.status, 201);
      const listLocRes = await fetch(`${baseUrl}/api/estudiante/ubicaciones`, {
        headers: { Cookie: cookiePair }
      });
      assert.equal(listLocRes.status, 200);
      const listLoc = (await listLocRes.json()) as { ubicaciones: any[] };
      assert.equal(listLoc.ubicaciones.length, 1);

      const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        headers: { Cookie: cookiePair }
      });
      assert.equal(logoutRes.status, 200);
      const logoutSetCookie = logoutRes.headers.get("set-cookie") || "";
      assert.match(logoutSetCookie, /Max-Age=0/i);

      // Verificación de revocación por jti (B4): el token viejo ya no es admitido
      const afterLogoutMeRes = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Cookie: cookiePair }
      });
      const afterLogoutMe = (await afterLogoutMeRes.json()) as { autenticado: boolean };
      assert.equal(afterLogoutMe.autenticado, false);

      // Login administrador seed
      const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "tucangoadmin", password: "TestAdmin*Segura2026" })
      });
      assert.equal(adminLoginRes.status, 200);
      const adminUser = (await adminLoginRes.json()) as { rol: string; identificacion: string };
      assert.equal(adminUser.rol, "admin");
      assert.equal(adminUser.identificacion, "tucangoadmin");

      // Flujo de Registro de Estudiante con contraseña propia (B13)
      const regEstRes = await fetch(`${baseUrl}/api/estudiantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identificacion: "1006888999",
          codigoEstudiantil: "202610045",
          nombre: "Sofía Muñoz",
          telefono: "3110000000",
          correoInstitucional: "s.munoz@uniamazonia.edu.co",
          carrera: "Ingeniería de Sistemas",
          password: "SofiaPassword*2026"
        })
      });
      assert.equal(regEstRes.status, 201);
      const regEstLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "1006888999", password: "SofiaPassword*2026" })
      });
      assert.equal(regEstLoginRes.status, 200);

      // Flujo de Registro de Motorista con Moto + contraseña propia (B13)
      const regMotRes = await fetch(`${baseUrl}/api/motoristas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: (adminLoginRes.headers.get("set-cookie") || "").split(";")[0] },
        body: JSON.stringify({
          identificacion: "1117555444",
          nombre: "Andrés Rojas",
          telefono: "3200000000",
          correoInstitucional: "a.rojas@gmail.com",
          placa: "AMZ-77G",
          marca: "Suzuki",
          modelo: "Gixxer 150",
          cilindraje: 150,
          soatVigente: true,
          numeroSoat: "SOAT-2026-FLR",
          numeroLicencia: "LIC-1117555444-A2",
          password: "AndresMoto*2026",
          estadoAprobacion: "ACTIVO",
          fotoRostroUrl: DOC_FOTO,
          fotoCedulaUrl: DOC_FOTO,
          fotoMotoUrl: DOC_FOTO,
          fotoSoatUrl: DOC_FOTO,
          fotoLicenciaUrl: DOC_FOTO
        })
      });
      assert.equal(regMotRes.status, 201);
      const regMotLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "AMZ-77G", password: "AndresMoto*2026" })
      });
      assert.equal(regMotLoginRes.status, 200);

      // Auth Gate: sin sesión, GET / y GET /app redirigen 302 -> /login
      const anonRootRes = await fetch(`${baseUrl}/`, { redirect: "manual" });
      assert.equal(anonRootRes.status, 302);
      assert.equal(anonRootRes.headers.get("location"), "/login");

      const anonAppRes = await fetch(`${baseUrl}/app`, { redirect: "manual" });
      assert.equal(anonAppRes.status, 302);
      assert.equal(anonAppRes.headers.get("location"), "/login");

      // Con cookie Pasajero: GET / -> /app y GET /app -> 200 OK; RBAC bloquea aceptar viaje (403)
      const authPasajeroLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "1001001", password: "EstudianteSeguro*2026" })
      });
      const activeCookie = (authPasajeroLogin.headers.get("set-cookie") || "").split(";")[0];

      const authRootRes = await fetch(`${baseUrl}/`, {
        headers: { Cookie: activeCookie },
        redirect: "manual"
      });
      assert.equal(authRootRes.status, 302);
      assert.equal(authRootRes.headers.get("location"), "/app");

      const authAppRes = await fetch(`${baseUrl}/app`, {
        headers: { Cookie: activeCookie },
        redirect: "manual"
      });
      assert.equal(authAppRes.status, 200);
      const appHtml = await authAppRes.text();
      assert.match(appHtml, /role-locked-badge/);
      assert.doesNotMatch(appHtml, /class="role-switcher"/);

      // RBAC (B3): Pasajero intentando aceptar viaje recibe 403
      const pasajeroAceptaRes = await fetch(`${baseUrl}/api/viajes/aceptar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: activeCookie },
        body: JSON.stringify({ codigoViaje: "TUC-999" })
      });
      assert.equal(pasajeroAceptaRes.status, 403);

      // RBAC (B3): Con cookie Motorista (creado en este test), solicitar viaje recibe 403
      const adminCookieFlota = (adminLoginRes.headers.get("set-cookie") || "").split(";")[0];
      await fetch(`${baseUrl}/api/motoristas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: adminCookieFlota },
        body: JSON.stringify({
          identificacion: "2001001",
          nombre: "Jhonatan Silva",
          telefono: "3201234567",
          correoInstitucional: "j.silva@gmail.com",
          placa: "GNX-45F",
          marca: "Suzuki",
          modelo: "GN 125",
          cilindraje: 125,
          soatVigente: true,
          numeroSoat: "SOAT-2026-FLR",
          numeroLicencia: "LIC-2001-A2",
          password: "MotoristaSeguro*2026",
          estadoAprobacion: "ACTIVO",
          fotoRostroUrl: DOC_FOTO,
          fotoCedulaUrl: DOC_FOTO,
          fotoMotoUrl: DOC_FOTO,
          fotoSoatUrl: DOC_FOTO,
          fotoLicenciaUrl: DOC_FOTO
        })
      });
      const motLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "2001001", password: "MotoristaSeguro*2026" })
      });
      const motCookie = (motLoginRes.headers.get("set-cookie") || "").split(";")[0];
      const motSolicitaRes = await fetch(`${baseUrl}/api/viajes/solicitar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: motCookie },
        body: JSON.stringify({
          origen: "Campus Porvenir",
          destino: "Sede Centro",
          distanciaKm: 1.15,
          tipoTarifa: "estudiantil",
          metodoPago: "EFECTIVO"
        })
      });
      assert.equal(motSolicitaRes.status, 403);

      // Onboarding Tucán: registro con compromiso obligatorio, retención 403 en revisión y aprobación por Admin
      // El correo institucional es exclusivo de estudiantes: el Tucán debe usar uno personal
      const regTucanCorreoInstitucionalRes = await fetch(`${baseUrl}/api/tucanes/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identificacion: "7002",
          nombre: "Aspirante Con Correo Institucional",
          telefono: "3119998878",
          correoInstitucional: "c.aspirante@uniamazonia.edu.co",
          placa: "TUC-71G",
          marca: "Yamaha",
          modelo: "FZ 250",
          cilindraje: 250,
          soatVigente: true,
          numeroSoat: "SOAT-2026-TUC71",
          numeroLicencia: "LIC-7002-A2",
          password: "CarlosTucan*2026",
          fotoRostroUrl: DOC_FOTO,
          fotoCedulaUrl: DOC_FOTO,
          fotoMotoUrl: DOC_FOTO,
          fotoSoatUrl: DOC_FOTO,
          fotoLicenciaUrl: DOC_FOTO,
          compromisoAceptado: true
        })
      });
      assert.equal(regTucanCorreoInstitucionalRes.status, 422);
      const regTucanCorreoInstitucionalJson = (await regTucanCorreoInstitucionalRes.json()) as any;
      assert.match(regTucanCorreoInstitucionalJson.error, /debe ser personal/i);

      // Un expediente sin documentos no puede entrar a auditoría
      const regTucanSinDocumentosRes = await fetch(`${baseUrl}/api/tucanes/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identificacion: "7003",
          nombre: "Aspirante Sin Documentos",
          telefono: "3119998879",
          correoInstitucional: "aspirante.sin.docs@gmail.com",
          placa: "TUC-72G",
          marca: "Yamaha",
          modelo: "FZ 250",
          cilindraje: 250,
          soatVigente: true,
          numeroSoat: "SOAT-2026-TUC72",
          password: "CarlosTucan*2026",
          compromisoAceptado: true
        })
      });
      assert.equal(regTucanSinDocumentosRes.status, 422);

      const regTucanRes = await fetch(`${baseUrl}/api/tucanes/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identificacion: "7001001",
          nombre: "Carlos Aspirante Tucán",
          telefono: "3119998877",
          correoInstitucional: "carlos.aspirante@gmail.com",
          placa: "TUC-70G",
          marca: "Yamaha",
          modelo: "FZ 250",
          cilindraje: 250,
          soatVigente: true,
          numeroSoat: "SOAT-2026-TUC70",
          numeroLicencia: "LIC-7001-A2",
          password: "CarlosTucan*2026",
          fotoRostroUrl: DOC_FOTO,
          fotoCedulaUrl: DOC_FOTO,
          fotoMotoUrl: DOC_FOTO,
          fotoSoatUrl: DOC_FOTO,
          fotoLicenciaUrl: DOC_FOTO,
          compromisoAceptado: true
        })
      });
      assert.equal(regTucanRes.status, 201);
      const regTucanJson = (await regTucanRes.json()) as any;
      assert.equal(regTucanJson.estadoAprobacion, "PENDIENTE_APROBACION");

      // Intento de login antes de ser aprobado: debe recibir 403 CUENTA_EN_REVISION
      const loginPendienteRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "7001001", password: "CarlosTucan*2026" })
      });
      assert.equal(loginPendienteRes.status, 403);
      const loginPendienteJson = (await loginPendienteRes.json()) as any;
      assert.match(loginPendienteJson.error, /en revisión/i);

      // Admin inicia sesión y consulta pendientes
      const adminAuthRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "tucangoadmin", password: "TestAdmin*Segura2026" })
      });
      assert.equal(adminAuthRes.status, 200);
      const adminAuthCookie = (adminAuthRes.headers.get("set-cookie") || "").split(";")[0];

      const pendientesRes = await fetch(`${baseUrl}/api/admin/tucanes/pendientes`, {
        headers: { Cookie: adminAuthCookie }
      });
      assert.equal(pendientesRes.status, 200);
      const pendientesJson = (await pendientesRes.json()) as any;
      assert.ok(pendientesJson.pendientes.some((p: any) => p.identificacion === "7001001"));

      // La hoja de vida llega completa al Administrador: número de licencia y documentos
      const tucanPendiente = pendientesJson.pendientes.find((p: any) => p.identificacion === "7001001");
      assert.equal(tucanPendiente.numeroLicencia, "LIC-7001-A2");
      assert.equal(tucanPendiente.fotoSoatUrl, DOC_FOTO);
      assert.equal(tucanPendiente.fotoLicenciaUrl, DOC_FOTO);

      // Admin consulta analítica institucional (Ley 1581 - agregación por barrios y corredores)
      const analiticaRes = await fetch(`${baseUrl}/api/admin/analitica`, {
        headers: { Cookie: adminAuthCookie }
      });
      assert.equal(analiticaRes.status, 200);
      const analiticaJson = (await analiticaRes.json()) as any;
      assert.equal(analiticaJson.ok, true);
      assert.equal(Array.isArray(analiticaJson.analitica.barriosEstudiantes), true);
      assert.equal(Array.isArray(analiticaJson.analitica.corredoresComunes), true);
      assert.equal(Array.isArray(analiticaJson.analitica.puntosRecurrentesMapa), true);

      // Admin aprueba al Tucán
      const aprobarRes = await fetch(`${baseUrl}/api/admin/tucanes/aprobar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: adminAuthCookie },
        body: JSON.stringify({ identificador: "7001001" })
      });
      assert.equal(aprobarRes.status, 200);
      const aprobarJson = (await aprobarRes.json()) as any;
      assert.equal(aprobarJson.ok, true);
      assert.ok(aprobarJson.correo);
      assert.match(aprobarJson.correo.asunto, /bienvenido a la comunidad tucán/i);

      // Ahora el Tucán puede iniciar sesión normalmente con 200
      const loginAprobadoRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "7001001", password: "CarlosTucan*2026" })
      });
      assert.equal(loginAprobadoRes.status, 200);
      const loginAprobadoJson = (await loginAprobadoRes.json()) as any;
      assert.equal(loginAprobadoJson.rol, "motorista");
      const tucanCookie = (loginAprobadoRes.headers.get("set-cookie") || "").split(";")[0];

      // Estudiante 1001 guarda lugar recurrente y aparece anonimizado en puntosRecurrentesMapa
      const loginEstRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "1001001", password: "EstudianteSeguro*2026" })
      });
      const estCookie = (loginEstRes.headers.get("set-cookie") || "").split(";")[0];
      const savePlaceRes = await fetch(`${baseUrl}/api/estudiante/ubicaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: estCookie },
        body: JSON.stringify({
          etiqueta: "Casa",
          nombre: "Mi Casa La Vega",
          barrio: "La Vega",
          latitud: 1.6238,
          longitud: -75.6121
        })
      });
      assert.equal(savePlaceRes.status, 201);

      const analiticaConPuntoRes = await fetch(`${baseUrl}/api/admin/analitica`, {
        headers: { Cookie: adminAuthCookie }
      });
      const analiticaConPuntoJson = (await analiticaConPuntoRes.json()) as any;
      const puntoRec = analiticaConPuntoJson.analitica.puntosRecurrentesMapa.find(
        (p: any) => p.barrio === "La Vega"
      );
      assert.ok(puntoRec);
      assert.equal(puntoRec.etiqueta, "Casa");
      assert.equal(puntoRec.registros, 1);

      // Estudiante solicita viaje -> otro estudiante NO puede confirmar llegada segura ni cancelar (403 IDOR)
      const solRes = await fetch(`${baseUrl}/api/viajes/solicitar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: estCookie },
        body: JSON.stringify({
          origen: "Sede Porvenir",
          destino: "Sede Centro / IDEMA",
          distanciaKm: 1.4,
          tipoTarifa: "estudiantil",
          metodoPago: "EFECTIVO"
        })
      });
      const solJson = (await solRes.json()) as any;
      assert.equal(solRes.status, 201);

      // Registrar segundo estudiante e intentar cancelar/llegada-segura ajena -> 403
      const regEst2Res = await fetch(`${baseUrl}/api/estudiantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identificacion: "1098001",
          nombre: "Otro Estudiante",
          telefono: "3120001199",
          correoInstitucional: "otro@udla.edu.co",
          codigoEstudiantil: "20269999",
          carrera: "Biología",
          password: "OtroSeguro*2026"
        })
      });
      assert.equal(regEst2Res.status, 201);
      const loginEst2Res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "1098001", password: "OtroSeguro*2026" })
      });
      const est2Cookie = (loginEst2Res.headers.get("set-cookie") || "").split(";")[0];
      const cancelAjenoRes = await fetch(`${baseUrl}/api/viajes/cancelar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: est2Cookie },
        body: JSON.stringify({ codigoViaje: solJson.codigo, motivo: "Intento ajeno" })
      });
      assert.equal(cancelAjenoRes.status, 403);

      // Tucán aprobado activa disponibilidad y acepta; PIN incorrecto es rechazado por el dominio
      const dispRes = await fetch(`${baseUrl}/api/motoristas/disponibilidad`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: tucanCookie },
        body: JSON.stringify({ disponible: true })
      });
      assert.equal(dispRes.status, 200);

      const aceptarRes = await fetch(`${baseUrl}/api/viajes/aceptar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: tucanCookie },
        body: JSON.stringify({ codigoViaje: solJson.codigo })
      });
      assert.equal(aceptarRes.status, 200);
      const aceptarJson = (await aceptarRes.json()) as any;
      assert.equal(aceptarJson.pinSeguridad, undefined);

      const pinMaloRes = await fetch(`${baseUrl}/api/viajes/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: tucanCookie },
        body: JSON.stringify({ codigoViaje: solJson.codigo, pinSeguridad: "0000" })
      });
      assert.equal(pinMaloRes.status, 422);

      const pinOkRes = await fetch(`${baseUrl}/api/viajes/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: tucanCookie },
        body: JSON.stringify({ codigoViaje: solJson.codigo, pinSeguridad: solJson.pinSeguridad })
      });
      assert.equal(pinOkRes.status, 200);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      repo.cerrar();
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("Valida el registro de estudiante: cédula numérica, programa oficial, usuario derivado y login por usuario", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tucango-est-"));
    const repo = new SqliteSistemaRepository(path.join(tmpDir, "tucango.db"));
    const facade = new TucanGoFacade(repo);
    const server = crearServidor(facade, { persistencia: "sqlite" });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const { port } = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${port}`;

    const registrar = (campos: Record<string, unknown>) =>
      fetch(`${baseUrl}/api/estudiantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: "Jorge Ferrer",
          telefono: "3201234567",
          codigoEstudiantil: "202612345",
          carrera: "Ingeniería de Sistemas",
          password: "Jferrer*2026",
          ...campos
        })
      });

    try {
      // Una letra en la cédula no entra a la base
      const cedulaConLetras = await registrar({
        identificacion: "10A6888",
        correoInstitucional: "j.ferrer@udla.edu.co"
      });
      assert.equal(cedulaConLetras.status, 422);

      // El programa debe pertenecer a la oferta oficial
      const programaInventado = await registrar({
        identificacion: "1002003004",
        correoInstitucional: "j.ferrer@udla.edu.co",
        carrera: "Ingeniería de Mecatrónica"
      });
      assert.equal(programaInventado.status, 422);

      // Registro válido: el usuario se deriva del correo (j.ferrer)
      const valido = await registrar({
        identificacion: "1002003004",
        correoInstitucional: "j.ferrer@udla.edu.co"
      });
      assert.equal(valido.status, 201);
      const validoJson = (await valido.json()) as any;
      assert.equal(validoJson.usuario, "j.ferrer");

      // El login acepta el usuario además de la cédula, el correo y el código
      const loginPorUsuario = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "j.ferrer", password: "Jferrer*2026" })
      });
      assert.equal(loginPorUsuario.status, 200);
      const loginJson = (await loginPorUsuario.json()) as any;
      assert.equal(loginJson.rol, "pasajero");
      assert.equal(loginJson.usuario, "j.ferrer");

      // Un usuario personalizado se respeta
      const personalizado = await registrar({
        identificacion: "1002003005",
        correoInstitucional: "otro.nombre@udla.edu.co",
        usuario: "juan.perez"
      });
      assert.equal(personalizado.status, 201);
      const personalizadoJson = (await personalizado.json()) as any;
      assert.equal(personalizadoJson.usuario, "juan.perez");

      // El mismo usuario no puede quedar en dos cuentas
      const duplicado = await registrar({
        identificacion: "1002003006",
        correoInstitucional: "tercero@udla.edu.co",
        usuario: "j.ferrer"
      });
      assert.equal(duplicado.status, 422);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      repo.cerrar();
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
