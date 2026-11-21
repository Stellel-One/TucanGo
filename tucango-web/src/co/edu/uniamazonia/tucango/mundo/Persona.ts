import { ValidacionError } from "./ErroresAuth.ts";
import { hashPassword, verifyPassword } from "./PasswordHasher.ts";

export abstract class Persona {
  private _identificacion: string;
  private _nombre: string;
  private _telefono: string;
  private _correoInstitucional: string;
  private _usuario: string;
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
      throw new ValidacionError("La identificación no puede estar vacía.");
    }
    if (!nombre || nombre.trim().length === 0) {
      throw new ValidacionError("El nombre no puede estar vacío.");
    }
    if (!telefono || telefono.trim().length === 0) {
      throw new ValidacionError("El teléfono no puede estar vacío.");
    }
    if (!correoInstitucional || !correoInstitucional.includes("@")) {
      throw new ValidacionError("El correo institucional debe ser válido.");
    }

    this._identificacion = identificacion.trim();
    this._nombre = nombre.trim();
    this._telefono = telefono.trim();
    this._correoInstitucional = correoInstitucional.trim().toLowerCase();
    this._usuario = Persona.derivarUsuario(this._correoInstitucional);
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

  public get usuario(): string {
    return this._usuario;
  }

  public set usuario(valor: string) {
    this._usuario = Persona.normalizarUsuario(valor);
  }

  /**
   * El usuario institucional se deriva de la parte local del correo:
   * j.ferrer@udla.edu.co -> j.ferrer. Si esa parte no cumple el formato,
   * devuelve vacío y el alta debe pedir uno personalizado.
   */
  public static derivarUsuario(correo: string): string {
    const local = (correo || "")
      .split("@")[0]
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "");
    return Persona.esUsuarioValido(local) ? local : "";
  }

  public static esUsuarioValido(valor: string): boolean {
    return /^[a-z0-9][a-z0-9._-]{2,29}$/.test((valor || "").trim().toLowerCase());
  }

  public static normalizarUsuario(valor: string): string {
    const usuario = (valor || "").trim().toLowerCase();
    if (!Persona.esUsuarioValido(usuario)) {
      throw new ValidacionError(
        "El usuario debe tener entre 3 y 30 caracteres y solo puede usar letras, números, punto, guion o guion bajo."
      );
    }
    return usuario;
  }

  public set telefono(nuevoTelefono: string) {
    if (!nuevoTelefono || nuevoTelefono.trim().length === 0) {
      throw new ValidacionError("El teléfono no puede estar vacío.");
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
      throw new ValidacionError("El nombre no puede estar vacío.");
    }
    if (!telefono || telefono.trim().length === 0) {
      throw new ValidacionError("El teléfono no puede estar vacío.");
    }
    if (!correoInstitucional || !correoInstitucional.includes("@")) {
      throw new ValidacionError("El correo institucional debe ser válido.");
    }
    this._nombre = nombre.trim();
    this._telefono = telefono.trim();
    const usuarioDerivadoAnterior = Persona.derivarUsuario(this._correoInstitucional);
    const conservaUsuarioPersonalizado = this._usuario !== usuarioDerivadoAnterior;
    this._correoInstitucional = correoInstitucional.trim().toLowerCase();
    if (!conservaUsuarioPersonalizado) {
      this._usuario = Persona.derivarUsuario(this._correoInstitucional);
    }
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

  public construirResumenSesion(): {
    rol: "pasajero" | "motorista" | "admin";
    identificacion: string;
    nombre: string;
    correo: string;
    telefono: string;
    usuario: string;
    detalle: string;
    debeCambiarPassword: boolean;
  } {
    return {
      rol: this.obtenerRolApp(),
      identificacion: this._identificacion,
      nombre: this._nombre,
      correo: this._correoInstitucional,
      telefono: this._telefono,
      usuario: this._usuario,
      detalle: this.construirDetalle(),
      debeCambiarPassword: this._debeCambiarPassword
    };
  }

  public abstract obtenerRolApp(): "pasajero" | "motorista" | "admin";

  public abstract construirDetalle(): string;

  public abstract obtenerRol(): string;
}
