import { ValidacionError } from "./ErroresAuth.ts";
export class Calificacion {
  private _puntuacion: number;
  private _comentario: string;
  private _autorIdentificacion: string;

  constructor(puntuacion: number, comentario: string, autorIdentificacion: string) {
    if (!Number.isFinite(puntuacion) || puntuacion < 1 || puntuacion > 5) {
      throw new ValidacionError("La puntuación debe estar entre 1.0 y 5.0 estrellas.");
    }
    if (!autorIdentificacion || autorIdentificacion.trim().length === 0) {
      throw new ValidacionError("La identificación del autor de la calificación es obligatoria.");
    }

    this._puntuacion = puntuacion;
    this._comentario = (comentario || "").trim();
    this._autorIdentificacion = autorIdentificacion.trim();
  }

  public get puntuacion(): number {
    return this._puntuacion;
  }

  public get comentario(): string {
    return this._comentario;
  }

  public get autorIdentificacion(): string {
    return this._autorIdentificacion;
  }
}
