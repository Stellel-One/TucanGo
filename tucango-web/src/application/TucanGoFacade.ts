import { randomUUID } from "node:crypto";
import {
  PROGRAMAS_ACADEMICOS,
  type ProgramaAcademico,
  esProgramaAcademicoValido
} from "../domain/catalog/ProgramasAcademicos.ts";
import {
  BARRIOS_FLORENCIA,
  type ComunaFlorencia,
  esBarrioFlorenciaValido
} from "../domain/catalog/BarriosFlorencia.ts";
import { Persona } from "../domain/model/Persona.ts";
import { Administrador } from "../domain/model/Administrador.ts";
import { Estudiante, type UbicacionFrecuente } from "../domain/model/Estudiante.ts";
import { Motorista, type EstadoAprobacionTucan } from "../domain/model/Motorista.ts";
import { Moto } from "../domain/model/Moto.ts";
import { Coordenada } from "../domain/model/Coordenada.ts";
import { Calificacion } from "../domain/model/Calificacion.ts";
import { MetodoPago, Pago, EstadoPago } from "../domain/model/Pago.ts";
import {
  SECTORES_FLORENCIA,
  SectorCampus,
  buscarSectorPorId
} from "../domain/model/SectorCampus.ts";
import { EventBus, type TipoEventoDominio } from "../domain/patterns/EventBus.ts";
import { Viaje } from "../domain/patterns/Viaje.ts";
import {
  type EstrategiaTarifa,
  TarifaEstudiantilFija,
  TarifaPorKilometro,
  TarifaDinamicaLluvia,
  TarifaNocturna
} from "../domain/patterns/EstrategiaTarifa.ts";
import type {
  EstadoSistemaSnapshot,
  SistemaRepository,
  NotificacionCorreoSnapshot
} from "./ports/SistemaRepository.ts";
import {
  hashPasswordSync,
  hashPassword,
  dummyPasswordCheck,
  validarPoliticaPassword
} from "../domain/security/PasswordHasher.ts";
import {
  AuthError,
  CredencialesInvalidasError,
  NoAutenticadoError,
  ValidacionError,
  CuentaEnRevisionError
} from "../domain/security/ErroresAuth.ts";

export const DEFAULT_ADMIN_USER = "tucangoadmin";
export const DEFAULT_ADMIN_EMAIL = "admin@uniamazonia.edu.co";
export const CURRENT_SEED_VERSION = 3;

// Invariantes de entrada. Viven en la capa de aplicación porque describen
// reglas de alta de la comunidad, no la estructura de una persona ya existente.
const PATRON_CEDULA = /^\d{6,10}$/;
const PATRON_TELEFONO = /^3\d{9}$/;
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PATRON_PLACA = /^[A-Z]{3}-?\d{2}[A-Z0-9]$/;
const PATRON_CODIGO_ESTUDIANTIL = /^\d{6,12}$/;
const PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{3,80}$/;
const DOMINIOS_ESTUDIANTE = ["uniamazonia.edu.co", "udla.edu.co"];
const ESTADOS_APROBACION: readonly EstadoAprobacionTucan[] = [
  "PENDIENTE_APROBACION",
  "ACTIVO",
  "RECHAZADO"
];

export interface RegistrarEstudianteDTO {
  identificacion: string;
  nombre: string;
  telefono: string;
  correoInstitucional: string;
  codigoEstudiantil: string;
  carrera: string;
  barrioResidencia?: string;
  usuario?: string;
  password?: string;
}

export interface RegistrarMotoristaDTO {
  identificacion: string;
  nombre: string;
  telefono: string;
  correoInstitucional: string;
  placa: string;
  marca: string;
  modelo: string;
  cilindraje: number;
  soatVigente: boolean;
  numeroSoat?: string;
  password?: string;
  estadoAprobacion?: EstadoAprobacionTucan;
  fotoRostroUrl?: string;
  fotoMotoUrl?: string;
  fotoSoatUrl?: string;
  fotoLicenciaUrl?: string;
  fotoCedulaUrl?: string;
  numeroLicencia?: string;
  compromisoAceptado?: boolean;
}

export interface ActualizarPerfilDTO {
  nombre?: string;
  telefono?: string;
  correoInstitucional?: string;
  codigoEstudiantil?: string;
  carrera?: string;
  barrioResidencia?: string;
  placa?: string;
  marca?: string;
  modelo?: string;
  cilindraje?: number;
  numeroSoat?: string;
  cargo?: string;
  contactoEmergencia?: string;
  sedeFavorita?: string;
}

/**
 * Cada rol observa un recorte distinto de la operación. El tipo discriminado
 * impide que el borde (HTTP o DOM) invente campos que el rol no posee: un
 * administrador no tiene "gasto personal" y un pasajero no tiene "ganancias".
 */
export interface MetricasBaseDTO {
  totalViajes: number;
  finalizados: number;
  solicitados: number;
  enCurso: number;
}

export type MetricasDTO =
  | (MetricasBaseDTO & { rol: "admin"; volumenMovilidadCop: number })
  | (MetricasBaseDTO & { rol: "motorista"; gananciasCop: number; kmRecorridos: number })
  | (MetricasBaseDTO & { rol: "pasajero"; gastoTotalCop: number; kmRecorridos: number })
  | (MetricasBaseDTO & { rol: "anonimo" });

export class TucanGoFacade {
  private _administradores: Map<string, Administrador> = new Map();
  private _estudiantes: Map<string, Estudiante> = new Map();
  private _motoristas: Map<string, Motorista> = new Map();
  private _viajes: Map<string, Viaje> = new Map();
  private _notificacionesCorreo: NotificacionCorreoSnapshot[] = [];
  private _contadorViajes: number = 100;
  private _ultimaPersistenciaUbicacion: Map<string, number> = new Map();
  private readonly _repository?: SistemaRepository;
  private readonly _eventBus: EventBus;

  constructor(repository?: SistemaRepository, eventBus?: EventBus) {
    this._repository = repository;
    this._eventBus = eventBus ?? new EventBus();

    // RESET_DATOS=true es el único mecanismo que descarta el estado persistido.
    // Subir CURRENT_SEED_VERSION ya no borra datos: solo agrega lo que falte.
    if (process.env.RESET_DATOS === "true" && this._repository) {
      this.cargarDatosSemilla();
      this.persistir();
      return;
    }

    const snapshot = this._repository?.cargar();
    if (snapshot) {
      this.rehidratarDesdeSnapshot(snapshot);
      this.completarSemillaFaltante(snapshot);
    } else {
      this.cargarDatosSemilla();
      this.persistir();
    }
  }

  /**
   * Una migración nunca destruye datos reales: rehidrata lo que existe y solo
   * agrega las piezas institucionales que falten. El borrado es explícito
   * mediante RESET_DATOS.
   */
  private completarSemillaFaltante(snapshot: EstadoSistemaSnapshot): void {
    const versionAnterior = snapshot.seedVersion ?? 0;
    let huboCambios = false;

    if (this._administradores.size === 0) {
      this._administradores.set(
        DEFAULT_ADMIN_USER,
        this.construirAdministradorSemilla()
      );
      huboCambios = true;
    }
    if (versionAnterior !== CURRENT_SEED_VERSION) {
      huboCambios = true;
    }
    if (huboCambios) {
      this.persistir();
    }
  }

  public obtenerEventBus(): EventBus {
    return this._eventBus;
  }

  public get repository(): SistemaRepository | undefined {
    return this._repository;
  }

  public obtenerSectoresCampus(): readonly SectorCampus[] {
    return SECTORES_FLORENCIA;
  }

  public calcularRutaEntreSectores(
    origenId: string,
    destinoId: string
  ): {
    origen: SectorCampus;
    destino: SectorCampus;
    distanciaKm: number;
    tiempoEstimadoMin: number;
    polilinea: Array<{ latitud: number; longitud: number }>;
    direccionInicialGrados: number;
  } {
    const origen = buscarSectorPorId(origenId);
    const destino = buscarSectorPorId(destinoId);
    if (!origen) {
      throw new Error(`Sector de origen '${origenId}' no existe en el catálogo institucional.`);
    }
    if (!destino) {
      throw new Error(`Sector de destino '${destinoId}' no existe en el catálogo institucional.`);
    }

    const distanciaKm = origen.coordenada.distanciaKmHacia(destino.coordenada);
    const tiempoEstimadoMin =
      distanciaKm === 0 ? 0 : Math.max(3, Math.round((distanciaKm / 24) * 60));
    const polilinea = TucanGoFacade.construirPolilinea(origen.coordenada, destino.coordenada, 10);
    const p0 = polilinea[0];
    const p1 = polilinea[1] ?? p0;
    const direccionInicialGrados = new Coordenada(p0.latitud, p0.longitud).rumboHacia(
      new Coordenada(p1.latitud, p1.longitud)
    );

    return {
      origen,
      destino,
      distanciaKm,
      tiempoEstimadoMin,
      polilinea,
      direccionInicialGrados
    };
  }

  public calcularRutaEntreCoordenadas(
    origen: { id: string; nombre: string; referencia?: string; latitud: number; longitud: number },
    destino: { id: string; nombre: string; referencia?: string; latitud: number; longitud: number }
  ) {
    const cOrig = new Coordenada(Number(origen.latitud), Number(origen.longitud));
    const cDest = new Coordenada(Number(destino.latitud), Number(destino.longitud));
    const distanciaKm = cOrig.distanciaKmHacia(cDest);
    const tiempoEstimadoMin =
      distanciaKm === 0 ? 0 : Math.max(3, Math.round((distanciaKm / 24) * 60));
    const polilinea = TucanGoFacade.construirPolilinea(cOrig, cDest, 10);
    const p0 = polilinea[0];
    const p1 = polilinea[1] ?? p0;
    const direccionInicialGrados = new Coordenada(p0.latitud, p0.longitud).rumboHacia(
      new Coordenada(p1.latitud, p1.longitud)
    );

    return {
      origen: {
        id: origen.id,
        nombre: origen.nombre,
        referencia: origen.referencia || "",
        esCampusUniamazonia: origen.id === "PORVENIR" || origen.id === "CENTRO",
        latitud: cOrig.latitud,
        longitud: cOrig.longitud
      },
      destino: {
        id: destino.id,
        nombre: destino.nombre,
        referencia: destino.referencia || "",
        esCampusUniamazonia: destino.id === "PORVENIR" || destino.id === "CENTRO",
        latitud: cDest.latitud,
        longitud: cDest.longitud
      },
      distanciaKm,
      tiempoEstimadoMin,
      polilinea,
      direccionInicialGrados
    };
  }

