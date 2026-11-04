import { Estudiante } from "../domain/model/Estudiante.ts";
import { Motorista } from "../domain/model/Motorista.ts";
import { Moto } from "../domain/model/Moto.ts";
import { Calificacion } from "../domain/model/Calificacion.ts";
import { MetodoPago } from "../domain/model/Pago.ts";
import { Viaje } from "../domain/patterns/Viaje.ts";
import {
  type EstrategiaTarifa,
  TarifaEstudiantilFija,
  TarifaPorKilometro,
  TarifaDinamicaLluvia,
  TarifaNocturna
} from "../domain/patterns/EstrategiaTarifa.ts";

export class TucanGoFacade {
  private _estudiantes: Map<string, Estudiante> = new Map();
  private _motoristas: Map<string, Motorista> = new Map();
  private _viajes: Map<string, Viaje> = new Map();
  private _contadorViajes: number = 100;

  constructor() {
    this.cargarDatosSemilla();
  }

  // --- Inicialización de Semillas para Demo / Universidad ---
  private cargarDatosSemilla(): void {
    // 2 Estudiantes
    const est1 = new Estudiante(
      "1001",
      "Carlos Rivera",
      "3115551234",
      "c.rivera@uniamazonia.edu.co",
      "EST-2024-001",
      "Ingeniería de Sistemas"
    );
    const est2 = new Estudiante(
      "1002",
      "Laura Gómez",
      "3127778899",
      "l.gomez@uniamazonia.edu.co",
      "EST-2024-045",
      "Medicina Veterinaria"
    );
    this._estudiantes.set(est1.identificacion, est1);
    this._estudiantes.set(est2.identificacion, est2);

    // 2 Motoristas con sus motos
    const mot1 = new Motorista(
      "2001",
      "Jhonatan 'El Tucán' Silva",
      "3201234567",
      "j.silva@uniamazonia.edu.co"
    );
    const moto1 = new Moto("GNX-45F", "Suzuki", "GN 125", 125, true);
    mot1.registrarMoto(moto1);

    const mot2 = new Motorista(
      "2002",
      "Diana Marcela Castro",
      "3109876543",
      "d.castro@uniamazonia.edu.co"
    );
    const moto2 = new Moto("TUK-89D", "Yamaha", "Crypton FI", 115, true);
    mot2.registrarMoto(moto2);

    this._motoristas.set(mot1.identificacion, mot1);
    this._motoristas.set(mot2.identificacion, mot2);
  }

  // --- Casos de Uso: Estudiantes y Motoristas ---
  public obtenerEstudiantes(): Estudiante[] {
    return Array.from(this._estudiantes.values());
  }

  public obtenerMotoristas(): Motorista[] {
    return Array.from(this._motoristas.values());
  }

  public registrarEstudiante(estudiante: Estudiante): void {
    this._estudiantes.set(estudiante.identificacion, estudiante);
  }

  public registrarMotorista(motorista: Motorista): void {
    this._motoristas.set(motorista.identificacion, motorista);
  }

  // --- Estrategias de Tarifa Disponibles ---
  public resolverEstrategiaTarifa(tipo: string): EstrategiaTarifa {
    switch ((tipo || "").toLowerCase()) {
      case "distancia":
        return new TarifaPorKilometro();
      case "lluvia":
        return new TarifaDinamicaLluvia();
      case "nocturna":
        return new TarifaNocturna();
      case "estudiantil":
      default:
        return new TarifaEstudiantilFija();
    }
  }

  // --- Casos de Uso: Ciclo de Vida del Viaje (Uber/InDrive Core) ---
  public solicitarViaje(
    estudianteId: string,
    origen: string,
    destino: string,
    distanciaKm: number,
    tipoTarifa: string = "estudiantil",
    metodoPago: MetodoPago = MetodoPago.EFECTIVO
  ): Viaje {
    const estudiante = this._estudiantes.get(estudianteId);
    if (!estudiante) {
      throw new Error(`Estudiante con ID ${estudianteId} no encontrado.`);
    }

    this._contadorViajes++;
    const codigo = `TUC-${this._contadorViajes}`;
    const estrategia = this.resolverEstrategiaTarifa(tipoTarifa);

    const viaje = new Viaje(
      codigo,
      origen,
      destino,
      distanciaKm,
      estudiante,
      estrategia,
      metodoPago
    );

    this._viajes.set(codigo, viaje);
    return viaje;
  }

  public aceptarViaje(codigoViaje: string, motoristaId: string): Viaje {
    const viaje = this._viajes.get(codigoViaje);
    if (!viaje) {
      throw new Error(`Viaje con código ${codigoViaje} no existe.`);
    }
    const motorista = this._motoristas.get(motoristaId);
    if (!motorista) {
      throw new Error(`Motorista con ID ${motoristaId} no encontrado.`);
    }

    viaje.aceptar(motorista);
    return viaje;
  }

  public iniciarViaje(codigoViaje: string): Viaje {
    const viaje = this._viajes.get(codigoViaje);
    if (!viaje) {
      throw new Error(`Viaje con código ${codigoViaje} no existe.`);
    }
    viaje.iniciar();
    return viaje;
  }

  public finalizarViaje(codigoViaje: string): Viaje {
    const viaje = this._viajes.get(codigoViaje);
    if (!viaje) {
      throw new Error(`Viaje con código ${codigoViaje} no existe.`);
    }
    viaje.finalizar();
    return viaje;
  }

  public cancelarViaje(codigoViaje: string, motivo: string): Viaje {
    const viaje = this._viajes.get(codigoViaje);
    if (!viaje) {
      throw new Error(`Viaje con código ${codigoViaje} no existe.`);
    }
    viaje.cancelar(motivo);
    return viaje;
  }

  public calificarViaje(
    codigoViaje: string,
    puntuacion: number,
    comentario: string,
    autorId: string
  ): Viaje {
    const viaje = this._viajes.get(codigoViaje);
    if (!viaje) {
      throw new Error(`Viaje con código ${codigoViaje} no existe.`);
    }
    viaje.agregarCalificacion(new Calificacion(puntuacion, comentario, autorId));
    return viaje;
  }

  public obtenerViaje(codigoViaje: string): Viaje | undefined {
    return this._viajes.get(codigoViaje);
  }

  public obtenerTodosLosViajes(): Viaje[] {
    return Array.from(this._viajes.values());
  }

  public obtenerMetricas(): {
    totalViajes: number;
    finalizados: number;
    solicitados: number;
    enCurso: number;
    ingresosGenerados: number;
  } {
    const viajes = Array.from(this._viajes.values());
    const finalizados = viajes.filter((v) => v.estado.nombre === "FINALIZADO");
    const solicitados = viajes.filter((v) => v.estado.nombre === "SOLICITADO");
    const enCurso = viajes.filter((v) => v.estado.nombre === "EN_CURSO" || v.estado.nombre === "ACEPTADO");
    const ingresosGenerados = finalizados.reduce((acc, v) => acc + v.tarifa, 0);

    return {
      totalViajes: viajes.length,
      finalizados: finalizados.length,
      solicitados: solicitados.length,
      enCurso: enCurso.length,
      ingresosGenerados
    };
  }
}
