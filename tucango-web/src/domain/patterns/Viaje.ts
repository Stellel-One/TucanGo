import { randomInt } from "node:crypto";
import { ValidacionError } from "../security/ErroresAuth.ts";
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

export type EtapaTracking =
  | "BUSCANDO"
  | "CAMINO_ORIGEN"
  | "EN_VIAJE"
  | "COMPLETADO"
  | "CANCELADO";

/**
 * El PIN es un secreto entre el pasajero y el conductor. Derivarlo del código
 * secuencial del viaje lo hacía predecible, así que se genera al azar.
 */
function generarPinSeguridad(): string {
  return String(randomInt(1000, 10000));
}

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
  private _pinSeguridad: string;
  private _progresoRuta: number = 0;
  private _etapaTracking: EtapaTracking = "BUSCANDO";
  private _ubicacionMotoristaLat?: number;
  private _ubicacionMotoristaLng?: number;
  private _direccionMotoristaGrados: number = 0;

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
      throw new ValidacionError("El código de viaje es obligatorio.");
    }
    if (!origen || origen.trim().length === 0) {
      throw new ValidacionError("El origen del viaje es obligatorio.");
    }
    if (!destino || destino.trim().length === 0) {
      throw new ValidacionError("El destino del viaje es obligatorio.");
    }
    if (!Number.isFinite(distanciaKm) || distanciaKm <= 0) {
      throw new ValidacionError("La distancia estimada debe ser un número mayor a cero.");
    }
    if (!estudiante) {
      throw new ValidacionError("El estudiante que solicita el viaje es obligatorio.");
    }

    this._codigoViaje = codigoViaje.trim();
    this._origen = origen.trim();
    this._destino = destino.trim();
    this._distanciaKm = distanciaKm;
    this._estudiante = estudiante;
    this._estrategiaTarifa = estrategiaTarifa;
    this._tarifa = this._estrategiaTarifa.calcular(distanciaKm, 3000);
    if (!Number.isFinite(this._tarifa) || this._tarifa <= 0) {
      throw new ValidacionError("No se pudo calcular una tarifa válida para el viaje.");
    }
    this._pago = new Pago(this._tarifa, metodoPago);
    this._calificaciones = [];
    this._fechaCreacion = new Date();
    this._estado = new EstadoSolicitado();
    this._pinSeguridad = generarPinSeguridad();
    this._etapaTracking = "BUSCANDO";
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

  public get pinSeguridad(): string {
    return this._pinSeguridad;
  }

  public get progresoRuta(): number {
    return this._progresoRuta;
  }

  public get etapaTracking(): EtapaTracking {
    return this._etapaTracking;
  }

  public get ubicacionMotoristaLat(): number | undefined {
    return this._ubicacionMotoristaLat;
  }

  public get ubicacionMotoristaLng(): number | undefined {
    return this._ubicacionMotoristaLng;
  }

  public get direccionMotoristaGrados(): number {
    return this._direccionMotoristaGrados;
  }

  // --- Delegación a la Máquina de Estados (State Pattern) ---
  public aceptar(motorista: Motorista): void {
    this._estado.aceptar(this, motorista);
    this._etapaTracking = "CAMINO_ORIGEN";
    this._progresoRuta = 0;
    this._ubicacionMotoristaLat = motorista.ubicacionActual.latitud;
    this._ubicacionMotoristaLng = motorista.ubicacionActual.longitud;
    this._direccionMotoristaGrados = motorista.direccionGrados;
  }

  public iniciar(pinIngresado: string): void {
    if (!pinIngresado || pinIngresado.trim() !== this._pinSeguridad) {
      throw new ValidacionError("El PIN de seguridad es obligatorio y debe coincidir con el código del estudiante.");
    }
    this._estado.iniciar(this);
    this._etapaTracking = "EN_VIAJE";
    this._progresoRuta = 0;
  }

  public finalizar(): void {
    this._estado.finalizar(this);
    this._etapaTracking = "COMPLETADO";
    this._progresoRuta = 100;
  }

  public cancelar(motivo: string): void {
    this._estado.cancelar(this, motivo);
    this._etapaTracking = "CANCELADO";
  }

  public actualizarTracking(
    progreso: number,
    lat: number,
    lng: number,
    direccionGrados: number
  ): void {
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      throw new ValidacionError("La latitud de seguimiento debe estar entre -90 y 90 grados.");
    }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      throw new ValidacionError("La longitud de seguimiento debe estar entre -180 y 180 grados.");
    }
    if (!Number.isFinite(progreso)) {
      throw new ValidacionError("El progreso de ruta debe ser un número válido.");
    }
    this._progresoRuta = Math.max(0, Math.min(100, Math.round(progreso)));
    this._ubicacionMotoristaLat = lat;
    this._ubicacionMotoristaLng = lng;
    this._direccionMotoristaGrados = Number.isFinite(direccionGrados)
      ? ((Math.round(direccionGrados) % 360) + 360) % 360
      : 0;
  }

  public confirmarLlegadaSegura(): void {
    if (this._estado.nombre !== "FINALIZADO") {
      throw new ValidacionError("Solo se puede confirmar llegada segura cuando el viaje está finalizado.");
    }
    if (this._llegadaSeguraConfirmada) {
      throw new ValidacionError("La llegada segura ya fue confirmada para este viaje.");
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
      throw new ValidacionError("La calificación no puede ser nula.");
    }
    if (this._estado.nombre !== "FINALIZADO") {
      throw new ValidacionError("Solo se puede calificar un viaje que haya finalizado.");
    }
    if (this._calificaciones.length >= 2) {
      throw new ValidacionError("El viaje ya cuenta con las calificaciones del estudiante y del motorista.");
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
    pinSeguridad?: string;
    progresoRuta?: number;
    etapaTracking?: string;
    ubicacionMotoristaLat?: number;
    ubicacionMotoristaLng?: number;
    direccionMotoristaGrados?: number;
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
    viaje._pinSeguridad = params.pinSeguridad || generarPinDesdeCodigo(params.codigoViaje);
    viaje._progresoRuta =
      typeof params.progresoRuta === "number" ? Math.max(0, Math.min(100, params.progresoRuta)) : 0;
    viaje._ubicacionMotoristaLat = params.ubicacionMotoristaLat;
    viaje._ubicacionMotoristaLng = params.ubicacionMotoristaLng;
    viaje._direccionMotoristaGrados = params.direccionMotoristaGrados ?? 0;
    viaje._calificaciones = [...params.calificaciones];

    switch (params.estadoNombre) {
      case "ACEPTADO":
        viaje._estado = new EstadoAceptado();
        viaje._etapaTracking = (params.etapaTracking as EtapaTracking) || "CAMINO_ORIGEN";
        break;
      case "EN_CURSO":
        viaje._estado = new EstadoEnCurso();
        viaje._etapaTracking = (params.etapaTracking as EtapaTracking) || "EN_VIAJE";
        break;
      case "FINALIZADO":
        viaje._estado = new EstadoFinalizado();
        viaje._etapaTracking = "COMPLETADO";
        viaje._progresoRuta = 100;
        break;
      case "CANCELADO":
        viaje._estado = new EstadoCancelado();
        viaje._etapaTracking = "CANCELADO";
        break;
      default:
        viaje._estado = new EstadoSolicitado();
        viaje._etapaTracking = "BUSCANDO";
        break;
    }

    return viaje;
  }
}