  private static construirPolilinea(
    origen: Coordenada,
    destino: Coordenada,
    pasos: number = 10
  ): Array<{ latitud: number; longitud: number }> {
    const puntos: Array<{ latitud: number; longitud: number }> = [];
    const dLat = destino.latitud - origen.latitud;
    const dLng = destino.longitud - origen.longitud;
    if (dLat === 0 && dLng === 0) {
      return [{ latitud: origen.latitud, longitud: origen.longitud }];
    }

    const longitudVector = Math.hypot(dLat, dLng) || 1;
    const perpLat = -dLng / longitudVector;
    const perpLng = dLat / longitudVector;
    const curvaturaMax = Math.min(0.0022, longitudVector * 0.14);

    for (let i = 0; i <= pasos; i++) {
      const t = i / pasos;
      const offset = Math.sin(Math.PI * t) * curvaturaMax;
      puntos.push({
        latitud: Number((origen.latitud + dLat * t + perpLat * offset).toFixed(6)),
        longitud: Number((origen.longitud + dLng * t + perpLng * offset).toFixed(6))
      });
    }
    return puntos;
  }

  private static interpolarSobrePolilinea(
    puntos: Array<{ latitud: number; longitud: number }>,
    progreso: number
  ): { latitud: number; longitud: number; direccionGrados: number } {
    if (puntos.length === 0) {
      return { latitud: 1.6203, longitud: -75.6042, direccionGrados: 0 };
    }
    if (puntos.length === 1) {
      return { latitud: puntos[0].latitud, longitud: puntos[0].longitud, direccionGrados: 0 };
    }
    const clamped = Math.max(0, Math.min(100, progreso)) / 100;
    const segFloat = clamped * (puntos.length - 1);
    const idx = Math.min(puntos.length - 2, Math.floor(segFloat));
    const localT = segFloat - idx;
    const a = puntos[idx];
    const b = puntos[idx + 1];
    const latitud = Number((a.latitud + (b.latitud - a.latitud) * localT).toFixed(6));
    const longitud = Number((a.longitud + (b.longitud - a.longitud) * localT).toFixed(6));
    const direccionGrados = new Coordenada(a.latitud, a.longitud).rumboHacia(
      new Coordenada(b.latitud, b.longitud)
    );
    return { latitud, longitud, direccionGrados };
  }

  private resolverSectorPorTexto(valor: string, fallbackId: string): SectorCampus {
    const norm = (valor || "").trim().toLowerCase();
    const match = SECTORES_FLORENCIA.find(
      (s) =>
        s.id.toLowerCase() === norm ||
        s.nombre.toLowerCase() === norm ||
        norm.includes(s.id.toLowerCase().replace("_", " ")) ||
        s.nombre.toLowerCase().includes(norm)
    );
    return match ?? buscarSectorPorId(fallbackId) ?? SECTORES_FLORENCIA[0];
  }

  public cotizarTarifa(distanciaKm: number, tipoTarifa: string = "estudiantil"): number {
    const estrategia = this.resolverEstrategiaTarifa(tipoTarifa);
    return estrategia.calcular(distanciaKm, 3000);
  }

  private emitirEvento(tipo: TipoEventoDominio, payload: Record<string, unknown>): void {
    this._eventBus.publicar({
      tipo,
      timestamp: new Date().toISOString(),
      payload
    });
  }

  private persistir(): void {
    if (!this._repository) return;
    this._repository.guardar(this.exportarSnapshot());
  }

  public obtenerAdministradores(): Administrador[] {
    return Array.from(this._administradores.values());
  }

  private exportarSnapshot(): EstadoSistemaSnapshot {
    return {
      seedVersion: CURRENT_SEED_VERSION,
      contadorViajes: this._contadorViajes,
      administradores: this.obtenerAdministradores().map((a) => ({
        identificacion: a.identificacion,
        nombre: a.nombre,
        telefono: a.telefono,
        correoInstitucional: a.correoInstitucional,
        cargo: a.cargo,
        passwordHash: a.passwordHash,
        debeCambiarPassword: a.debeCambiarPassword,
        contactoEmergencia: a.contactoEmergencia,
        sedeFavorita: a.sedeFavorita
      })),
      estudiantes: this.obtenerEstudiantes().map((e) => ({
        identificacion: e.identificacion,
        nombre: e.nombre,
        telefono: e.telefono,
        correoInstitucional: e.correoInstitucional,
        codigoEstudiantil: e.codigoEstudiantil,
        carrera: e.carrera,
        usuario: e.usuario,
        passwordHash: e.passwordHash,
        debeCambiarPassword: e.debeCambiarPassword,
        contactoEmergencia: e.contactoEmergencia,
        sedeFavorita: e.sedeFavorita,
        barrioResidencia: e.barrioResidencia,
        ubicacionesFrecuentes: e.ubicacionesFrecuentes.map((u) => ({ ...u }))
      })),
      motoristas: this.obtenerMotoristas().map((m) => ({
        identificacion: m.identificacion,
        nombre: m.nombre,
        telefono: m.telefono,
        correoInstitucional: m.correoInstitucional,
        usuario: m.usuario,
        disponible: m.disponible,
        latitud: m.ubicacionActual.latitud,
        longitud: m.ubicacionActual.longitud,
        direccionGrados: m.direccionGrados,
        passwordHash: m.passwordHash,
        debeCambiarPassword: m.debeCambiarPassword,
        estadoAprobacion: m.estadoAprobacion,
        fotoRostroUrl: m.fotoRostroUrl,
        fotoMotoUrl: m.fotoMotoUrl,
        fotoSoatUrl: m.fotoSoatUrl,
        fotoLicenciaUrl: m.fotoLicenciaUrl,
        fotoCedulaUrl: m.fotoCedulaUrl,
        numeroLicencia: m.numeroLicencia,
        compromisoAceptado: m.compromisoAceptado,
        motivoRechazo: m.motivoRechazo,
        fechaAprobacion: m.fechaAprobacion?.toISOString(),
        correoBienvenidaEnviado: m.correoBienvenidaEnviado,
        contactoEmergencia: m.contactoEmergencia,
        sedeFavorita: m.sedeFavorita,
        motos: m.motos.map((moto) => ({
          placa: moto.placa,
          marca: moto.marca,
          modelo: moto.modelo,
          cilindraje: moto.cilindraje,
          activa: moto.activa,
          soatVigente: moto.soatVigente,
          numeroSoat: moto.numeroSoat
        }))
      })),
      notificacionesCorreo: this._notificacionesCorreo,
      viajes: this.obtenerTodosLosViajes().map((v) => ({
        codigoViaje: v.codigoViaje,
        estudianteId: v.estudiante.identificacion,
        motoristaId: v.motorista?.identificacion,
        origen: v.origen,
        destino: v.destino,
        distanciaKm: v.distanciaKm,
        estrategiaNombre: v.estrategiaTarifa.nombre,
        tarifa: v.tarifa,
        estadoNombre: v.estado.nombre,
        motivoCancelacion: v.motivoCancelacion,
        fechaCreacion: v.fechaCreacion.toISOString(),
        llegadaSeguraConfirmada: v.llegadaSeguraConfirmada,
        fechaLlegadaSegura: v.fechaLlegadaSegura?.toISOString(),
        pinSeguridad: v.pinSeguridad,
        progresoRuta: v.progresoRuta,
        etapaTracking: v.etapaTracking,
        ubicacionMotoristaLat: v.ubicacionMotoristaLat,
        ubicacionMotoristaLng: v.ubicacionMotoristaLng,
        direccionMotoristaGrados: v.direccionMotoristaGrados,
        pago: {
          monto: v.pago.monto,
          metodo: v.pago.metodo,
          estado: v.pago.estado,
          fechaPago: v.pago.fechaPago?.toISOString()
        },
        calificaciones: v.calificaciones.map((c) => ({
          puntuacion: c.puntuacion,
          comentario: c.comentario,
          autorIdentificacion: c.autorIdentificacion
        }))
      }))
    };
  }

  private resolverEstrategiaPorNombre(nombreEstrategia: string): EstrategiaTarifa {
    const catalogo: EstrategiaTarifa[] = [
      new TarifaEstudiantilFija(),
      new TarifaPorKilometro(),
      new TarifaDinamicaLluvia(),
      new TarifaNocturna()
    ];
    return catalogo.find((e) => e.nombre === nombreEstrategia) ?? new TarifaEstudiantilFija();
  }

