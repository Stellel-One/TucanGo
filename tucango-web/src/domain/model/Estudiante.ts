import { Persona } from "./Persona.ts";

export class Estudiante extends Persona {
  private _codigoEstudiantil: string;
  private _carrera: string;

  constructor(
    identificacion: string,
    nombre: string,
    telefono: string,
    correoInstitucional: string,
    codigoEstudiantil: string,
    carrera: string,
    passwordHash: string = "",
    debeCambiarPassword: boolean = false
  ) {
    super(identificacion, nombre, telefono, correoInstitucional, passwordHash, debeCambiarPassword);

    if (!codigoEstudiantil || codigoEstudiantil.trim().length === 0) {
      throw new Error("El código estudiantil es obligatorio.");
    }
    if (!carrera || carrera.trim().length === 0) {
      throw new Error("La carrera es obligatoria.");
    }

    this._codigoEstudiantil = codigoEstudiantil.trim();
    this._carrera = carrera.trim();
  }

  public get codigoEstudiantil(): string {
    return this._codigoEstudiantil;
  }

  public get carrera(): string {
    return this._carrera;
  }

  public actualizarPerfil(datos: {
    nombre?: string;
    telefono?: string;
    correoInstitucional?: string;
    codigoEstudiantil?: string;
    carrera?: string;
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
    if (datos.codigoEstudiantil !== undefined) {
      if (datos.codigoEstudiantil.trim().length === 0) {
        throw new Error("El código estudiantil es obligatorio.");
      }
      this._codigoEstudiantil = datos.codigoEstudiantil.trim();
    }
    if (datos.carrera !== undefined) {
      if (datos.carrera.trim().length === 0) {
        throw new Error("La carrera es obligatoria.");
      }
      this._carrera = datos.carrera.trim();
    }
  }

  public override obtenerRol(): string {
    return "ESTUDIANTE";
  }
}
