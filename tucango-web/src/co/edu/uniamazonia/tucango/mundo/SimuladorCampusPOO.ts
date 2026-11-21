import { Administrador } from "./Administrador.ts";
import { Coordenada } from "./Coordenada.ts";
import { Estudiante } from "./Estudiante.ts";
import { Moto } from "./Moto.ts";
import { Motorista } from "./Motorista.ts";
import { Persona } from "./Persona.ts";
import { MetodoPago } from "./Pago.ts";
import { Calificacion } from "./Calificacion.ts";
import { buscarSectorPorId } from "./SectorCampus.ts";
import { EventBus } from "./EventBus.ts";
import {
  TarifaDinamicaLluvia,
  TarifaEstudiantilFija
} from "./EstrategiaTarifa.ts";
import { Viaje } from "./Viaje.ts";

export interface ResultadoSimulacionPOO {
  actoresPolimorficos: Array<{ rol: string; detalle: string }>;
  distanciaKm: number;
  rumboGrados: number;
  tarifaEstudiantil: number;
  tarifaLluvia: number;
  estadosRecorridos: string[];
  pinValidado: boolean;
  rechazoMotoristaPendiente: boolean;
  llegadaSegura: boolean;
  eventosEmitidos: number;
}

/**
 * Simulación POO pura de TucanGo (sin servidor HTTP ni UI web)
 * Demuestra: Herencia + Polimorfismo (Persona), Encapsulamiento (Coordenada),
 * State Pattern (Viaje), Strategy Pattern (EstrategiaTarifa) y Observer (EventBus).
 */
export function ejecutarSimulacionCampusPOO(): ResultadoSimulacionPOO {
  const bus = new EventBus();
  let eventosEmitidos = 0;
  bus.suscribir((ev) => {
    eventosEmitidos += 1;
    if (process.argv[1]?.includes("SimuladorCampusPOO")) {
      console.log(`[EventBus] ${ev.tipo}`, ev.payload);
    }
  });

  const porvenir = buscarSectorPorId("PORVENIR")!;
  const centroIdema = buscarSectorPorId("CENTRO")!;

  const admin = new Administrador(
    "tucangoadmin",
    "Coordinador Bienestar Uniamazonia",
    "3105550000",
    "admin@uniamazonia.edu.co"
  );
  const estudiante = new Estudiante(
    "1001",
    "Valeria Gómez Rojas",
    "3124501122",
    "v.gomez@udla.edu.co",
    "20261045",
    "Ingeniería de Sistemas",
    "",
    false,
    "La Vega"
  );
  const motoristaActivo = new Motorista(
    "2001",
    "Andrés Felipe Rojas",
    "3149003344",
    "af.rojas@udla.edu.co",
    true,
    porvenir.coordenada,
    0,
    "",
    false,
    "ACTIVO"
  );
  motoristaActivo.registrarMoto(new Moto("TUC-201", "Yamaha", "FZ 150", 149, true, true, "SOAT-OK"));

  const motoristaPendiente = new Motorista(
    "2099",
    "Aspirante En Revisión",
    "3149009999",
    "aspirante@udla.edu.co",
    true,
    centroIdema.coordenada,
    0,
    "",
    false,
    "PENDIENTE_APROBACION"
  );
  motoristaPendiente.registrarMoto(new Moto("PEN-999", "Honda", "CB 125", 125, true, true, "SOAT-PEN"));

  // Polimorfismo sobre la clase abstracta Persona
  const comunidad: Persona[] = [admin, estudiante, motoristaActivo];
  const actoresPolimorficos = comunidad.map((p) => ({
    rol: p.obtenerRolApp(),
    detalle: p.construirDetalle()
  }));

  // Dominio geo-espacial encapsulado en Coordenada
  const distanciaKm = porvenir.coordenada.distanciaKmHacia(centroIdema.coordenada);
  const rumboGrados = porvenir.coordenada.rumboHacia(centroIdema.coordenada);

  // Strategy Pattern de tarifas
  const tarifaEstudiantil = new TarifaEstudiantilFija().calcular(distanciaKm, 3000);
  const tarifaLluvia = new TarifaDinamicaLluvia().calcular(distanciaKm, 3000);

  // Máquina de estados (State Pattern) con invariantes de seguridad
  const viaje = new Viaje(
    "SIM-POO-001",
    porvenir.nombre,
    centroIdema.nombre,
    distanciaKm,
    estudiante,
    new TarifaEstudiantilFija(),
    MetodoPago.EFECTIVO
  );
  const estadosRecorridos: string[] = [viaje.estado.nombre];
  bus.publicar({
    tipo: "VIAJE_SOLICITADO",
    timestamp: new Date().toISOString(),
    payload: { codigo: viaje.codigoViaje, pin: viaje.pinSeguridad }
  });

  // Invariante: un Tucán no aprobado NO puede aceptar el viaje
  let rechazoMotoristaPendiente = false;
  try {
    viaje.aceptar(motoristaPendiente);
  } catch {
    rechazoMotoristaPendiente = true;
  }

  viaje.aceptar(motoristaActivo);
  estadosRecorridos.push(viaje.estado.nombre);
  bus.publicar({
    tipo: "VIAJE_ACEPTADO",
    timestamp: new Date().toISOString(),
    payload: { codigo: viaje.codigoViaje, motorista: motoristaActivo.nombre }
  });

  // Validación estricta de PIN al abordar
  let pinValidado = false;
  try {
    viaje.iniciar("0000");
  } catch {
    viaje.iniciar(viaje.pinSeguridad);
    pinValidado = true;
  }
  estadosRecorridos.push(viaje.estado.nombre);

  const puntoMedio = new Coordenada(
    Number(((porvenir.coordenada.latitud + centroIdema.coordenada.latitud) / 2).toFixed(6)),
    Number(((porvenir.coordenada.longitud + centroIdema.coordenada.longitud) / 2).toFixed(6))
  );
  viaje.actualizarTracking(50, puntoMedio.latitud, puntoMedio.longitud, rumboGrados);

  viaje.finalizar();
  viaje.confirmarLlegadaSegura();
  viaje.agregarCalificacion(new Calificacion(5, "Excelente servicio universitario", estudiante.identificacion));
  estadosRecorridos.push(viaje.estado.nombre);
  bus.publicar({
    tipo: "LLEGADA_SEGURA_CONFIRMADA",
    timestamp: new Date().toISOString(),
    payload: { codigo: viaje.codigoViaje, tarifa: viaje.tarifa }
  });

  return {
    actoresPolimorficos,
    distanciaKm,
    rumboGrados,
    tarifaEstudiantil,
    tarifaLluvia,
    estadosRecorridos,
    pinValidado,
    rechazoMotoristaPendiente,
    llegadaSegura: viaje.llegadaSeguraConfirmada,
    eventosEmitidos
  };
}

if (process.argv[1]?.includes("SimuladorCampusPOO")) {
  const resultado = ejecutarSimulacionCampusPOO();
  console.log("\n=== Simulación POO TucanGo Uniamazonia completada ===");
  console.log(JSON.stringify(resultado, null, 2));
}
