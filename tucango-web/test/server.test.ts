import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";

import { SqliteSistemaRepository } from "../src/infrastructure/SqliteSistemaRepository.ts";
import { TucanGoFacade } from "../src/application/TucanGoFacade.ts";
import { crearServidor } from "../src/server.ts";

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

      // Validar rechazo SOAT vencido
      const resMotInvalido = await fetch(`${baseUrl}/api/motoristas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identificacion: "3001",
          nombre: "Pedro Pérez",
          telefono: "3112223344",
          correoInstitucional: "p.perez@udla.edu.co",
          placa: "SIN-001",
          marca: "Bajaj",
          modelo: "Boxer",
          cilindraje: 100,
          soatVigente: false
        })
      });
      assert.equal(resMotInvalido.status, 400);

      // Registrar motorista con SOAT vigente
      const resMotValido = await fetch(`${baseUrl}/api/motoristas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identificacion: "3002",
          nombre: "Camila Torres",
          telefono: "3156667788",
          correoInstitucional: "c.torres@udla.edu.co",
          placa: "AMZ-77G",
          marca: "Suzuki",
          modelo: "Gixxer 150",
          cilindraje: 150,
          soatVigente: true,
          numeroSoat: "SOAT-8899"
        })
      });
      assert.equal(resMotValido.status, 201);

      // Registrar nuevo estudiante
      const resEst = await fetch(`${baseUrl}/api/estudiantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identificacion: "4001",
          nombre: "Sofía Muñoz",
          telefono: "3189990011",
          correoInstitucional: "s.munoz@udla.edu.co",
          codigoEstudiantil: "20261001",
          carrera: "Derecho"
        })
      });
      assert.equal(resEst.status, 201);

      // Solicitar, aceptar, iniciar, finalizar y confirmar llegada segura
      const resSol = await fetch(`${baseUrl}/api/viajes/solicitar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estudianteId: "4001",
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

      await fetch(`${baseUrl}/api/viajes/aceptar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigoViaje: solJson.codigo, motoristaId: "3002" })
      });
      await fetch(`${baseUrl}/api/viajes/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigoViaje: solJson.codigo })
      });
      await fetch(`${baseUrl}/api/viajes/finalizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigoViaje: solJson.codigo })
      });

      const resLlegada = await fetch(`${baseUrl}/api/viajes/llegada-segura`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigoViaje: solJson.codigo })
      });
      assert.equal(resLlegada.status, 200);
      const llegadaJson = (await resLlegada.json()) as any;
      assert.equal(llegadaJson.llegadaSeguraConfirmada, true);
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

      const resRuta = await fetch(`${baseUrl}/api/ruta?origenId=PORVENIR&destinoId=CENTRO`);
      assert.equal(resRuta.status, 200);
      const ruta = (await resRuta.json()) as any;
      assert.equal(Array.isArray(ruta.polilinea), true);
      assert.equal(ruta.polilinea.length >= 2, true);

      const resLoginOk = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "1001", rol: "pasajero" })
      });
      assert.equal(resLoginOk.status, 200);
      const sesion = (await resLoginOk.json()) as any;
      assert.equal(sesion.rol, "pasajero");

      const resLoginFail = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: "usuario-inexistente" })
      });
      assert.equal(resLoginFail.status, 400);

      const resDisp = await fetch(`${baseUrl}/api/motoristas/disponibilidad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motoristaId: "2001", disponible: true })
      });
      assert.equal(resDisp.status, 200);

      const resUbic = await fetch(`${baseUrl}/api/motoristas/ubicacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motoristaId: "2001", latitud: 1.618, longitud: -75.607 })
      });
      assert.equal(resUbic.status, 200);

      const sseRes = await fetch(`${baseUrl}/api/eventos`, { signal: sseController.signal });
      const reader = sseRes.body!.getReader();
      const decoder = new TextDecoder();
      await reader.read();

      const resSol = await fetch(`${baseUrl}/api/viajes/solicitar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estudianteId: "1001",
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigoViaje: sol.codigo, motoristaId: "2001" })
      });

      const resTrack = await fetch(`${baseUrl}/api/viajes/tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigoViaje: sol.codigo, incremento: 35 })
      });
      assert.equal(resTrack.status, 200);
      const track = (await resTrack.json()) as any;
      assert.equal(track.progresoRuta, 35);
      assert.equal(track.etapaTracking, "CAMINO_ORIGEN");

      let sseLog = "";
      for (let i = 0; i < 6 && !sseLog.includes("TRACKING_VIAJE_ACTUALIZADO"); i++) {
        const chunk = await reader.read();
        sseLog += decoder.decode(chunk.value || new Uint8Array());
      }
      assert.match(sseLog, /TRACKING_VIAJE_ACTUALIZADO/);
    } finally {
      sseController.abort();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      repo.cerrar();
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
