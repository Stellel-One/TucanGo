import { Persona } from "./Persona.ts";
import { Moto } from "./Moto.ts";
import { Coordenada } from "./Coordenada.ts";

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

  constructor(
    identificacion: string,
    nombre: string,
    telefono: string,
    correoInstitucional: string,
    disponible: boolean = true,
    ubicacionActual?: Coordenada,
    direccionGrados: number = 0
  ) {
    super(identificacion, nombre, telefono, correoInstitucional);
    this._disponible = disponible;
    this._motos = [];
    this._ubicacionActual = ubicacionActual ?? new Coordenada(1.6185, -75.6065);
    this._direccionGrados = Number.isFinite(direccionGrados)
      ? ((Math.round(direccionGrados) % 360) + 360) % 360
      : 0;
  }

  public get disponible(): boolean {
    return this._disponible;
  }

  public set disponible(valor: boolean) {
    this._disponible = valor;
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
