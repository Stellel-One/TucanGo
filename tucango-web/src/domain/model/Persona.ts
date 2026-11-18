import { hashPassword, verifyPassword } from "../security/PasswordHasher.ts";

export abstract class Persona {
  private _identificacion: string;
  private _nombre: string;
  private _telefono: string;
  private _correoInstitucional: string;
  private _passwordHash: string;
  private _debeCambiarPassword: boolean;
  private _contactoEmergencia: string;
  private _sedeFavorita: string;

  constructor(
    identificacion: string,
    nombre: string,
    telefono: string,
    correoInstitucional: string,
    passwordHash: string = "",
    debeCambiarPassword: boolean = false,
    contactoEmergencia: string = "",
    sedeFavorita: string = "PORVENIR"
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
    this._passwordHash = passwordHash;
    this._debeCambiarPassword = debeCambiarPassword;
    this._contactoEmergencia = (contactoEmergencia || "").trim();
    this._sedeFavorita = (sedeFavorita || "PORVENIR").trim() || "PORVENIR";
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

  public get contactoEmergencia(): string {
    return this._contactoEmergencia;
  }

  public set contactoEmergencia(valor: string) {
    this._contactoEmergencia = (valor || "").trim();
  }

  public get sedeFavorita(): string {
    return this._sedeFavorita;
  }

  public set sedeFavorita(valor: string) {
    this._sedeFavorita = (valor || "PORVENIR").trim() || "PORVENIR";
  }

  public actualizarDatosBasicos(
    nombre: string,
    telefono: string,
    correoInstitucional: string,
    contactoEmergencia?: string,
    sedeFavorita?: string
  ): void {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error("El nombre no puede estar vacío.");
    }
    if (!telefono || telefono.trim().length === 0) {
      throw new Error("El teléfono no puede estar vacío.");
    }
    if (!correoInstitucional || !correoInstitucional.includes("@")) {
      throw new Error("El correo institucional debe ser válido.");
    }
    this._nombre = nombre.trim();
    this._telefono = telefono.trim();
    this._correoInstitucional = correoInstitucional.trim().toLowerCase();
    if (contactoEmergencia !== undefined) {
      this._contactoEmergencia = contactoEmergencia.trim();
    }
    if (sedeFavorita !== undefined) {
      this._sedeFavorita = sedeFavorita.trim() || "PORVENIR";
    }
  }

  public get passwordHash(): string {
    return this._passwordHash;
  }

  public get debeCambiarPassword(): boolean {
    return this._debeCambiarPassword;
  }

  public set debeCambiarPassword(valor: boolean) {
    this._debeCambiarPassword = valor;
  }

  public asignarPasswordHash(hash: string): void {
    this._passwordHash = hash;
  }

  public async establecerPassword(plain: string): Promise<void> {
    this._passwordHash = await hashPassword(plain);
  }

  public async verificarPassword(plain: string): Promise<boolean> {
    if (!this._passwordHash) return false;
    return verifyPassword(plain, this._passwordHash);
  }

  public abstract obtenerRol(): string;
}