  private rehidratarDesdeSnapshot(snapshot: EstadoSistemaSnapshot): void {
    this._contadorViajes = snapshot.contadorViajes || 100;

    if (snapshot.notificacionesCorreo) {
      this._notificacionesCorreo = [...snapshot.notificacionesCorreo];
    }

    if (snapshot.administradores && snapshot.administradores.length > 0) {
      for (const aSnap of snapshot.administradores) {
        const admin = new Administrador(
          aSnap.identificacion,
          aSnap.nombre,
          aSnap.telefono,
          aSnap.correoInstitucional,
          aSnap.cargo,
          aSnap.passwordHash,
          Boolean(aSnap.debeCambiarPassword)
        );
        if (aSnap.contactoEmergencia) admin.contactoEmergencia = aSnap.contactoEmergencia;
        if (aSnap.sedeFavorita) admin.sedeFavorita = aSnap.sedeFavorita;
        this._administradores.set(admin.identificacion, admin);
      }
    } else {
      const admin = this.construirAdministradorSemilla();
      this._administradores.set(admin.identificacion, admin);
    }

    for (const estSnap of snapshot.estudiantes) {
      const est = new Estudiante(
        estSnap.identificacion,
        estSnap.nombre,
        estSnap.telefono,
        estSnap.correoInstitucional,
        estSnap.codigoEstudiantil,
        estSnap.carrera,
        estSnap.passwordHash || this.hashSinPassword(),
        Boolean(estSnap.debeCambiarPassword),
        estSnap.barrioResidencia || "Sin especificar",
        estSnap.ubicacionesFrecuentes || []
      );
      if (estSnap.contactoEmergencia) est.contactoEmergencia = estSnap.contactoEmergencia;
      if (estSnap.sedeFavorita) est.sedeFavorita = estSnap.sedeFavorita;
      if (estSnap.usuario) est.usuario = estSnap.usuario;
      this._estudiantes.set(est.identificacion, est);
    }

    for (const motSnap of snapshot.motoristas) {
      const ubicacion =
        typeof motSnap.latitud === "number" && typeof motSnap.longitud === "number"
          ? new Coordenada(motSnap.latitud, motSnap.longitud)
          : undefined;
      // Versiones anteriores guardaban el número de licencia dentro de
      // fotoLicenciaUrl, que es un campo de imagen. Se separa al rehidratar.
      const licenciaGuardada = (motSnap.fotoLicenciaUrl ?? "").trim();
      const licenciaEsImagen = /^(data:image\/|https?:\/\/|\/)/.test(licenciaGuardada);
      const fotoLicenciaUrl = licenciaEsImagen ? licenciaGuardada : "";
      const numeroLicencia =
        motSnap.numeroLicencia || (licenciaEsImagen ? "" : licenciaGuardada);
      const mot = new Motorista(
        motSnap.identificacion,
        motSnap.nombre,
        motSnap.telefono,
        motSnap.correoInstitucional,
        motSnap.disponible,
        ubicacion,
        motSnap.direccionGrados ?? 0,
        motSnap.passwordHash || this.hashSinPassword(),
        Boolean(motSnap.debeCambiarPassword),
        motSnap.estadoAprobacion ?? "ACTIVO",
        motSnap.fotoRostroUrl ?? "",
        motSnap.fotoMotoUrl ?? "",
        motSnap.fotoSoatUrl ?? "",
        fotoLicenciaUrl,
        motSnap.compromisoAceptado ?? true,
        motSnap.motivoRechazo,
        motSnap.fechaAprobacion ? new Date(motSnap.fechaAprobacion) : undefined,
        Boolean(motSnap.correoBienvenidaEnviado),
        motSnap.fotoCedulaUrl ?? "",
        numeroLicencia
      );
      if (motSnap.contactoEmergencia) mot.contactoEmergencia = motSnap.contactoEmergencia;
      if (motSnap.sedeFavorita) mot.sedeFavorita = motSnap.sedeFavorita;
      if (motSnap.usuario) mot.usuario = motSnap.usuario;
      for (const motoSnap of motSnap.motos) {
        const moto = new Moto(
          motoSnap.placa,
          motoSnap.marca,
          motoSnap.modelo,
          motoSnap.cilindraje,
          motoSnap.activa,
          motoSnap.soatVigente ?? true,
          motoSnap.numeroSoat ?? "SOAT-VIGENTE"
        );
        mot.registrarMoto(moto);
      }
      this._motoristas.set(mot.identificacion, mot);
    }

    for (const vSnap of snapshot.viajes) {
      const estudiante = this._estudiantes.get(vSnap.estudianteId);
      if (!estudiante) continue;
      const motorista = vSnap.motoristaId
        ? this._motoristas.get(vSnap.motoristaId)
        : undefined;
      const estrategia = this.resolverEstrategiaPorNombre(vSnap.estrategiaNombre);
      const pago = Pago.reconstruir(
        vSnap.pago.monto,
        vSnap.pago.metodo,
        vSnap.pago.estado ?? EstadoPago.PENDIENTE,
        vSnap.pago.fechaPago
      );
      const calificaciones = vSnap.calificaciones.map(
        (c) => new Calificacion(c.puntuacion, c.comentario, c.autorIdentificacion)
      );
      const viaje = Viaje.reconstruir({
        codigoViaje: vSnap.codigoViaje,
        origen: vSnap.origen,
        destino: vSnap.destino,
        distanciaKm: vSnap.distanciaKm,
        estudiante,
        motorista,
        estrategiaTarifa: estrategia,
        tarifa: vSnap.tarifa,
        pago,
        estadoNombre: vSnap.estadoNombre,
        motivoCancelacion: vSnap.motivoCancelacion,
        fechaCreacion: vSnap.fechaCreacion,
        llegadaSeguraConfirmada: Boolean(vSnap.llegadaSeguraConfirmada),
        fechaLlegadaSegura: vSnap.fechaLlegadaSegura,
        pinSeguridad: vSnap.pinSeguridad,
        progresoRuta: vSnap.progresoRuta,
        etapaTracking: vSnap.etapaTracking,
        ubicacionMotoristaLat: vSnap.ubicacionMotoristaLat,
        ubicacionMotoristaLng: vSnap.ubicacionMotoristaLng,
        direccionMotoristaGrados: vSnap.direccionMotoristaGrados,
        calificaciones
      });
      this._viajes.set(viaje.codigoViaje, viaje);
    }
  }

  // --- Inicialización Limpia (solo Administrador; el resto lo crea el usuario) ---
  private cargarDatosSemilla(): void {
    this._administradores.clear();
    this._estudiantes.clear();
    this._motoristas.clear();
    this._viajes.clear();
    this._notificacionesCorreo = [];
    this._contadorViajes = 100;

    const admin = this.construirAdministradorSemilla();
    this._administradores.set(admin.identificacion, admin);
  }

  /**
   * Una cuenta sin contraseña persistida no puede quedar con una clave
   * conocida. Se le asigna el hash de un valor aleatorio: queda inaccesible
   * hasta que un administrador la reemplace.
   */
  private hashSinPassword(): string {
    return hashPasswordSync(randomUUID());
  }

  /**
   * La cuenta administrativa es la única que la plataforma siembra. En
   * producción su clave debe cumplir la misma política que se exige a
   * cualquier usuario, y el arranque falla si no la cumple.
   */
  private construirAdministradorSemilla(): Administrador {
    const passwordDefinida = process.env.SEED_ADMIN_PASSWORD;
    if (process.env.NODE_ENV === "production") {
      if (!passwordDefinida || passwordDefinida.length < 12) {
        throw new Error(
          "FATAL: SEED_ADMIN_PASSWORD es obligatoria en producción y debe tener al menos 12 caracteres."
        );
      }
    }
    const password = passwordDefinida || "admin123";
    return new Administrador(
      DEFAULT_ADMIN_USER,
      "Bienestar Universitario",
      "3001234567",
      DEFAULT_ADMIN_EMAIL,
      "Coordinación de Movilidad Segura",
      hashPasswordSync(password),
      !passwordDefinida
    );
  }

  // --- Casos de Uso: Estudiantes y Motoristas ---
  public obtenerEstudiantes(): Estudiante[] {
    return Array.from(this._estudiantes.values());
  }

  public obtenerMotoristas(): Motorista[] {
    return Array.from(this._motoristas.values());
  }

  /**
   * Una identificación representa a una sola persona en la plataforma.
   * Estudiantes, Tucanes y Administradores comparten el espacio de cédulas,
   * así que ningún alta puede reutilizar una identificación existente.
   */
  private validarIdentificacionDisponible(identificacion: string): void {
    const yaExiste =
      this._estudiantes.has(identificacion) ||
      this._motoristas.has(identificacion) ||
      this._administradores.has(identificacion);
    if (yaExiste) {
      throw new ValidacionError(`La identificación ${identificacion} ya está registrada en TucanGo.`);
    }
  }

  /**
   * Una persona no puede tener dos cuentas: el usuario es único entre roles.
   */
  private validarUsuarioDisponible(usuario: string): void {
    if (!usuario) return;
    const ocupado = [
      ...this._administradores.values(),
      ...this._estudiantes.values(),
      ...this._motoristas.values()
    ].some((persona) => persona.usuario.toLowerCase() === usuario.toLowerCase());
    if (ocupado) {
      throw new ValidacionError(`El usuario '${usuario}' ya está en uso.`);
    }
  }

  public obtenerProgramasAcademicos(): readonly ProgramaAcademico[] {
    return PROGRAMAS_ACADEMICOS;
  }

  public obtenerBarriosFlorencia(): readonly ComunaFlorencia[] {
    return BARRIOS_FLORENCIA;
  }

  public registrarEstudiante(entrada: Estudiante | RegistrarEstudianteDTO): Estudiante {
    let estudiante: Estudiante;

    if (entrada instanceof Estudiante) {
      estudiante = entrada;
    } else {
      const identificacion = (entrada.identificacion || "").trim();
      if (!PATRON_CEDULA.test(identificacion)) {
        throw new ValidacionError("La cédula debe tener entre 6 y 10 dígitos numéricos.");
      }
      this.validarIdentificacionDisponible(identificacion);

      const nombre = (entrada.nombre || "").trim().replace(/\s+/g, " ");
      if (!PATRON_NOMBRE.test(nombre)) {
        throw new ValidacionError("El nombre completo debe tener entre 3 y 80 caracteres y solo letras.");
      }

      const telefono = (entrada.telefono || "").trim();
      if (!PATRON_TELEFONO.test(telefono)) {
        throw new ValidacionError("El teléfono debe ser un celular colombiano de 10 dígitos (ej. 3110000000).");
      }

      const correo = (entrada.correoInstitucional || "").trim().toLowerCase();
      if (!PATRON_CORREO.test(correo)) {
        throw new ValidacionError("El correo institucional no tiene un formato válido.");
      }
      const dominio = correo.slice(correo.lastIndexOf("@") + 1);
      if (!DOMINIOS_ESTUDIANTE.includes(dominio)) {
        throw new ValidacionError("El correo debe ser institucional (@uniamazonia.edu.co o @udla.edu.co).");
      }

      const codigo = (entrada.codigoEstudiantil || "").trim();
      if (!PATRON_CODIGO_ESTUDIANTIL.test(codigo)) {
        throw new ValidacionError("El código estudiantil debe tener entre 6 y 12 dígitos.");
      }

      const carrera = (entrada.carrera || "").trim();
      if (!esProgramaAcademicoValido(carrera)) {
        throw new ValidacionError("Selecciona un programa académico de la oferta oficial.");
      }

      const barrio = (entrada.barrioResidencia || "").trim();
      if (!esBarrioFlorenciaValido(barrio)) {
        throw new ValidacionError("Selecciona un barrio de Florencia de la lista oficial.");
      }

      const usuario = (entrada.usuario || "").trim()
        ? Persona.normalizarUsuario(entrada.usuario)
        : Persona.derivarUsuario(correo);
      if (!usuario) {
        throw new ValidacionError(
          "No pudimos derivar tu usuario del correo. Escribe uno personalizado de al menos 3 caracteres."
        );
      }
      this.validarUsuarioDisponible(usuario);

      estudiante = new Estudiante(
        identificacion,
        nombre,
        telefono,
        correo,
        codigo,
        carrera,
        "",
        false,
        barrio,
        []
      );
      estudiante.usuario = usuario;

      if (entrada.password) {
        validarPoliticaPassword(entrada.password);
        estudiante.asignarPasswordHash(hashPasswordSync(entrada.password));
      }
    }

    this._estudiantes.set(estudiante.identificacion, estudiante);
    this.persistir();
    this.emitirEvento("ESTUDIANTE_REGISTRADO", {
      identificacion: estudiante.identificacion,
      nombre: estudiante.nombre
    });
    return estudiante;
  }

