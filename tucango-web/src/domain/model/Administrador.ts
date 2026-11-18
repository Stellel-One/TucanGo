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

  public actualizarPerfil(datos: {
    nombre?: string;
    telefono?: string;
    correoInstitucional?: string;
    cargo?: string;
    contactoEmergencia?: string;
    sedeFavorita?: string;
  }): void {
    this.actualizarDatosBasicos(
      datos.nombre ?? this.nombre,
      datos.telefono ?? this.telefono,
      datos.correoInstitucional ?? this.correoInstitucional,
      datos.contactoEmergencia,
      datos.sedeFavorita
    );
    if (datos.cargo !== undefined && datos.cargo.trim().length > 0) {
      this._cargo = datos.cargo.trim();
    }
  }

  public override obtenerRol(): string {
    return "ADMIN";
  }
}
