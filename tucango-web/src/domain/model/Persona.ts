export abstract class Persona {
  private _identificacion: string;
  private _nombre: string;
  private _telefono: string;
  private _correoInstitucional: string;

  constructor(
    identificacion: string,
    nombre: string,
    telefono: string,
    correoInstitucional: string
  ) {
    if (!identificacion || identificacion.trim().length === 0) {
      throw new Error("La identificación no puede estar vacía.");
    }
    if (!nombre || nombre.trim().length === 0) {
      throw new Error("El nombre no puede estar vacío.");
    }
    if (!telefono || telefono.trim().length === 0) {
      throw new Error("El teléfono no puede estar vacío.");
    }
    if (!correoInstitucional || !correoInstitucional.includes("@")) {
      throw new Error("El correo institucional debe ser válido.");
    }

    this._identificacion = identificacion.trim();
    this._nombre = nombre.trim();
    this._telefono = telefono.trim();
    this._correoInstitucional = correoInstitucional.trim().toLowerCase();
  }

  public get identificacion(): string {
    return this._identificacion;
  }

  public get nombre(): string {
    return this._nombre;
  }

  public get telefono(): string {
    return this._telefono;
  }

  public get correoInstitucional(): string {
    return this._correoInstitucional;
  }

  public set telefono(nuevoTelefono: string) {
    if (!nuevoTelefono || nuevoTelefono.trim().length === 0) {
      throw new Error("El teléfono no puede estar vacío.");
    }
    this._telefono = nuevoTelefono.trim();
  }

  public abstract obtenerRol(): string;
}
