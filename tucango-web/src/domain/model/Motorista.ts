import { Persona } from "./Persona.ts";
import { Moto } from "./Moto.ts";
import { Coordenada } from "./Coordenada.ts";

export type EstadoAprobacionTucan = "PENDIENTE_APROBACION" | "ACTIVO" | "RECHAZADO";

function calcularRumboEntre(origen: Coordenada, destino: Coordenada): number {
  const lat1 = (origen.latitud * Math.PI) / 180;
  const lat2 = (destino.latitud * Math.PI) / 180;
  const dLon = ((destino.longitud - origen.longitud) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

export class Motorista extends Persona {
  private _disponible: boolean;
  private _motos: Moto[];
  private _ubicacionActual: Coordenada;
  private _direccionGrados: number;
  private _estadoAprobacion: EstadoAprobacionTucan;
  private _fotoRostroUrl: string;
  private _fotoMotoUrl: string;
  private _fotoSoatUrl: string;
  private _fotoLicenciaUrl: string;
  private _compromisoAceptado: boolean;
  private _motivoRechazo?: string;
  private _fechaAprobacion?: Date;
  private _correoBienvenidaEnviado: boolean;

  constructor(
    identificacion: string,
    nombre: string,
    telefono: string,
    correoInstitucional: string,
    disponible: boolean = true,
    ubicacionActual?: Coordenada,
    direccionGrados: number = 0,
    passwordHash: string = "",
    debeCambiarPassword: boolean = false,
    estadoAprobacion: EstadoAprobacionTucan = "ACTIVO",
    fotoRostroUrl: string = "",
    fotoMotoUrl: string = "",
    fotoSoatUrl: string = "",
    fotoLicenciaUrl: string = "",
    compromisoAceptado: boolean = true,
    motivoRechazo?: string,
    fechaAprobacion?: Date,
    correoBienvenidaEnviado: boolean = false
  ) {
    super(identificacion, nombre, telefono, correoInstitucional, passwordHash, debeCambiarPassword);
    this._disponible = disponible;
    this._motos = [];
    this._ubicacionActual = ubicacionActual ?? new Coordenada(1.6185, -75.6065);
    this._direccionGrados = Number.isFinite(direccionGrados)
      ? ((Math.round(direccionGrados) % 360) + 360) % 360
      : 0;
    this._estadoAprobacion = estadoAprobacion;
    this._fotoRostroUrl = fotoRostroUrl;
    this._fotoMotoUrl = fotoMotoUrl;
    this._fotoSoatUrl = fotoSoatUrl;
    this._fotoLicenciaUrl = fotoLicenciaUrl;
    this._compromisoAceptado = compromisoAceptado;
    this._motivoRechazo = motivoRechazo;
    this._fechaAprobacion = fechaAprobacion;
    this._correoBienvenidaEnviado = correoBienvenidaEnviado;
  }

  public get disponible(): boolean {
    return this._disponible;
  }

  public set disponible(valor: boolean) {
    if (this._estadoAprobacion !== "ACTIVO" && valor) {
      throw new Error("Un Tucán no puede activarse si su estado no es ACTIVO y verificado por la administración.");
    }
    this._disponible = valor;
  }

  public get estadoAprobacion(): EstadoAprobacionTucan {
    return this._estadoAprobacion;
  }

  public set estadoAprobacion(valor: EstadoAprobacionTucan) {
    this._estadoAprobacion = valor;
  }

  public get fotoRostroUrl(): string {
    return this._fotoRostroUrl;
  }

  public set fotoRostroUrl(url: string) {
    this._fotoRostroUrl = url;
  }

  public get fotoMotoUrl(): string {
    return this._fotoMotoUrl;
  }

  public set fotoMotoUrl(url: string) {
    this._fotoMotoUrl = url;
  }

  public get fotoSoatUrl(): string {
    return this._fotoSoatUrl;
  }

  public set fotoSoatUrl(url: string) {
    this._fotoSoatUrl = url;
  }

  public get fotoLicenciaUrl(): string {
    return this._fotoLicenciaUrl;
  }

  public set fotoLicenciaUrl(url: string) {
    this._fotoLicenciaUrl = url;
  }

  public get compromisoAceptado(): boolean {
    return this._compromisoAceptado;
  }

  public set compromisoAceptado(valor: boolean) {
    this._compromisoAceptado = valor;
  }

  public get motivoRechazo(): string | undefined {
    return this._motivoRechazo;
  }

  public set motivoRechazo(motivo: string | undefined) {
    this._motivoRechazo = motivo;
  }

  public get fechaAprobacion(): Date | undefined {
    return this._fechaAprobacion;
  }

  public set fechaAprobacion(fecha: Date | undefined) {
    this._fechaAprobacion = fecha;
  }

  public get correoBienvenidaEnviado(): boolean {
    return this._correoBienvenidaEnviado;
  }

  public set correoBienvenidaEnviado(valor: boolean) {
    this._correoBienvenidaEnviado = valor;
  }

  public get motos(): readonly Moto[] {
    return [...this._motos];
  }

  public get ubicacionActual(): Coordenada {
    return this._ubicacionActual;
  }

  public get direccionGrados(): number {
    return this._direccionGrados;
  }

  public actualizarUbicacion(nuevaUbicacion: Coordenada, direccionGrados?: number): void {
    if (!nuevaUbicacion) {
      throw new Error("La nueva ubicación del motorista es obligatoria.");
    }
    if (direccionGrados !== undefined) {
      if (!Number.isFinite(direccionGrados) || direccionGrados < 0 || direccionGrados > 360) {
        throw new Error("La dirección en grados debe estar entre 0 y 360.");
      }
      this._direccionGrados = ((Math.round(direccionGrados) % 360) + 360) % 360;
    } else if (
      this._ubicacionActual.latitud !== nuevaUbicacion.latitud ||
      this._ubicacionActual.longitud !== nuevaUbicacion.longitud
    ) {
      this._direccionGrados = calcularRumboEntre(this._ubicacionActual, nuevaUbicacion);
    }
    this._ubicacionActual = nuevaUbicacion;
  }

  public registrarMoto(moto: Moto): void {
    if (!moto) {
      throw new Error("La moto a registrar no puede ser nula.");
    }
    const existe = this._motos.some((m) => m.placa === moto.placa);
    if (existe) {
      throw new Error(`La moto con placa ${moto.placa} ya está registrada.`);
    }

    if (this._motos.length === 0) {
      moto.activa = true;
    }
    this._motos.push(moto);
  }

  public seleccionarMotoActiva(placa: string): boolean {
    if (!placa) return false;
    const encontrada = this._motos.some(
      (m) => m.placa.toUpperCase() === placa.trim().toUpperCase()
    );
    if (!encontrada) return false;

    for (const m of this._motos) {
      m.activa = m.placa.toUpperCase() === placa.trim().toUpperCase();
    }
    return true;
  }

  public obtenerMotoActiva(): Moto | undefined {
    return this._motos.find((m) => m.activa);
  }

  public override obtenerRol(): string {
    return "MOTORISTA";
  }
}
