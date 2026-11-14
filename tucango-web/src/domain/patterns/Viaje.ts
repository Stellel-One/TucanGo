import { Estudiante } from "../model/Estudiante.ts";
import { Motorista } from "../model/Motorista.ts";
import { Pago, MetodoPago, type EstadoPago } from "../model/Pago.ts";
import { Calificacion } from "../model/Calificacion.ts";
import {
  type EstadoViaje,
  EstadoSolicitado,
  EstadoAceptado,
  EstadoEnCurso,
  EstadoFinalizado,
  EstadoCancelado
} from "./EstadoViaje.ts";
import { type EstrategiaTarifa, TarifaEstudiantilFija } from "./EstrategiaTarifa.ts";

export class Viaje {
  private _codigoViaje: string;
  private _origen: string;
  private _destino: string;
  private _distanciaKm: number;
  private _estudiante: Estudiante;
  private _motorista?: Motorista;
  private _estado: EstadoViaje;
  private _estrategiaTarifa: EstrategiaTarifa;
  private _tarifa: number;
  private _pago: Pago;
  private _calificaciones: Calificacion[];
  private _motivoCancelacion?: string;
  private _fechaCreacion: Date;
  private _llegadaSeguraConfirmada: boolean = false;
  private _fechaLlegadaSegura?: Date;

  constructor(
    codigoViaje: string,
    origen: string,
    destino: string,
    distanciaKm: number,
    estudiante: Estudiante,
    estrategiaTarifa: EstrategiaTarifa = new TarifaEstudiantilFija(),
    metodoPago: MetodoPago = MetodoPago.EFECTIVO
  ) {
    if (!codigoViaje || codigoViaje.trim().length === 0) {
      throw new Error("El código de viaje es obligatorio.");
    }
    if (!origen || origen.trim().length === 0) {
      throw new Error("El origen del viaje es obligatorio.");
    }
    if (!destino || destino.trim().length === 0) {
      throw new Error("El destino del viaje es obligatorio.");
    }
    if (distanciaKm <= 0) {
      throw new Error("La distancia estimada debe ser mayor a cero.");
    }
    if (!estudiante) {
      throw new Error("El estudiante que solicita el viaje es obligatorio.");
    }

    this._codigoViaje = codigoViaje.trim();
    this._origen = origen.trim();
    this._destino = destino.trim();
    this._distanciaKm = distanciaKm;
    this._estudiante = estudiante;
    this._estrategiaTarifa = estrategiaTarifa;
    this._tarifa = this._estrategiaTarifa.calcular(distanciaKm, 3000);
    this._pago = new Pago(this._tarifa, metodoPago);
    this._calificaciones = [];
    this._fechaCreacion = new Date();
    this._estado = new EstadoSolicitado();
  }

  // --- Getters de Encapsulamiento ---
  public get codigoViaje(): string {
    return this._codigoViaje;
  }

  public get origen(): string {
    return this._origen;
  }

  public get destino(): string {
    return this._destino;
  }

  public get distanciaKm(): number {
    return this._distanciaKm;
  }

  public get estudiante(): Estudiante {
    return this._estudiante;
  }

  public get motorista(): Motorista | undefined {
    return this._motorista;
  }

  public get estado(): EstadoViaje {
    return this._estado;
  }

  public get tarifa(): number {
    return this._tarifa;
  }

  public get pago(): Pago {
    return this._pago;
  }

  public get estrategiaTarifa(): EstrategiaTarifa {
    return this._estrategiaTarifa;
  }

  public get calificaciones(): readonly Calificacion[] {
    return [...this._calificaciones];
  }

  public get motivoCancelacion(): string | undefined {
    return this._motivoCancelacion;
  }

  public get fechaCreacion(): Date {
    return this._fechaCreacion;
  }

  public get llegadaSeguraConfirmada(): boolean {
    return this._llegadaSeguraConfirmada;
  }

  public get fechaLlegadaSegura(): Date | undefined {
    return this._fechaLlegadaSegura;
  }

  // --- Delegación a la Máquina de Estados (State Pattern) ---
  public aceptar(motorista: Motorista): void {
    this._estado.aceptar(this, motorista);
  }

  public iniciar(): void {
    this._estado.iniciar(this);
  }

  public finalizar(): void {
    this._estado.finalizar(this);
  }

  public cancelar(motivo: string): void {
    this._estado.cancelar(this, motivo);
  }

  public confirmarLlegadaSegura(): void {
    if (this._estado.nombre !== "FINALIZADO") {
      throw new Error("Solo se puede confirmar llegada segura cuando el viaje está finalizado.");
    }
    if (this._llegadaSeguraConfirmada) {
      throw new Error("La llegada segura ya fue confirmada para este viaje.");
    }
    this._llegadaSeguraConfirmada = true;
    this._fechaLlegadaSegura = new Date();
  }

  // --- Métodos de Transición Interna ---
  public cambiarEstado(nuevoEstado: EstadoViaje): void {
    this._estado = nuevoEstado;
  }

  public asignarMotorista(motorista: Motorista): void {
    this._motorista = motorista;
  }

  public registrarMotivoCancelacion(motivo: string): void {
    this._motivoCancelacion = motivo;
  }

  public agregarCalificacion(calificacion: Calificacion): void {
    if (!calificacion) {
      throw new Error("La calificación no puede ser nula.");
    }
    if (this._estado.nombre !== "FINALIZADO") {
      throw new Error("Solo se puede calificar un viaje que haya finalizado.");
    }
    if (this._calificaciones.length >= 2) {
      throw new Error("El viaje ya cuenta con las calificaciones del estudiante y del motorista.");
    }
    this._calificaciones.push(calificacion);
  }

  public static reconstruir(params: {
    codigoViaje: string;
    origen: string;
    destino: string;
    distanciaKm: number;
    estudiante: Estudiante;
    motorista?: Motorista;
    estrategiaTarifa: EstrategiaTarifa;
    tarifa: number;
    pago: Pago;
    estadoNombre: string;
    motivoCancelacion?: string;
    fechaCreacion: string;
    llegadaSeguraConfirmada: boolean;
    fechaLlegadaSegura?: string;
    calificaciones: Calificacion[];
  }): Viaje {
    const viaje = new Viaje(
      params.codigoViaje,
      params.origen,
      params.destino,
      params.distanciaKm,
      params.estudiante,
      params.estrategiaTarifa,
      params.pago.metodo
    );

    viaje._tarifa = params.tarifa;
    viaje._pago = params.pago;
    viaje._motorista = params.motorista;
    viaje._motivoCancelacion = params.motivoCancelacion;
    viaje._fechaCreacion = new Date(params.fechaCreacion);
    viaje._llegadaSeguraConfirmada = params.llegadaSeguraConfirmada;
    viaje._fechaLlegadaSegura = params.fechaLlegadaSegura
      ? new Date(params.fechaLlegadaSegura)
      : undefined;
    viaje._calificaciones = [...params.calificaciones];

    switch (params.estadoNombre) {
      case "ACEPTADO":
        viaje._estado = new EstadoAceptado();
        break;
      case "EN_CURSO":
        viaje._estado = new EstadoEnCurso();
        break;
      case "FINALIZADO":
        viaje._estado = new EstadoFinalizado();
        break;
      case "CANCELADO":
        viaje._estado = new EstadoCancelado();
        break;
      default:
        viaje._estado = new EstadoSolicitado();
        break;
    }

    return viaje;
  }
}