  public registrarMotorista(motorista: Motorista): void {
    this._motoristas.set(motorista.identificacion, motorista);
    this.persistir();
  }

  public registrarMotoristaConMoto(dto: RegistrarMotoristaDTO): Motorista {
    const identificacion = (dto.identificacion || "").trim();
    if (!PATRON_CEDULA.test(identificacion)) {
      throw new ValidacionError("La cédula del Tucán debe tener entre 6 y 10 dígitos numéricos.");
    }
    this.validarIdentificacionDisponible(identificacion);

    const nombreTucan = (dto.nombre || "").trim().replace(/\s+/g, " ");
    if (!PATRON_NOMBRE.test(nombreTucan)) {
      throw new ValidacionError("El nombre del Tucán debe tener entre 3 y 80 caracteres y solo letras.");
    }
    if (!PATRON_TELEFONO.test((dto.telefono || "").trim())) {
      throw new ValidacionError("El teléfono debe ser un celular colombiano de 10 dígitos (ej. 3201234567).");
    }
    if (!PATRON_CORREO.test((dto.correoInstitucional || "").trim().toLowerCase())) {
      throw new ValidacionError("El correo del Tucán debe ser una dirección válida.");
    }
    if (!PATRON_PLACA.test((dto.placa || "").trim().toUpperCase())) {
      throw new ValidacionError("La placa debe tener el formato colombiano (ej. AMZ-77G o AMZ77G).");
    }
    if (!Number.isFinite(dto.cilindraje) || dto.cilindraje < 50 || dto.cilindraje > 1500) {
      throw new ValidacionError("El cilindraje debe ser un número entre 50 y 1500 cc.");
    }
    if (dto.estadoAprobacion && !ESTADOS_APROBACION.includes(dto.estadoAprobacion)) {
      throw new ValidacionError(`Estado de aprobación inválido: ${dto.estadoAprobacion}.`);
    }
    if (!dto.soatVigente) {
      throw new ValidacionError("El SOAT vigente es obligatorio para habilitar una motocicleta en TucanGo.");
    }
    if (!dto.numeroSoat || dto.numeroSoat.trim().length < 6) {
      throw new ValidacionError("El número de póliza SOAT debe contener al menos 6 caracteres válidos.");
    }
    if (dto.password) {
      validarPoliticaPassword(dto.password);
    }
    if (dto.compromisoAceptado === false) {
      throw new ValidacionError("Debes aceptar solemnemente cumplir las políticas y normas de movilidad de la Universidad de la Amazonia para poder registrarte como Tucán.");
    }

    const estadoInicial: EstadoAprobacionTucan = dto.estadoAprobacion ?? "ACTIVO";
    if (estadoInicial !== "RECHAZADO" && !(dto.numeroLicencia || "").trim()) {
      throw new ValidacionError("El número de licencia de conducción es obligatorio para habilitar un Tucán.");
    }
    const disponibleInicial = estadoInicial === "ACTIVO";

    const moto = new Moto(
      dto.placa,
      dto.marca,
      dto.modelo,
      dto.cilindraje,
      true,
      dto.soatVigente,
      dto.numeroSoat.trim().toUpperCase()
    );
    const motorista = new Motorista(
      dto.identificacion,
      dto.nombre,
      dto.telefono,
      dto.correoInstitucional,
      disponibleInicial,
      undefined,
      0,
      "",
      false,
      estadoInicial,
      dto.fotoRostroUrl || "",
      dto.fotoMotoUrl || "",
      dto.fotoSoatUrl || "",
      dto.fotoLicenciaUrl || "",
      dto.compromisoAceptado ?? true,
      undefined,
      undefined,
      false,
      dto.fotoCedulaUrl || "",
      dto.numeroLicencia || ""
    );
    if (dto.password) {
      motorista.asignarPasswordHash(hashPasswordSync(dto.password));
    }
    motorista.registrarMoto(moto);

    this._motoristas.set(motorista.identificacion, motorista);
    this.persistir();
    this.emitirEvento("MOTORISTA_REGISTRADO", {
      identificacion: motorista.identificacion,
      nombre: motorista.nombre,
      placa: moto.placa,
      estadoAprobacion: motorista.estadoAprobacion
    });
    return motorista;
  }

  public obtenerTucanesPendientes(): Motorista[] {
    return Array.from(this._motoristas.values()).filter(
      (m) => m.estadoAprobacion === "PENDIENTE_APROBACION"
    );
  }

