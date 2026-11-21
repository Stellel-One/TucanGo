import { ValidacionError } from "./ErroresAuth.ts";

export class Moto {
  private _placa: string;
  private _marca: string;
  private _modelo: string;
  private _cilindraje: number;
  private _activa: boolean;
  private _soatVigente: boolean;
  private _numeroSoat: string;

  constructor(
    placa: string,
    marca: string,
    modelo: string,
    cilindraje: number,
    activa: boolean = false,
    soatVigente: boolean = true,
    numeroSoat: string = "SOAT-VIGENTE"
  ) {
    if (!placa || placa.trim().length === 0) {
      throw new ValidacionError("La placa de la moto es obligatoria.");
    }
    if (!marca || marca.trim().length === 0) {
      throw new ValidacionError("La marca de la moto es obligatoria.");
    }
    // Number.isFinite atrapa NaN e Infinity: "abc" no es un cilindraje válido.
    if (!Number.isFinite(cilindraje) || cilindraje <= 0) {
      throw new ValidacionError("El cilindraje debe ser un número mayor a cero.");
    }
    if (activa && !soatVigente) {
      throw new ValidacionError("No se puede activar una motocicleta sin SOAT vigente.");
    }

    this._placa = placa.trim().toUpperCase();
    this._marca = marca.trim();
    this._modelo = modelo.trim();
    this._cilindraje = cilindraje;
    this._activa = activa;
    this._soatVigente = soatVigente;
    this._numeroSoat = (numeroSoat || "SOAT-VIGENTE").trim().toUpperCase();
  }

  public get placa(): string {
    return this._placa;
  }

  public get marca(): string {
    return this._marca;
  }

  public get modelo(): string {
    return this._modelo;
  }

  public get cilindraje(): number {
    return this._cilindraje;
  }

  public get activa(): boolean {
    return this._activa;
  }

  public set activa(estado: boolean) {
    if (estado && !this._soatVigente) {
      throw new ValidacionError("No se puede activar una motocicleta sin SOAT vigente.");
    }
    this._activa = estado;
  }

  public get soatVigente(): boolean {
    return this._soatVigente;
  }

  public get numeroSoat(): string {
    return this._numeroSoat;
  }

  public get descripcionCorta(): string {
    return `${this._marca} ${this._modelo} (${this._cilindraje}cc) - Placa: ${this._placa}`;
  }

  public actualizarDatos(datos: {
    placa?: string;
    marca?: string;
    modelo?: string;
    cilindraje?: number;
    numeroSoat?: string;
  }): void {
    if (datos.placa !== undefined) {
      if (datos.placa.trim().length === 0) {
        throw new ValidacionError("La placa de la moto es obligatoria.");
      }
      this._placa = datos.placa.trim().toUpperCase();
    }
    if (datos.marca !== undefined) {
      if (datos.marca.trim().length === 0) {
        throw new ValidacionError("La marca de la moto es obligatoria.");
      }
      this._marca = datos.marca.trim();
    }
    if (datos.modelo !== undefined) {
      if (datos.modelo.trim().length === 0) {
        throw new ValidacionError("El modelo de la moto es obligatorio.");
      }
      this._modelo = datos.modelo.trim();
    }
    if (datos.cilindraje !== undefined) {
      if (!Number.isFinite(datos.cilindraje) || datos.cilindraje <= 0) {
        throw new ValidacionError("El cilindraje debe ser mayor a cero.");
      }
      this._cilindraje = Math.round(datos.cilindraje);
    }
    if (datos.numeroSoat !== undefined) {
      if (datos.numeroSoat.trim().length < 6) {
        throw new ValidacionError("El número de póliza SOAT debe contener al menos 6 caracteres válidos.");
      }
      this._numeroSoat = datos.numeroSoat.trim().toUpperCase();
    }
  }
}
