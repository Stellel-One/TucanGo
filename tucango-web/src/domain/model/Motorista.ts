import { Persona } from "./Persona.ts";
import { Moto } from "./Moto.ts";

export class Motorista extends Persona {
  private _disponible: boolean;
  private _motos: Moto[];

  constructor(
    identificacion: string,
    nombre: string,
    telefono: string,
    correoInstitucional: string,
    disponible: boolean = true
  ) {
    super(identificacion, nombre, telefono, correoInstitucional);
    this._disponible = disponible;
    this._motos = [];
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