  public aprobarTucan(identificacion: string): { tucan: Motorista; correo: NotificacionCorreoSnapshot } {
    const mot = this._motoristas.get((identificacion || "").trim());
    if (!mot) {
      throw new ValidacionError(`No se encontró un Tucán con identificación ${identificacion}`);
    }
    mot.estadoAprobacion = "ACTIVO";
    mot.fechaAprobacion = new Date();
    mot.correoBienvenidaEnviado = true;

    const correo: NotificacionCorreoSnapshot = {
      id: `MAIL-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      destinatario: mot.correoInstitucional,
      asunto: "¡Bienvenido a la Comunidad Tucán! Tu Licencia TucanGo ha sido aprobada",
      enviadoEn: new Date().toISOString(),
      tipo: "BIENVENIDA_TUCAN",
      mensajeHtml: `Estimado(a) ${mot.nombre},\n\nNos complace informarte que la administración de la Universidad de la Amazonia ha auditado y aprobado satisfactoriamente tu documentación (SOAT, Licencia y Motocicleta con placa ${mot.obtenerMotoActiva()?.placa || ""}).\n\nTu Licencia Tucán se encuentra ahora ACTIVA. Puedes iniciar sesión en TucanGo con tu cédula o correo institucional y encender tu disponibilidad en el Radar del campus para brindar movilidad segura a nuestra comunidad.\n\nRecuerda tu compromiso de honor: velocidad máxima de 20 km/h en campus y uso estricto de casco reglamentario.\n\nAtentamente,\nComité de Movilidad y Bienestar Universitario\nUniversidad de la Amazonia\nwww.uniamazonia.edu.co`
    };

    this._notificacionesCorreo.unshift(correo);
    this.persistir();

    this.emitirEvento("TUCAN_APROBADO", {
      identificacion: mot.identificacion,
      nombre: mot.nombre,
      correo: mot.correoInstitucional,
      placa: mot.obtenerMotoActiva()?.placa,
      fechaAprobacion: mot.fechaAprobacion.toISOString(),
      correoId: correo.id
    });

    return { tucan: mot, correo };
  }

  public rechazarTucan(identificacion: string, motivo?: string): Motorista {
    const mot = this._motoristas.get((identificacion || "").trim());
    if (!mot) {
      throw new ValidacionError(`No se encontró un Tucán con identificación ${identificacion}`);
    }
    mot.estadoAprobacion = "RECHAZADO";
    mot.motivoRechazo = motivo || "Documentación no conforme con las normas institucionales de la Universidad de la Amazonia.";
    mot.disponible = false;

    this.persistir();
    this.emitirEvento("TUCAN_RECHAZADO", {
      identificacion: mot.identificacion,
      nombre: mot.nombre,
      motivo: mot.motivoRechazo
    });

    return mot;
  }

  public obtenerNotificacionesCorreo(): NotificacionCorreoSnapshot[] {
    return [...this._notificacionesCorreo];
  }

  // --- Estrategias de Tarifa Disponibles ---
  public resolverEstrategiaTarifa(tipo: string): EstrategiaTarifa {
    switch ((tipo || "").trim().toLowerCase()) {
      case "distancia":
      case "por_kilometro":
        return new TarifaPorKilometro();
      case "lluvia":
      case "dinamica_lluvia":
        return new TarifaDinamicaLluvia();
      case "nocturna":
        return new TarifaNocturna();
      case "estudiantil":
      case "estudiantil_fija":
      default:
        return new TarifaEstudiantilFija();
    }
  }

  // --- Casos de Uso: Ciclo de Vida del Viaje (Uber/InDrive Core) ---
  public solicitarViaje(
    estudianteId: string,
    origen: string,
    destino: string,
    distanciaKm: number,
    tipoTarifa: string = "estudiantil",
    metodoPago: MetodoPago = MetodoPago.EFECTIVO
  ): Viaje {
    const estudiante = this._estudiantes.get(estudianteId);
    if (!estudiante) {
      throw new Error(`Estudiante con ID ${estudianteId} no encontrado.`);
    }

    this._contadorViajes++;
    const codigo = `TUC-${this._contadorViajes}`;
    const estrategia = this.resolverEstrategiaTarifa(tipoTarifa);

    const viaje = new Viaje(
      codigo,
      origen,
      destino,
      distanciaKm,
      estudiante,
      estrategia,
      metodoPago
    );

    this._viajes.set(codigo, viaje);
    this.persistir();
    this.emitirEvento("VIAJE_SOLICITADO", {
      codigo,
      origen: viaje.origen,
      destino: viaje.destino,
      tarifa: viaje.tarifa
    });
    return viaje;
  }

  public aceptarViaje(codigoViaje: string, motoristaId: string): Viaje {
    const viaje = this._viajes.get(codigoViaje);
    if (!viaje) {
      throw new Error(`Viaje con código ${codigoViaje} no existe.`);
    }
    const motorista = this._motoristas.get(motoristaId);
    if (!motorista) {
      throw new Error(`Motorista con ID ${motoristaId} no encontrado.`);
    }

    viaje.aceptar(motorista);
    this.persistir();
    this.emitirEvento("VIAJE_ACEPTADO", {
      codigo: viaje.codigoViaje,
      motoristaId: motorista.identificacion,
      motorista: motorista.nombre
    });
    return viaje;
  }

  public iniciarViaje(codigoViaje: string, pinIngresado?: string): Viaje {
    const viaje = this._viajes.get(codigoViaje);
    if (!viaje) {
      throw new Error(`Viaje con código ${codigoViaje} no existe.`);
    }
    viaje.iniciar(pinIngresado);
    this.persistir();
    this.emitirEvento("VIAJE_INICIADO", { codigo: viaje.codigoViaje });
    return viaje;
  }

  public finalizarViaje(codigoViaje: string): Viaje {
    const viaje = this._viajes.get(codigoViaje);
    if (!viaje) {
      throw new Error(`Viaje con código ${codigoViaje} no existe.`);
    }
    viaje.finalizar();
    this.persistir();
    this.emitirEvento("VIAJE_FINALIZADO", {
      codigo: viaje.codigoViaje,
      tarifa: viaje.tarifa,
      pago: viaje.pago.estado
    });
    return viaje;
  }

  public marcarLlegadaSegura(codigoViaje: string): Viaje {
    const viaje = this._viajes.get(codigoViaje);
    if (!viaje) {
      throw new Error(`Viaje con código ${codigoViaje} no existe.`);
    }
    viaje.confirmarLlegadaSegura();
    this.persistir();
    this.emitirEvento("LLEGADA_SEGURA_CONFIRMADA", {
      codigo: viaje.codigoViaje,
      fechaLlegadaSegura: viaje.fechaLlegadaSegura?.toISOString()
    });
    return viaje;
  }

  public cancelarViaje(codigoViaje: string, motivo: string): Viaje {
    const viaje = this._viajes.get(codigoViaje);
    if (!viaje) {
      throw new Error(`Viaje con código ${codigoViaje} no existe.`);
    }
    viaje.cancelar(motivo);
    this.persistir();
    this.emitirEvento("VIAJE_CANCELADO", {
      codigo: viaje.codigoViaje,
      motivo
    });
    return viaje;
  }

  public calificarViaje(
    codigoViaje: string,
    puntuacion: number,
    comentario: string,
    autorId: string
  ): Viaje {
    const viaje = this._viajes.get(codigoViaje);
    if (!viaje) {
      throw new Error(`Viaje con código ${codigoViaje} no existe.`);
    }
    viaje.agregarCalificacion(new Calificacion(puntuacion, comentario, autorId));
    this.persistir();
    this.emitirEvento("VIAJE_CALIFICADO", {
      codigo: viaje.codigoViaje,
      puntuacion,
      autorId
    });
    return viaje;
  }

  public async iniciarSesion(
    identificador: string,
    password?: string
  ): Promise<{
    rol: "pasajero" | "motorista" | "admin";
    identificacion: string;
    nombre: string;
    correo: string;
    telefono: string;
    detalle: string;
    debeCambiarPassword: boolean;
  }> {
    const clave = (identificador || "").trim().toLowerCase();
    if (!clave || !password) {
      await dummyPasswordCheck(password || "dummy");
      throw new CredencialesInvalidasError("Ingresa tu usuario y contraseña.");
    }

    // 1. Administrador (acepta tucanadmin, tucangoadmin, admin, correo)
    const esAliasAdmin =
      clave === "tucanadmin" ||
      clave === "tucangoadmin" ||
      clave === "admin" ||
      clave === DEFAULT_ADMIN_USER ||
      clave === DEFAULT_ADMIN_EMAIL;

    const admin =
      (esAliasAdmin ? this.obtenerAdministradores()[0] : undefined) ||
      this.obtenerAdministradores().find(
        (a) => a.identificacion.toLowerCase() === clave || a.correoInstitucional.toLowerCase() === clave
      );

    if (admin) {
      const match = await admin.verificarPassword(password);
      if (!match) throw new CredencialesInvalidasError();
      this.emitirEvento("USUARIO_AUTENTICADO", {
        rol: "admin",
        identificacion: admin.identificacion,
        nombre: admin.nombre
      });
      return admin.construirResumenSesion();
    }

    // 2. Estudiantes (acepta estudiante, 1001, correo, código)
    const esAliasEstudiante = clave === "estudiante" || clave === "pasajero";
    const est = this.obtenerEstudiantes().find(
      (e) =>
        (esAliasEstudiante && (e.identificacion === "1001" || e.identificacion === "estudiante")) ||
        (e.usuario && e.usuario.toLowerCase() === clave) ||
        e.identificacion.toLowerCase() === clave ||
        e.correoInstitucional.toLowerCase() === clave ||
        e.telefono.toLowerCase() === clave ||
        e.codigoEstudiantil.toLowerCase() === clave
    );
    if (est) {
      const match = await est.verificarPassword(password);
      if (!match) throw new CredencialesInvalidasError();
      this.emitirEvento("USUARIO_AUTENTICADO", {
        rol: "pasajero",
        identificacion: est.identificacion,
        nombre: est.nombre
      });
      return est.construirResumenSesion();
    }

    // 3. Motoristas / Tucanes (acepta motorista, tucan, 2001, GNX-45F, correo)
    const esAliasMotorista = clave === "motorista" || clave === "conductor" || clave === "tucan";
    const mot = this.obtenerMotoristas().find(
      (m) =>
        (esAliasMotorista && (m.identificacion === "2001" || m.identificacion === "motorista")) ||
        (m.usuario && m.usuario.toLowerCase() === clave) ||
        m.identificacion.toLowerCase() === clave ||
        m.correoInstitucional.toLowerCase() === clave ||
        m.telefono.toLowerCase() === clave ||
        (m.obtenerMotoActiva()?.placa || "").toLowerCase() === clave
    );
    if (mot) {
      const match = await mot.verificarPassword(password);
      if (!match) throw new CredencialesInvalidasError();

      if (mot.estadoAprobacion === "PENDIENTE_APROBACION") {
        throw new CuentaEnRevisionError(
          "Tu registro como Tucán está en revisión por la administración de la Universidad de la Amazonia. Cuando tus documentos y SOAT sean aprobados, recibirás tu correo institucional de bienvenida y se activará tu acceso."
        );
      }
      if (mot.estadoAprobacion === "RECHAZADO") {
        throw new AuthError(
          `Tu solicitud como Tucán fue rechazada: ${mot.motivoRechazo || "Documentación no conforme con las normas universitarias"}.`,
          403,
          "TUCAN_RECHAZADO"
        );
      }

      this.emitirEvento("USUARIO_AUTENTICADO", {
        rol: "motorista",
        identificacion: mot.identificacion,
        nombre: mot.nombre
      });
      return mot.construirResumenSesion();
    }

    // Usuario no existe: ejecutar timing de protección contra enumeración (B10)
    await dummyPasswordCheck(password);
    throw new CredencialesInvalidasError();
  }

  public resolverSesion(
    identificacion: string,
    rol: "pasajero" | "motorista" | "admin"
  ): {
    rol: "pasajero" | "motorista" | "admin";
    identificacion: string;
    nombre: string;
    correo: string;
    telefono: string;
    detalle: string;
    debeCambiarPassword: boolean;
  } {
    const id = (identificacion || "").trim().toLowerCase();
    if (!id) throw new NoAutenticadoError();

    if (rol === "admin") {
      const admin = this.obtenerAdministradores().find((a) => a.identificacion.toLowerCase() === id);
      if (!admin) throw new NoAutenticadoError("Sesión inválida: administrador no encontrado.");
      return admin.construirResumenSesion();
    }

    if (rol === "motorista") {
      const mot = this.obtenerMotoristas().find((m) => m.identificacion.toLowerCase() === id);
      if (!mot) throw new NoAutenticadoError("Sesión inválida: motorista no encontrado.");
      return mot.construirResumenSesion();
    }

    const est = this.obtenerEstudiantes().find((e) => e.identificacion.toLowerCase() === id);
    if (!est) throw new NoAutenticadoError("Sesión inválida: estudiante no encontrado.");
    return est.construirResumenSesion();
  }

  public async cambiarPassword(
    identificacion: string,
    rol: "pasajero" | "motorista" | "admin",
    passwordActual: string,
    passwordNueva: string
  ): Promise<void> {
    validarPoliticaPassword(passwordNueva);

    let persona: Persona | undefined;
    if (rol === "admin") {
      persona = this.obtenerAdministradores().find((a) => a.identificacion === identificacion);
    } else if (rol === "motorista") {
      persona = this.obtenerMotoristas().find((m) => m.identificacion === identificacion);
    } else {
      persona = this.obtenerEstudiantes().find((e) => e.identificacion === identificacion);
    }

    if (!persona) throw new NoAutenticadoError("Usuario no encontrado.");
    const match = await persona.verificarPassword(passwordActual);
    if (!match) throw new CredencialesInvalidasError("La contraseña actual es incorrecta.");

    persona.asignarPasswordHash(hashPasswordSync(passwordNueva));
    persona.debeCambiarPassword = false;
    this.persistir();
    this.emitirEvento("PASSWORD_CAMBIADO", { identificacion, rol });
  }

  public obtenerPerfilUsuario(
    rol: "pasajero" | "motorista" | "admin",
    identificacion: string
  ) {
    const id = (identificacion || "").trim().toLowerCase();
    const todosViajes = this.obtenerTodosLosViajes();

    if (rol === "admin") {
      const admin = this.obtenerAdministradores().find((a) => a.identificacion.toLowerCase() === id);
      if (!admin) throw new NoAutenticadoError("Administrador no encontrado.");
      const metricas = this.obtenerMetricas();
      return {
        rol: "admin" as const,
        identificacion: admin.identificacion,
        nombre: admin.nombre,
        telefono: admin.telefono,
        correo: admin.correoInstitucional,
        cargo: admin.cargo,
        detalle: `ADMIN · ${admin.cargo}`,
        contactoEmergencia: admin.contactoEmergencia,
        sedeFavorita: admin.sedeFavorita,
        estadisticas: {
          totalViajesUsuario: metricas.totalViajes,
          viajesCompletados: metricas.finalizados,
          gastoOAhorroCop: metricas.ingresosGenerados,
          calificacionPromedio: 5.0
        }
      };
    }

    if (rol === "motorista") {
      const mot = this.obtenerMotoristas().find((m) => m.identificacion.toLowerCase() === id);
      if (!mot) throw new NoAutenticadoError("Motorista no encontrado.");
      const moto = mot.obtenerMotoActiva();
      const viajesMot = todosViajes.filter((v) => v.motorista?.identificacion === mot.identificacion);
      const completados = viajesMot.filter((v) => v.estado.nombre === "FINALIZADO");
      const ingresos = completados.reduce((acc, v) => acc + v.tarifa, 0);
      const ratings = completados.flatMap((v) => v.calificaciones.map((c) => c.puntuacion));
      const ratingProm =
        ratings.length > 0
          ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
          : 5.0;
      return {
        rol: "motorista" as const,
        identificacion: mot.identificacion,
        nombre: mot.nombre,
        telefono: mot.telefono,
        correo: mot.correoInstitucional,
        detalle: moto ? `${moto.marca} ${moto.modelo} · Placa ${moto.placa}` : "Motorista TucanGo",
        estadoAprobacion: mot.estadoAprobacion,
        contactoEmergencia: mot.contactoEmergencia,
        sedeFavorita: mot.sedeFavorita,
        moto: moto
          ? {
              placa: moto.placa,
              marca: moto.marca,
              modelo: moto.modelo,
              cilindraje: moto.cilindraje,
              numeroSoat: moto.numeroSoat,
              soatVigente: moto.soatVigente
            }
          : null,
        estadisticas: {
          totalViajesUsuario: viajesMot.length,
          viajesCompletados: completados.length,
          gastoOAhorroCop: ingresos,
          calificacionPromedio: ratingProm
        }
      };
    }

    const est = this.obtenerEstudiantes().find((e) => e.identificacion.toLowerCase() === id);
    if (!est) throw new NoAutenticadoError("Estudiante no encontrado.");
    const viajesEst = todosViajes.filter((v) => v.estudiante.identificacion === est.identificacion);
    const completados = viajesEst.filter((v) => v.estado.nombre === "FINALIZADO");
    const invertido = completados.reduce((acc, v) => acc + v.tarifa, 0);
    const ratings = completados.flatMap((v) => v.calificaciones.map((c) => c.puntuacion));
    const ratingProm =
      ratings.length > 0
        ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
        : 5.0;

    return {
      rol: "pasajero" as const,
      identificacion: est.identificacion,
      nombre: est.nombre,
      telefono: est.telefono,
      correo: est.correoInstitucional,
      codigoEstudiantil: est.codigoEstudiantil,
      carrera: est.carrera,
      barrioResidencia: est.barrioResidencia,
      ubicacionesFrecuentes: est.ubicacionesFrecuentes,
      detalle: `${est.carrera} · ${est.codigoEstudiantil}`,
      contactoEmergencia: est.contactoEmergencia,
      sedeFavorita: est.sedeFavorita,
      estadisticas: {
        totalViajesUsuario: viajesEst.length,
        viajesCompletados: completados.length,
        gastoTotalCop: invertido,
        gastoOAhorroCop: invertido,
        kmRecorridos: Number(
          completados.reduce((acc, v) => acc + v.distanciaKm, 0).toFixed(2)
        ),
        calificacionPromedio: ratingProm
      }
    };
  }

  public registrarUbicacionEstudiante(
    estudianteId: string,
    dto: {
      id?: string;
      etiqueta: string;
      nombre: string;
      barrio?: string;
      referencia?: string;
      latitud: number;
      longitud: number;
    }
  ): UbicacionFrecuente {
    const est = this.obtenerEstudiantes().find(
      (e) => e.identificacion.toLowerCase() === (estudianteId || "").trim().toLowerCase()
    );
    if (!est) {
      throw new NoAutenticadoError("Estudiante no encontrado.");
    }
    const guardada = est.guardarUbicacionFrecuente(dto);
    this.persistir();
    this.emitirEvento("UBICACION_FRECUENTE_ACTUALIZADA", {
      estudianteId: est.identificacion,
      etiqueta: guardada.etiqueta,
      barrio: guardada.barrio
    });
    return guardada;
  }

  public eliminarUbicacionEstudiante(estudianteId: string, ubicacionId: string): boolean {
    const est = this.obtenerEstudiantes().find(
      (e) => e.identificacion.toLowerCase() === (estudianteId || "").trim().toLowerCase()
    );
    if (!est) {
      throw new NoAutenticadoError("Estudiante no encontrado.");
    }
    const ok = est.eliminarUbicacionFrecuente(ubicacionId);
    if (ok) {
      this.persistir();
      this.emitirEvento("UBICACION_FRECUENTE_ACTUALIZADA", {
        estudianteId: est.identificacion,
        eliminada: ubicacionId
      });
    }
    return ok;
  }

  public obtenerAnaliticaAdmin() {
    const estudiantes = this.obtenerEstudiantes();
    const motoristas = this.obtenerMotoristas();
    const viajes = this.obtenerTodosLosViajes();

    const finalizados = viajes.filter((v) => v.estado.nombre === "FINALIZADO");
    const activos = viajes.filter(
      (v) =>
        v.estado.nombre === "SOLICITADO" ||
        v.estado.nombre === "ACEPTADO" ||
        v.estado.nombre === "EN_CURSO"
    );
    const cancelados = viajes.filter((v) => v.estado.nombre === "CANCELADO");
    const llegadasSeguras = finalizados.filter((v) => v.llegadaSeguraConfirmada).length;
    const distanciaTotalKm = Number(
      finalizados.reduce((acc, v) => acc + v.distanciaKm, 0).toFixed(2)
    );
    const volumenMovilidadCop = finalizados.reduce((acc, v) => acc + v.tarifa, 0);
    const promedioDistanciaKm =
      finalizados.length > 0 ? Number((distanciaTotalKm / finalizados.length).toFixed(2)) : 0;

    // 1. Agregación anónima de barrios de residencia (Ley 1581 de 2012 - sin exponer direcciones exactas)
    const mapaBarrios = new Map<string, number>();
    for (const est of estudiantes) {
      const casa = est.ubicacionesFrecuentes.find((u) => u.etiqueta.toLowerCase() === "casa");
      const barrio =
        (casa?.barrio && casa.barrio !== "Sin especificar" ? casa.barrio : est.barrioResidencia) ||
        "Sin especificar";
      mapaBarrios.set(barrio, (mapaBarrios.get(barrio) || 0) + 1);
    }
    const barriosEstudiantes = Array.from(mapaBarrios.entries())
      .map(([barrio, cantidad]) => ({
        barrio,
        estudiantes: cantidad,
        porcentaje:
          estudiantes.length > 0 ? Math.round((cantidad / estudiantes.length) * 100) : 0
      }))
      .sort((a, b) => b.estudiantes - a.estudiantes);

    // 2. Corredores / rutas más frecuentes
    const mapaCorredores = new Map<string, { origen: string; destino: string; viajes: number; sumKm: number }>();
    for (const v of viajes) {
      const key = `${v.origen} -> ${v.destino}`;
      const prev = mapaCorredores.get(key) || {
        origen: v.origen,
        destino: v.destino,
        viajes: 0,
        sumKm: 0
      };
      prev.viajes += 1;
      prev.sumKm += v.distanciaKm;
      mapaCorredores.set(key, prev);
    }
    const corredoresComunes = Array.from(mapaCorredores.entries())
      .map(([ruta, info]) => ({
        ruta,
        origen: info.origen,
        destino: info.destino,
        viajes: info.viajes,
        kmPromedio: Number((info.sumKm / info.viajes).toFixed(2))
      }))
      .sort((a, b) => b.viajes - a.viajes)
      .slice(0, 8);

    // 3. Demanda por sede oficial
    let viajesPorvenir = 0;
    let viajesCentro = 0;
    let viajesOtros = 0;
    for (const v of viajes) {
      const texto = `${v.origen} ${v.destino}`.toLowerCase();
      if (texto.includes("porvenir")) viajesPorvenir += 1;
      if (texto.includes("centro") || texto.includes("idema")) viajesCentro += 1;
      if (!texto.includes("porvenir") && !texto.includes("centro") && !texto.includes("idema")) {
        viajesOtros += 1;
      }
    }

    // 4. Distribución por estrategia de tarifa y método de pago
    const mapaTarifas = new Map<string, number>();
    const mapaPagos = new Map<string, number>();
    const mapaDias = new Map<string, number>();
    for (const v of viajes) {
      const estName = v.estrategiaTarifa.nombre;
      mapaTarifas.set(estName, (mapaTarifas.get(estName) || 0) + 1);
      const metName = v.pago.metodo;
      mapaPagos.set(metName, (mapaPagos.get(metName) || 0) + 1);
      const dia = v.fechaCreacion.toISOString().slice(0, 10);
      mapaDias.set(dia, (mapaDias.get(dia) || 0) + 1);
    }

    // 5. Puntos recurrentes anonimizados para Mapa General Admin (Ley 1581 de 2012)
    const mapaPuntos = new Map<
      string,
      {
        id: string;
        etiqueta: string;
        barrio: string;
        latSum: number;
        lngSum: number;
        registros: number;
        viajes: number;
        origenDato: "UBICACION_RECURRENTE" | "SECTOR_DESTINO";
      }
    >();

    for (const est of estudiantes) {
      for (const u of est.ubicacionesFrecuentes) {
        const key = `${u.latitud.toFixed(3)},${u.longitud.toFixed(3)}`;
        const prev = mapaPuntos.get(key) || {
          id: `REC_${key.replace(/[.,-]/g, "_")}`,
          etiqueta: u.etiqueta || "Punto recurrente",
          barrio: u.barrio || est.barrioResidencia || "Sin especificar",
          latSum: 0,
          lngSum: 0,
          registros: 0,
          viajes: 0,
          origenDato: "UBICACION_RECURRENTE" as const
        };
        prev.latSum += u.latitud;
        prev.lngSum += u.longitud;
        prev.registros += 1;
        if (!prev.barrio || prev.barrio === "Sin especificar") {
          prev.barrio = u.barrio || est.barrioResidencia || "Sin especificar";
        }
        mapaPuntos.set(key, prev);
      }
    }

    for (const v of viajes) {
      const sectorDest = SECTORES_FLORENCIA.find(
        (s) => s.nombre.toLowerCase() === v.destino.toLowerCase() || s.id.toLowerCase() === v.destino.toLowerCase()
      );
      if (sectorDest && sectorDest.id !== "PORVENIR" && sectorDest.id !== "CENTRO") {
        const key = `${sectorDest.coordenada.latitud.toFixed(3)},${sectorDest.coordenada.longitud.toFixed(3)}`;
        const prev = mapaPuntos.get(key) || {
          id: `SEC_${sectorDest.id}`,
          etiqueta: sectorDest.nombre,
          barrio: sectorDest.referencia || sectorDest.nombre,
          latSum: sectorDest.coordenada.latitud,
          lngSum: sectorDest.coordenada.longitud,
          registros: 0,
          viajes: 0,
          origenDato: "SECTOR_DESTINO" as const
        };
        prev.viajes += 1;
        mapaPuntos.set(key, prev);
      } else {
        for (const p of mapaPuntos.values()) {
          if (
            v.destino.toLowerCase().includes(p.etiqueta.toLowerCase()) ||
            v.destino.toLowerCase().includes(p.barrio.toLowerCase()) ||
            v.origen.toLowerCase().includes(p.barrio.toLowerCase())
          ) {
            p.viajes += 1;
          }
        }
      }
    }

    const puntosRecurrentesMapa = Array.from(mapaPuntos.values())
      .map((p) => {
        const divisor = Math.max(1, p.registros || 1);
        return {
          id: p.id,
          etiqueta: p.etiqueta,
          barrio: p.barrio,
          latitud: Number((p.latSum / divisor).toFixed(5)),
          longitud: Number((p.lngSum / divisor).toFixed(5)),
          registros: p.registros,
          viajes: p.viajes,
          origenDato: p.origenDato
        };
      })
      .sort((a, b) => b.registros + b.viajes - (a.registros + a.viajes));

    const tucanesActivos = motoristas.filter((m) => m.estadoAprobacion === "ACTIVO");
    const tucanesPendientes = motoristas.filter((m) => m.estadoAprobacion === "PENDIENTE_APROBACION");

    return {
      resumen: {
        totalEstudiantes: estudiantes.length,
        totalTucanesActivos: tucanesActivos.length,
        totalTucanesPendientes: tucanesPendientes.length,
        totalTucanesRechazados: motoristas.filter((m) => m.estadoAprobacion === "RECHAZADO").length,
        totalViajes: viajes.length,
        viajesFinalizados: finalizados.length,
        viajesActivos: activos.length,
        viajesCancelados: cancelados.length,
        llegadasSeguras,
        tasaCumplimientoPct:
          viajes.length > 0 ? Math.round((finalizados.length / viajes.length) * 100) : 0,
        distanciaTotalKm,
        promedioDistanciaKm,
        volumenMovilidadCop
      },
      barriosEstudiantes,
      corredoresComunes,
      demandaPorSede: [
        { sede: "Sede Porvenir", viajes: viajesPorvenir },
        { sede: "Sede Centro (IDEMA)", viajes: viajesCentro },
        { sede: "Otros Sectores", viajes: viajesOtros }
      ],
      distribucionTarifas: Array.from(mapaTarifas.entries()).map(([nombre, cantidad]) => ({
        nombre,
        cantidad
      })),
      distribucionPagos: Array.from(mapaPagos.entries()).map(([metodo, cantidad]) => ({
        metodo,
        cantidad
      })),
      actividadPorDia: Array.from(mapaDias.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([fecha, cantidad]) => ({ fecha, cantidad })),
      puntosRecurrentesMapa,
      comunidad: {
        estudiantes: estudiantes.map((e) => ({
          identificacion: e.identificacion,
          nombre: e.nombre,
          codigoEstudiantil: e.codigoEstudiantil,
          carrera: e.carrera,
          barrioResidencia: e.barrioResidencia,
          sedeFavorita: e.sedeFavorita,
          lugaresGuardados: e.ubicacionesFrecuentes.length,
          viajesRealizados: viajes.filter((v) => v.estudiante.identificacion === e.identificacion)
            .length
        })),
        tucanes: motoristas.map((m) => {
          const moto = m.obtenerMotoActiva();
          return {
            identificacion: m.identificacion,
            nombre: m.nombre,
            telefono: m.telefono,
            correo: m.correoInstitucional,
            estadoAprobacion: m.estadoAprobacion,
            disponible: m.disponible,
            placa: moto?.placa || "N/A",
            marca: moto?.marca || "",
            modelo: moto?.modelo || "",
            cilindraje: moto?.cilindraje || 0,
            soatVigente: moto?.soatVigente ?? false,
            numeroSoat: moto?.numeroSoat || "",
            viajesCompletados: finalizados.filter(
              (v) => v.motorista?.identificacion === m.identificacion
            ).length
          };
        })
      }
    };
  }

  public actualizarPerfilUsuario(
    rol: "pasajero" | "motorista" | "admin",
    identificacion: string,
    dto: ActualizarPerfilDTO
  ) {
    if (dto.correoInstitucional !== undefined) {
      const email = dto.correoInstitucional.trim().toLowerCase();
      const dominiosValidos =
        rol === "admin"
          ? ["@uniamazonia.edu.co", "@udla.edu.co", "@tucango.edu.co"]
          : ["@uniamazonia.edu.co", "@udla.edu.co"];
      if (!dominiosValidos.some((dom) => email.endsWith(dom))) {
        throw new ValidacionError(
          rol === "admin"
            ? "El correo del administrador debe pertenecer al dominio institucional o @tucango.edu.co."
            : "El correo debe ser institucional (@uniamazonia.edu.co o @udla.edu.co)."
        );
      }
    }

    const id = (identificacion || "").trim().toLowerCase();
    if (rol === "admin") {
      const admin = this.obtenerAdministradores().find((a) => a.identificacion.toLowerCase() === id);
      if (!admin) throw new NoAutenticadoError("Administrador no encontrado.");
      admin.actualizarPerfil({
        nombre: dto.nombre,
        telefono: dto.telefono,
        correoInstitucional: dto.correoInstitucional,
        cargo: dto.cargo,
        contactoEmergencia: dto.contactoEmergencia,
        sedeFavorita: dto.sedeFavorita
      });
    } else if (rol === "motorista") {
      const mot = this.obtenerMotoristas().find((m) => m.identificacion.toLowerCase() === id);
      if (!mot) throw new NoAutenticadoError("Motorista no encontrado.");
      mot.actualizarPerfil({
        nombre: dto.nombre,
        telefono: dto.telefono,
        correoInstitucional: dto.correoInstitucional,
        placa: dto.placa,
        marca: dto.marca,
        modelo: dto.modelo,
        cilindraje: dto.cilindraje !== undefined ? Number(dto.cilindraje) : undefined,
        numeroSoat: dto.numeroSoat,
        contactoEmergencia: dto.contactoEmergencia,
        sedeFavorita: dto.sedeFavorita
      });
    } else {
      const est = this.obtenerEstudiantes().find((e) => e.identificacion.toLowerCase() === id);
      if (!est) throw new NoAutenticadoError("Estudiante no encontrado.");
      est.actualizarPerfil({
        nombre: dto.nombre,
        telefono: dto.telefono,
        correoInstitucional: dto.correoInstitucional,
        codigoEstudiantil: dto.codigoEstudiantil,
        carrera: dto.carrera,
        barrioResidencia: dto.barrioResidencia,
        contactoEmergencia: dto.contactoEmergencia,
        sedeFavorita: dto.sedeFavorita
      });
    }

    this.persistir();
    const perfil = this.obtenerPerfilUsuario(rol, identificacion);
    this.emitirEvento("PERFIL_ACTUALIZADO", {
      rol,
      identificacion: perfil.identificacion,
      nombre: perfil.nombre
    });
    return perfil;
  }

  // Compatibilidad hacia atrás para tests unitarios sincrónicos
  public autenticarUsuario(
    identificador: string,
    rolPreferido?: "pasajero" | "motorista" | "admin"
  ) {
    const clave = (identificador || "").trim().toLowerCase();
    if (!clave) throw new Error("Identificador inválido.");

    if (rolPreferido === "admin" || clave === DEFAULT_ADMIN_USER || clave === DEFAULT_ADMIN_EMAIL) {
      const admin = this.obtenerAdministradores().find(
        (a) =>
          a.identificacion.toLowerCase() === clave ||
          a.correoInstitucional.toLowerCase() === clave
      );
      if (admin) {
        return admin.construirResumenSesion();
      }
    }

    if (rolPreferido !== "motorista") {
      const est = this.obtenerEstudiantes().find(
        (e) =>
          e.identificacion.toLowerCase() === clave ||
          e.correoInstitucional.toLowerCase() === clave ||
          e.telefono.toLowerCase() === clave ||
          e.codigoEstudiantil.toLowerCase() === clave
      );
      if (est) {
        this.emitirEvento("USUARIO_AUTENTICADO", {
          rol: "pasajero",
          identificacion: est.identificacion,
          nombre: est.nombre
        });
        return est.construirResumenSesion();
      }
    }

    const mot = this.obtenerMotoristas().find(
      (m) =>
        m.identificacion.toLowerCase() === clave ||
        m.correoInstitucional.toLowerCase() === clave ||
        m.telefono.toLowerCase() === clave ||
        (m.obtenerMotoActiva()?.placa || "").toLowerCase() === clave
    );
    if (mot) {
      this.emitirEvento("USUARIO_AUTENTICADO", {
        rol: "motorista",
        identificacion: mot.identificacion,
        nombre: mot.nombre
      });
      return mot.construirResumenSesion();
    }

    throw new Error(`No se encontró ningún usuario registrado para '${identificador}'.`);
  }

  public cambiarDisponibilidadMotorista(motoristaId: string, disponible: boolean): Motorista {
    const motorista = this._motoristas.get(motoristaId);
    if (!motorista) {
      throw new Error(`Motorista con ID ${motoristaId} no encontrado.`);
    }
    const viajeActivo = this.obtenerTodosLosViajes().find(
      (v) =>
        v.motorista?.identificacion === motoristaId &&
        (v.estado.nombre === "ACEPTADO" || v.estado.nombre === "EN_CURSO")
    );
    if (!disponible && viajeActivo) {
      throw new Error(`No puedes desconectarte mientras atiendes el viaje ${viajeActivo.codigoViaje}.`);
    }
    motorista.disponible = Boolean(disponible);
    this.persistir();
    this.emitirEvento("MOTORISTA_DISPONIBILIDAD_CAMBIADA", {
      motoristaId: motorista.identificacion,
      disponible: motorista.disponible
    });
    return motorista;
  }

  public actualizarUbicacionMotorista(
    motoristaId: string,
    latitud: number,
    longitud: number,
    direccionGrados?: number
  ): Motorista {
    const motorista = this._motoristas.get(motoristaId);
    if (!motorista) {
      throw new Error(`Motorista con ID ${motoristaId} no encontrado.`);
    }
    const coord = new Coordenada(latitud, longitud);
    motorista.actualizarUbicacion(coord, direccionGrados);

    const viajeActivo = this.obtenerTodosLosViajes().find(
      (v) =>
        v.motorista?.identificacion === motoristaId &&
        (v.estado.nombre === "ACEPTADO" || v.estado.nombre === "EN_CURSO")
    );
    if (viajeActivo) {
      viajeActivo.actualizarTracking(
        viajeActivo.progresoRuta,
        coord.latitud,
        coord.longitud,
        motorista.direccionGrados
      );
    }

    // La posición GPS es efímera. Persistirla en cada ping reescribe el
    // snapshot completo, documentos en base64 incluidos, así que se guarda
    // como máximo cada 15 segundos por Tucán.
    const ahora = Date.now();
    const ultimaPersistencia = this._ultimaPersistenciaUbicacion.get(motorista.identificacion) ?? 0;
    if (ahora - ultimaPersistencia >= 15000) {
      this._ultimaPersistenciaUbicacion.set(motorista.identificacion, ahora);
      this.persistir();
    }
    this.emitirEvento("UBICACION_MOTORISTA_ACTUALIZADA", {
      motoristaId: motorista.identificacion,
      latitud: coord.latitud,
      longitud: coord.longitud,
      direccionGrados: motorista.direccionGrados
    });
    return motorista;
  }

  public avanzarSimulacionViaje(codigoViaje: string, incrementoProgreso: number = 25): Viaje {
    const viaje = this._viajes.get(codigoViaje);
    if (!viaje) {
      throw new Error(`Viaje con código ${codigoViaje} no existe.`);
    }
    if (!viaje.motorista) {
      throw new Error(`El viaje ${codigoViaje} aún no tiene un motorista asignado.`);
    }
    const estado = viaje.estado.nombre;
    if (estado !== "ACEPTADO" && estado !== "EN_CURSO") {
      throw new Error(`El viaje ${codigoViaje} en estado ${estado} no admite seguimiento en ruta.`);
    }

    const sectorOrigen = this.resolverSectorPorTexto(viaje.origen, "PORVENIR");
    const sectorDestino = this.resolverSectorPorTexto(viaje.destino, "CENTRO");
    const paso = Math.max(1, Math.min(100, Number(incrementoProgreso) || 25));
    const progresoActual = viaje.progresoRuta;
    const nuevoProgreso = Math.min(100, progresoActual + paso);

    let lat = sectorOrigen.coordenada.latitud;
    let lng = sectorOrigen.coordenada.longitud;
    let rumbo = viaje.motorista.direccionGrados;

    if (estado === "ACEPTADO") {
      const actualLat = viaje.ubicacionMotoristaLat ?? viaje.motorista.ubicacionActual.latitud;
      const actualLng = viaje.ubicacionMotoristaLng ?? viaje.motorista.ubicacionActual.longitud;
      const restante = Math.max(1, 100 - progresoActual);
      const fraccionPaso = Math.min(1, paso / restante);
      lat = Number(
        (actualLat + (sectorOrigen.coordenada.latitud - actualLat) * fraccionPaso).toFixed(6)
      );
      lng = Number(
        (actualLng + (sectorOrigen.coordenada.longitud - actualLng) * fraccionPaso).toFixed(6)
      );
      rumbo = new Coordenada(actualLat, actualLng).rumboHacia(sectorOrigen.coordenada);
    } else {
      const polilinea = TucanGoFacade.construirPolilinea(
        sectorOrigen.coordenada,
        sectorDestino.coordenada,
        12
      );
      const pos = TucanGoFacade.interpolarSobrePolilinea(polilinea, nuevoProgreso);
      lat = pos.latitud;
      lng = pos.longitud;
      rumbo = pos.direccionGrados;
    }

    viaje.actualizarTracking(nuevoProgreso, lat, lng, rumbo);
    viaje.motorista.actualizarUbicacion(new Coordenada(lat, lng), rumbo);
    this.persistir();
    this.emitirEvento("TRACKING_VIAJE_ACTUALIZADO", {
      codigo: viaje.codigoViaje,
      etapaTracking: viaje.etapaTracking,
      progresoRuta: viaje.progresoRuta,
      latitud: lat,
      longitud: lng,
      direccionGrados: rumbo,
      motoristaId: viaje.motorista.identificacion
    });
    return viaje;
  }

  public obtenerViaje(codigoViaje: string): Viaje | undefined {
    return this._viajes.get(codigoViaje);
  }

  public obtenerTodosLosViajes(): Viaje[] {
    return Array.from(this._viajes.values());
  }

  public obtenerMetricas(): {
    totalViajes: number;
    finalizados: number;
    solicitados: number;
    enCurso: number;
    ingresosGenerados: number;
  } {
    const viajes = Array.from(this._viajes.values());
    const finalizados = viajes.filter((v) => v.estado.nombre === "FINALIZADO");
    const solicitados = viajes.filter((v) => v.estado.nombre === "SOLICITADO");
    const enCurso = viajes.filter((v) => v.estado.nombre === "EN_CURSO" || v.estado.nombre === "ACEPTADO");
    const ingresosGenerados = finalizados.reduce((acc, v) => acc + v.tarifa, 0);

    return {
      totalViajes: viajes.length,
      finalizados: finalizados.length,
      solicitados: solicitados.length,
      enCurso: enCurso.length,
      ingresosGenerados
    };
  }

  /**
   * Vista de métricas propia de cada rol. Centralizarla evita que el borde
   * repita la segmentación y que un rol herede campos de otro.
   */
  public obtenerMetricasPorRol(
    rol: "admin" | "motorista" | "pasajero" | null,
    identificacion?: string
  ): MetricasDTO {
    const viajes = Array.from(this._viajes.values());
    const finalizados = viajes.filter((v) => v.estado.nombre === "FINALIZADO");
    const solicitados = viajes.filter((v) => v.estado.nombre === "SOLICITADO");
    const enCurso = viajes.filter(
      (v) => v.estado.nombre === "EN_CURSO" || v.estado.nombre === "ACEPTADO"
    );

    if (rol === "admin") {
      return {
        rol: "admin",
        totalViajes: viajes.length,
        finalizados: finalizados.length,
        solicitados: solicitados.length,
        enCurso: enCurso.length,
        volumenMovilidadCop: finalizados.reduce((acc, v) => acc + v.tarifa, 0)
      };
    }

    if (!identificacion) {
      return { rol: "anonimo", totalViajes: 0, finalizados: 0, solicitados: 0, enCurso: 0 };
    }

    if (rol === "pasajero") {
      const propios = viajes.filter((v) => v.estudiante.identificacion === identificacion);
      const propiosFinalizados = propios.filter((v) => v.estado.nombre === "FINALIZADO");
      return {
        rol: "pasajero",
        totalViajes: propios.length,
        finalizados: propiosFinalizados.length,
        solicitados: propios.filter(
          (v) => v.estado.nombre === "SOLICITADO" || v.estado.nombre === "ACEPTADO" || v.estado.nombre === "EN_CURSO"
        ).length,
        enCurso: propios.filter(
          (v) => v.estado.nombre === "EN_CURSO" || v.estado.nombre === "ACEPTADO"
        ).length,
        gastoTotalCop: propiosFinalizados.reduce((acc, v) => acc + v.tarifa, 0),
        kmRecorridos: Number(
          propiosFinalizados.reduce((acc, v) => acc + v.distanciaKm, 0).toFixed(2)
        )
      };
    }

    if (rol === "motorista") {
      const propios = viajes.filter((v) => v.motorista?.identificacion === identificacion);
      const propiosFinalizados = propios.filter((v) => v.estado.nombre === "FINALIZADO");
      return {
        rol: "motorista",
        totalViajes: propios.length,
        finalizados: propiosFinalizados.length,
        solicitados: solicitados.length,
        enCurso: propios.filter(
          (v) => v.estado.nombre === "EN_CURSO" || v.estado.nombre === "ACEPTADO"
        ).length,
        gananciasCop: propiosFinalizados.reduce((acc, v) => acc + v.tarifa, 0),
        kmRecorridos: Number(
          propiosFinalizados.reduce((acc, v) => acc + v.distanciaKm, 0).toFixed(2)
        )
      };
    }

    return { rol: "anonimo", totalViajes: 0, finalizados: 0, solicitados: 0, enCurso: 0 };
  }
}
