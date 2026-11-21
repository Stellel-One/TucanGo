import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ejecutarSimulacionCampusPOO } from "../../../../../../src/co/edu/uniamazonia/tucango/mundo/SimuladorCampusPOO.ts";

import { Coordenada } from "../../../../../../src/co/edu/uniamazonia/tucango/mundo/Coordenada.ts";
import {
  SectorCampus,
  SECTORES_FLORENCIA,
  buscarSectorPorId
} from "../../../../../../src/co/edu/uniamazonia/tucango/mundo/SectorCampus.ts";
import { Moto } from "../../../../../../src/co/edu/uniamazonia/tucango/mundo/Moto.ts";
import { MetodoPago } from "../../../../../../src/co/edu/uniamazonia/tucango/mundo/Pago.ts";
import { EventBus, type EventoDominio } from "../../../../../../src/co/edu/uniamazonia/tucango/mundo/EventBus.ts";
import { TucanGoFacade } from "../../../../../../src/co/edu/uniamazonia/tucango/mundo/TucanGoFacade.ts";
import { SqliteSistemaRepository } from "../../../../../../src/co/edu/uniamazonia/tucango/mundo/SqliteSistemaRepository.ts";

describe("TucanGo Beta v1 - Dominio Geográfico, Seguridad y Persistencia", () => {
  it("Valida invariantes de Coordenada y calcula distancia Haversine entre sectores de Florencia", () => {
    assert.throws(
      () => new Coordenada(95, -75.6),
      /latitud/i,
      "Debe rechazar latitudes fuera de [-90, 90]"
    );
    assert.throws(
      () => new Coordenada(1.61, 185),
      /longitud/i,
      "Debe rechazar longitudes fuera de [-180, 180]"
    );

    const porvenir = buscarSectorPorId("PORVENIR");
    const centro = buscarSectorPorId("CENTRO");
    const balcanes = buscarSectorPorId("BALCANES");

    assert.ok(porvenir instanceof SectorCampus);
    assert.ok(centro instanceof SectorCampus);
    assert.ok(balcanes instanceof SectorCampus);
    assert.equal(SECTORES_FLORENCIA.length >= 5, true);

    const distPorvenirCentro = porvenir.coordenada.distanciaKmHacia(centro.coordenada);
    const distPorvenirBalcanes = porvenir.coordenada.distanciaKmHacia(balcanes.coordenada);

    assert.equal(distPorvenirCentro > 0.5 && distPorvenirCentro < 5, true);
    assert.equal(distPorvenirBalcanes > distPorvenirCentro, true);
    assert.equal(porvenir.coordenada.distanciaKmHacia(porvenir.coordenada), 0);
  });

  it("Exige SOAT vigente para registrar motorista con moto activa", () => {
    const bus = new EventBus();
    const facade = new TucanGoFacade(undefined, bus);

    assert.throws(
      () => new Moto("XYZ-99A", "Honda", "CB 125", 125, true, false, "SOAT-VENCIDO"),
      /SOAT/i
    );

    assert.throws(
      () =>
        facade.registrarMotoristaConMoto({
          identificacion: "1118000999",
          nombre: "Andrés Rojas",
          telefono: "3120001122",
          correoInstitucional: "a.rojas@udla.edu.co",
          placa: "XYZ-99A",
          marca: "Honda",
          modelo: "CB 125F",
          cilindraje: 125,
          soatVigente: false,
          numeroSoat: "SOAT-000"
        }),
      /SOAT/i
    );

    const mot = facade.registrarMotoristaConMoto({
      identificacion: "1118000999",
      nombre: "Andrés Rojas",
      telefono: "3120001122",
      correoInstitucional: "a.rojas@udla.edu.co",
      placa: "XYZ-99A",
      marca: "Honda",
      modelo: "CB 125F",
      cilindraje: 125,
      soatVigente: true,
      numeroSoat: "SOAT-2026-FLR",
      numeroLicencia: "LIC-1118000999-A2"
    });

    assert.equal(mot.obtenerMotoActiva()?.placa, "XYZ-99A");
    assert.equal(mot.obtenerMotoActiva()?.soatVigente, true);
  });

  it("Emite eventos de dominio vía EventBus en el ciclo completo incluyendo llegada segura", () => {
    const bus = new EventBus();
    const eventos: EventoDominio[] = [];
    const desuscribir = bus.suscribir((ev) => eventos.push(ev));

    const facade = new TucanGoFacade(undefined, bus);
    const pax = facade.registrarEstudiante({
      identificacion: "1006999888",
      nombre: "Valentina Ortiz",
      telefono: "3145556677",
      correoInstitucional: "v.ortiz@udla.edu.co",
      codigoEstudiantil: "202520010",
      carrera: "Biología",
      barrioResidencia: "El Cunduy"
    });
    const motRegistrado = facade.registrarMotoristaConMoto({
      identificacion: "2001001",
      nombre: "Jhonatan Silva",
      telefono: "3201234567",
      correoInstitucional: "j.silva@uniamazonia.edu.co",
      placa: "GNX-45F",
      marca: "Suzuki",
      modelo: "GN 125",
      cilindraje: 125,
      soatVigente: true,
      numeroSoat: "SOAT-2026-FLR",
      numeroLicencia: "LIC-2001-A2"
    });
    const mots = [motRegistrado];

    const viaje = facade.solicitarViaje(
      pax.identificacion,
      "Campus Porvenir - Portería Principal",
      "Sede Centro - Edificio Administrativo",
      2.4,
      "POR_KILOMETRO",
      MetodoPago.NEQUI
    );

    assert.throws(
      () => facade.marcarLlegadaSegura(viaje.codigoViaje),
      /finalizado/i,
      "No se debe confirmar llegada segura antes de finalizar el viaje"
    );

    facade.aceptarViaje(viaje.codigoViaje, mots[0].identificacion);
    facade.iniciarViaje(viaje.codigoViaje, viaje.pinSeguridad);
    facade.finalizarViaje(viaje.codigoViaje);
    facade.marcarLlegadaSegura(viaje.codigoViaje);

    assert.equal(viaje.llegadaSeguraConfirmada, true);
    assert.ok(viaje.fechaLlegadaSegura instanceof Date);

    assert.throws(
      () => facade.marcarLlegadaSegura(viaje.codigoViaje),
      /ya fue confirmada/i
    );

    const tipos = eventos.map((e) => e.tipo);
    assert.deepEqual(tipos, [
      "ESTUDIANTE_REGISTRADO",
      "MOTORISTA_REGISTRADO",
      "VIAJE_SOLICITADO",
      "VIAJE_ACEPTADO",
      "VIAJE_INICIADO",
      "VIAJE_FINALIZADO",
      "LLEGADA_SEGURA_CONFIRMADA"
    ]);

    desuscribir();
  });

  it("Persiste usuarios y viajes en SqliteSistemaRepository entre reinicios de TucanGoFacade", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tucango-sqlite-"));
    const dbPath = path.join(tmpDir, "tucango.db");

    try {
      const repo1 = new SqliteSistemaRepository(dbPath);
      const facade1 = new TucanGoFacade(repo1);

      const nuevoEst = facade1.registrarEstudiante({
        identificacion: "1099887766",
        nombre: "Mateo Cuéllar",
        telefono: "3104443322",
        correoInstitucional: "m.cuellar@udla.edu.co",
        codigoEstudiantil: "20249988",
        carrera: "Medicina Veterinaria y Zootecnia",
        barrioResidencia: "Bello Horizonte"
      });
      facade1.registrarUbicacionEstudiante(nuevoEst.identificacion, {
        etiqueta: "Casa",
        nombre: "Mi Casa Bello Horizonte",
        barrio: "Bello Horizonte",
        latitud: 1.6155,
        longitud: -75.6118
      });

      const viaje = facade1.solicitarViaje(
        nuevoEst.identificacion,
        "Sede Centro - Edificio Administrativo",
        "Granja Balcanes (Km 17)",
        14.2,
        "LLUVIA",
        MetodoPago.DAVIPLATA
      );

      const mot1 = facade1.registrarMotoristaConMoto({
        identificacion: "2001001",
        nombre: "Tucán Prueba",
        telefono: "3201234567",
        correoInstitucional: "tucan.prueba@gmail.com",
        placa: "GNX-45F",
        marca: "Suzuki",
        modelo: "GN 125",
        cilindraje: 125,
        soatVigente: true,
        numeroSoat: "SOAT-2026-FLR",
        numeroLicencia: "LIC-2001-A2"
      });
      facade1.aceptarViaje(viaje.codigoViaje, mot1.identificacion);
      facade1.iniciarViaje(viaje.codigoViaje, viaje.pinSeguridad);
      facade1.finalizarViaje(viaje.codigoViaje);
      facade1.marcarLlegadaSegura(viaje.codigoViaje);
      facade1.calificarViaje(viaje.codigoViaje, 5, "Excelente ruta bajo lluvia", nuevoEst.identificacion);
      repo1.cerrar();

      // Simular reinicio completo del servidor con nueva instancia Facade + Repository
      const repo2 = new SqliteSistemaRepository(dbPath);
      const facade2 = new TucanGoFacade(repo2);

      const estRecuperado = facade2
        .obtenerEstudiantes()
        .find((e) => e.identificacion === nuevoEst.identificacion);
      assert.ok(estRecuperado, "El estudiante registrado debe persistir tras reiniciar");

      const viajeRecuperado = facade2
        .obtenerTodosLosViajes()
        .find((v) => v.codigoViaje === viaje.codigoViaje);
      assert.ok(viajeRecuperado, "El viaje debe persistir tras reiniciar");
      assert.equal(viajeRecuperado.estado.nombre, "FINALIZADO");
      assert.equal(viajeRecuperado.pago.estado, "PAGADO");
      assert.equal(viajeRecuperado.pago.metodo, MetodoPago.DAVIPLATA);
      assert.equal(viajeRecuperado.llegadaSeguraConfirmada, true);
      assert.equal(viajeRecuperado.calificaciones.length, 1);
      assert.equal(viajeRecuperado.calificaciones[0].puntuacion, 5);

      const metricas = facade2.obtenerMetricas();
      assert.equal(metricas.finalizados, 1);
      assert.equal(metricas.ingresosGenerados > 0, true);
      repo2.cerrar();
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("Migra el número de licencia que versiones anteriores guardaban en fotoLicenciaUrl", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tucango-licencia-"));
    const dbPath = path.join(tmpDir, "tucango.db");

    try {
      const repo1 = new SqliteSistemaRepository(dbPath);
      const facade1 = new TucanGoFacade(repo1);

      // Datos con la forma antigua: el número viajaba en el campo de imagen.
      // Se crea como RECHAZADO para poder omitir numeroLicencia, igual que un
      // registro previo a la existencia del campo.
      facade1.registrarMotoristaConMoto({
        identificacion: "2002002",
        nombre: "Tucán Legado",
        telefono: "3205556677",
        correoInstitucional: "tucan.legado@gmail.com",
        placa: "ABC-12D",
        marca: "Bajaj",
        modelo: "Boxer CT 100",
        cilindraje: 100,
        soatVigente: true,
        numeroSoat: "SOAT-2025-LEG",
        fotoLicenciaUrl: "LIC-LEGACY-777",
        estadoAprobacion: "RECHAZADO"
      });
      repo1.cerrar();

      const repo2 = new SqliteSistemaRepository(dbPath);
      const facade2 = new TucanGoFacade(repo2);
      const recuperado = facade2
        .obtenerMotoristas()
        .find((m) => m.identificacion === "2002002");

      assert.ok(recuperado, "El Tucán legado debe persistir tras reiniciar");
      assert.equal(recuperado.numeroLicencia, "LIC-LEGACY-777");
      assert.equal(recuperado.fotoLicenciaUrl, "");
      repo2.cerrar();
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("Soporta login por rol/placa, disponibilidad de motorista, polilínea y tracking GPS con PIN estilo DiDi", () => {
    const bus = new EventBus();
    const tipos: string[] = [];
    const desuscribir = bus.suscribir((ev) => tipos.push(ev.tipo));

    const facade = new TucanGoFacade(undefined, bus);

    // La semilla solo crea la cuenta administrativa; el resto lo crea la comunidad.
    assert.equal(facade.obtenerAdministradores().length, 1);
    assert.equal(facade.obtenerEstudiantes().length, 0);
    assert.equal(facade.obtenerMotoristas().length, 0);

    const estudiante = facade.registrarEstudiante({
      identificacion: "1001001",
      nombre: "Carlos Rivera",
      telefono: "3115551234",
      correoInstitucional: "c.rivera@uniamazonia.edu.co",
      codigoEstudiantil: "202610001",
      carrera: "Ingeniería de Sistemas",
      barrioResidencia: "La Vega"
    });

    facade.registrarMotoristaConMoto({
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
      numeroLicencia: "LIC-2001-A2"
    });

    // 1. Login rápido pasajero y motorista (por placa)
    const sesEst = facade.autenticarUsuario("c.rivera@uniamazonia.edu.co", "pasajero");
    assert.equal(sesEst.rol, "pasajero");
    assert.equal(sesEst.identificacion, "1001001");

    const sesMot = facade.autenticarUsuario("GNX-45F", "motorista");
    assert.equal(sesMot.rol, "motorista");
    assert.equal(sesMot.identificacion, "2001001");

    assert.throws(() => facade.autenticarUsuario("no-existe-999"), /No se encontró/);

    // 2. Ruta devuelve polilinea suavizada y rumbo inicial
    const ruta = facade.calcularRutaEntreSectores("PORVENIR", "CENTRO");
    assert.equal(ruta.polilinea.length >= 2, true);
    assert.equal(ruta.direccionInicialGrados >= 0 && ruta.direccionInicialGrados < 360, true);

    // 3. Ubicación y disponibilidad del motorista
    const motLibre = facade.cambiarDisponibilidadMotorista("2001001", false);
    assert.equal(motLibre.disponible, false);
    facade.cambiarDisponibilidadMotorista("2001001", true);

    const coord = new (facade.obtenerMotoristas()[0].ubicacionActual.constructor as any)(1.6199, -75.6050);
    const motMovido = facade.actualizarUbicacionMotorista("2001001", coord.latitud, coord.longitud);
    assert.equal(motMovido.ubicacionActual.latitud, 1.6199);

    // 4. Ciclo completo de tracking GPS en CAMINO_ORIGEN y EN_VIAJE
    const viaje = facade.solicitarViaje(
      estudiante.identificacion,
      "Campus Porvenir - Portería Principal",
      "Sede Centro - Edificio Administrativo",
      1.15,
      "estudiantil",
      MetodoPago.EFECTIVO
    );
    assert.match(viaje.pinSeguridad, /^\d{4}$/);

    facade.aceptarViaje(viaje.codigoViaje, "2001001");
    assert.equal(viaje.etapaTracking, "CAMINO_ORIGEN");

    // No puede desconectarse con viaje activo
    assert.throws(
      () => facade.cambiarDisponibilidadMotorista("2001001", false),
      /mientras atiendes/i
    );

    facade.avanzarSimulacionViaje(viaje.codigoViaje, 50);
    assert.equal(viaje.progresoRuta, 50);
    assert.equal(typeof viaje.ubicacionMotoristaLat, "number");

    facade.iniciarViaje(viaje.codigoViaje, viaje.pinSeguridad);
    assert.equal(viaje.etapaTracking, "EN_VIAJE");
    assert.equal(viaje.progresoRuta, 0);

    facade.avanzarSimulacionViaje(viaje.codigoViaje, 40);
    assert.equal(viaje.progresoRuta, 40);
    facade.finalizarViaje(viaje.codigoViaje);
    assert.equal(viaje.etapaTracking, "COMPLETADO");
    assert.equal(viaje.progresoRuta, 100);

    assert.equal(tipos.includes("USUARIO_AUTENTICADO"), true);
    assert.equal(tipos.includes("MOTORISTA_DISPONIBILIDAD_CAMBIADA"), true);
    assert.equal(tipos.includes("UBICACION_MOTORISTA_ACTUALIZADA"), true);
    assert.equal(tipos.includes("TRACKING_VIAJE_ACTUALIZADO"), true);

    desuscribir();
  });

  it("SimuladorCampusPOO valida polimorfismo, rumboHacia, rechazo de Tucán pendiente y PIN en dominio", () => {
    const sim = ejecutarSimulacionCampusPOO();
    assert.equal(sim.actoresPolimorficos.length, 3);
    assert.deepEqual(
      sim.actoresPolimorficos.map((a) => a.rol),
      ["admin", "pasajero", "motorista"]
    );
    assert.ok(sim.distanciaKm > 0);
    assert.ok(sim.rumboGrados >= 0 && sim.rumboGrados < 360);
    assert.equal(sim.rechazoMotoristaPendiente, true);
    assert.equal(sim.pinValidado, true);
    assert.equal(sim.llegadaSegura, true);
    assert.deepEqual(sim.estadosRecorridos, ["SOLICITADO", "ACEPTADO", "EN_CURSO", "FINALIZADO"]);
    assert.equal(sim.eventosEmitidos, 3);
  });
});
