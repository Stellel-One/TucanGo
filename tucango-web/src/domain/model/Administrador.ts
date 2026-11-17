import { Persona } from "./Persona.ts";

export class Administrador extends Persona {
  private _cargo: string;

  constructor(
    identificacion: string,
    nombre: string,
    telefono: string,
    correoInstitucional: string,
    cargo: string = "Supervisión General TucanGo",
    passwordHash: string = "",
    debeCambiarPassword: boolean = false
  ) {
    super(identificacion, nombre, telefono, correoInstitucional, passwordHash, debeCambiarPassword);
    this._cargo = cargo.trim();
  }

  public get cargo(): string {
    return this._cargo;
  }

  public override obtenerRol(): string {
    return "ADMIN";
  }
}
