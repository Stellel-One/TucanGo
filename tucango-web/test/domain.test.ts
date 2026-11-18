import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { Estudiante } from "../src/domain/model/Estudiante.ts";
import { Motorista } from "../src/domain/model/Motorista.ts";
import { Moto } from "../src/domain/model/Moto.ts";
import { Calificacion } from "../src/domain/model/Calificacion.ts";
import { MetodoPago, EstadoPago } from "../src/domain/model/Pago.ts";
import { Viaje } from "../src/domain/patterns/Viaje.ts";
import {
  TarifaEstudiantilFija,
  TarifaPorKilometro,
  TarifaDinamicaLluvia,
  TarifaNocturna
} from "../src/domain/patterns/EstrategiaTarifa.ts";
import { TucanGoFacade } from "../src/application/TucanGoFacade.ts";

describe("TucanGo Web - Dominio POO e Invariantes", () => {
  test("Estudiante: Debe validar fail-fast en campos obligatorios", () => {
    assert.throws(
      () => new Estudiante("", "Carlos", "311", "c@uni.edu.co", "E01", "Sistemas"),
      /La identificación no puede estar vacía/
    );
    assert.throws(
      () => new Estudiante("101", "Carlos", "311", "correo-invalido", "E01", "Sistemas"),
      /El correo institucional debe ser válido/
    );

    const est = new Estudiante(
      "101",
      "Carlos Rivera",
      "311555",
      "carlos@uniamazonia.edu.co",
      "EST-01",
      "Ingeniería de Sistemas"
    );
    assert.equal(est.obtenerRol(), "ESTUDIANTE");
    assert.equal(est.nombre, "Carlos Rivera");
  });

  test("Motorista y Moto: Manejo de flota y selección de moto activa", () => {
    const motorista = new Motorista(
      "201",
      "Jhonatan Silva",
      "320555",
      "j.silva@uniamazonia.edu.co"
    );
    const moto1 = new Moto("GNX-45F", "Suzuki", "GN 125", 125);
    const moto2 = new Moto("TUK-89D", "Yamaha", "Crypton", 115);

    motorista.registrarMoto(moto1);
    motorista.registrarMoto(moto2);

    // La primera registrada se activa por defecto
    assert.equal(moto1.activa, true);
    assert.equal(moto2.activa, false);
    assert.equal(motorista.obtenerMotoActiva()?.placa, "GNX-45F");

    // Cambiar a la segunda moto
    const cambiado = motorista.seleccionarMotoActiva("TUK-89D");
    assert.equal(cambiado, true);
    assert.equal(moto1.activa, false);
    assert.equal(moto2.activa, true);
    assert.equal(motorista.obtenerMotoActiva()?.placa, "TUK-89D");
  });

  test("Strategy Pattern: Cálculo de tarifas según estrategia", () => {
    const fija = new TarifaEstudiantilFija();
    const distancia = new TarifaPorKilometro();
    const lluvia = new TarifaDinamicaLluvia();
    const nocturna = new TarifaNocturna();

    assert.equal(fija.calcular(10, 3000), 2500); // Tarifa plana campus
    assert.equal(distancia.calcular(3, 3000), 3000 + 3 * 1200); // 6600
    assert.equal(lluvia.calcular(3, 3000), Math.round(6600 * 1.4)); // 9240
    assert.equal(nocturna.calcular(3, 3000), Math.round(6600 * 1.25)); // 8250
  });

  test("State Pattern: Ciclo de vida completo del viaje (Uber/InDrive workflow)", () => {
    const est = new Estudiante(
      "101",
      "Laura Gómez",
      "312777",
      "l.gomez@uniamazonia.edu.co",
      "E-02",
      "Veterinaria"
    );
    const motorista = new Motorista(
      "201",
      "Jhonatan",
      "320",
      "j@uniamazonia.edu.co"
    );
    motorista.registrarMoto(new Moto("GNX-45F", "Suzuki", "GN", 125, true));

    const viaje = new Viaje(
      "TUC-001",
      "Campus Porvenir",
      "Campus Centro",
      4.5,
      est,
      new TarifaEstudiantilFija(),
      MetodoPago.NEQUI
    );

    // Estado inicial: SOLICITADO
    assert.equal(viaje.estado.nombre, "SOLICITADO");
    assert.equal(viaje.tarifa, 2500);
    assert.equal(viaje.pago.estado, EstadoPago.PENDIENTE);

    // No se puede iniciar directamente desde SOLICITADO
    assert.throws(() => viaje.iniciar(), /No se puede iniciar un viaje sin antes ser aceptado/);

    // Motorista acepta el viaje
    viaje.aceptar(motorista);
    assert.equal(viaje.estado.nombre, "ACEPTADO");
    assert.equal(viaje.motorista?.nombre, "Jhonatan");
    assert.equal(motorista.disponible, false); // Motorista queda ocupado

    // Iniciar viaje
    viaje.iniciar();
    assert.equal(viaje.estado.nombre, "EN_CURSO");

    // Finalizar viaje
    viaje.finalizar();
    assert.equal(viaje.estado.nombre, "FINALIZADO");
    assert.equal(motorista.disponible, true); // Motorista queda libre de nuevo
    assert.equal(viaje.pago.estado, EstadoPago.PAGADO); // Pago cobrado

    // Calificar viaje
    viaje.agregarCalificacion(new Calificacion(5, "Excelente ruta y muy puntual", est.identificacion));
    assert.equal(viaje.calificaciones.length, 1);
    assert.equal(viaje.calificaciones[0].puntuacion, 5);
  });

  test("TucanGoFacade: Orquestación completa de casos de uso y métricas", () => {
    const facade = new TucanGoFacade();
    // La semilla solo crea la cuenta administrativa.
    assert.equal(facade.obtenerAdministradores().length, 1);
    assert.equal(facade.obtenerEstudiantes().length, 0);
    assert.equal(facade.obtenerMotoristas().length, 0);

    const est = facade.registrarEstudiante({
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
      correoInstitucional: "j.silva@uniamazonia.edu.co",
      placa: "GNX-45F",
      marca: "Suzuki",
      modelo: "GN 125",
      cilindraje: 125,
      soatVigente: true,
      numeroSoat: "SOAT-2026-FLR",
      numeroLicencia: "LIC-2001-A2"
    });

    const ests = facade.obtenerEstudiantes();
    const mots = facade.obtenerMotoristas();

    assert.equal(ests.length >= 1, true);
    assert.equal(mots.length >= 1, true);

    const viaje = facade.solicitarViaje(
      est.identificacion,
      "Barrio La Vega",
      "Campus Porvenir",
      3.2,
      "lluvia",
      MetodoPago.DAVIPLATA
    );

    assert.equal(viaje.estado.nombre, "SOLICITADO");

    facade.aceptarViaje(viaje.codigoViaje, mots[0].identificacion);
    assert.equal(viaje.estado.nombre, "ACEPTADO");

    facade.iniciarViaje(viaje.codigoViaje);
    assert.equal(viaje.estado.nombre, "EN_CURSO");

    facade.finalizarViaje(viaje.codigoViaje);
    assert.equal(viaje.estado.nombre, "FINALIZADO");

    const metricas = facade.obtenerMetricas();
    assert.equal(metricas.totalViajes, 1);
    assert.equal(metricas.finalizados, 1);
    assert.equal(metricas.ingresosGenerados > 0, true);
  });
});
