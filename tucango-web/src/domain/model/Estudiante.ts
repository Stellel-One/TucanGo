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
    carrera: string
  ) {
    super(identificacion, nombre, telefono, correoInstitucional);

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

  public override obtenerRol(): string {
    return "ESTUDIANTE";
  }
}
