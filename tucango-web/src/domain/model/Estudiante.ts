import { Persona } from "./Persona.ts";
import { Coordenada } from "./Coordenada.ts";

export interface UbicacionFrecuente {
  id: string;
  etiqueta: string;
  nombre: string;
  barrio: string;
  referencia: string;
  latitud: number;
  longitud: number;
}

export class Estudiante extends Persona {
  private _codigoEstudiantil: string;
  private _carrera: string;
  private _barrioResidencia: string;
  private _ubicacionesFrecuentes: UbicacionFrecuente[] = [];

  constructor(
    identificacion: string,
    nombre: string,
    telefono: string,
    correoInstitucional: string,
    codigoEstudiantil: string,
    carrera: string,
    passwordHash: string = "",
    debeCambiarPassword: boolean = false,
    barrioResidencia: string = "Sin especificar",
    ubicacionesFrecuentes: UbicacionFrecuente[] = []
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
    this._barrioResidencia = (barrioResidencia || "").trim() || "Sin especificar";
    this._ubicacionesFrecuentes = (ubicacionesFrecuentes || []).map((u) => ({ ...u }));
  }

  public get codigoEstudiantil(): string {
    return this._codigoEstudiantil;
  }

  public get carrera(): string {
    return this._carrera;
  }

  public get barrioResidencia(): string {
    return this._barrioResidencia;
  }

  public set barrioResidencia(barrio: string) {
    this._barrioResidencia = (barrio || "").trim() || "Sin especificar";
  }

  public get ubicacionesFrecuentes(): readonly UbicacionFrecuente[] {
    return this._ubicacionesFrecuentes.map((u) => ({ ...u }));
  }

  public guardarUbicacionFrecuente(entrada: {
    id?: string;
    etiqueta: string;
    nombre: string;
    barrio?: string;
    referencia?: string;
    latitud: number;
    longitud: number;
  }): UbicacionFrecuente {
    const etiqueta = (entrada.etiqueta || "").trim();
    const nombre = (entrada.nombre || "").trim();
    if (!etiqueta) throw new Error("La etiqueta del lugar es obligatoria (ej. Casa, Trabajo).");
    if (!nombre) throw new Error("El nombre del lugar es obligatorio.");

    const coord = new Coordenada(Number(entrada.latitud), Number(entrada.longitud));
    const barrio = (entrada.barrio || "").trim() || this._barrioResidencia || "Florencia";
    const id =
      (entrada.id || "").trim() ||
      `LOC-${etiqueta.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${Date.now().toString(36)}`;

    const registro: UbicacionFrecuente = {
      id,
      etiqueta,
      nombre,
      barrio,
      referencia: (entrada.referencia || "").trim(),
      latitud: coord.latitud,
      longitud: coord.longitud
    };

    const idx = this._ubicacionesFrecuentes.findIndex(
      (u) => u.id === id || (etiqueta.toLowerCase() === "casa" && u.etiqueta.toLowerCase() === "casa")
    );
    if (idx >= 0) {
      this._ubicacionesFrecuentes[idx] = { ...registro, id: this._ubicacionesFrecuentes[idx].id };
    } else {
      this._ubicacionesFrecuentes.push(registro);
    }

    if (etiqueta.toLowerCase() === "casa" && barrio && barrio !== "Sin especificar") {
      this._barrioResidencia = barrio;
    }

    return { ...registro };
  }

  public eliminarUbicacionFrecuente(id: string): boolean {
    const antes = this._ubicacionesFrecuentes.length;
    this._ubicacionesFrecuentes = this._ubicacionesFrecuentes.filter((u) => u.id !== id);
    return this._ubicacionesFrecuentes.length < antes;
  }

  public actualizarPerfil(datos: {
    nombre?: string;
    telefono?: string;
    correoInstitucional?: string;
    codigoEstudiantil?: string;
    carrera?: string;
    barrioResidencia?: string;
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
    if (datos.barrioResidencia !== undefined) {
      this._barrioResidencia = datos.barrioResidencia.trim() || "Sin especificar";
    }
  }

  public override obtenerRolApp(): "pasajero" {
    return "pasajero";
  }

  public override construirDetalle(): string {
    return `${this._carrera} · ${this._codigoEstudiantil}`;
  }

  public override obtenerRol(): string {
    return "ESTUDIANTE";
  }
}
