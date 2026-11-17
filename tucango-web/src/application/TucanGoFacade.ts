import { Estudiante } from "../domain/model/Estudiante.ts";
import { Motorista } from "../domain/model/Motorista.ts";
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
  SistemaRepository
} from "./ports/SistemaRepository.ts";

export const DEFAULT_ADMIN_USER = "tucangoadmin";
export const DEFAULT_ADMIN_EMAIL = "admin@tucango.edu.co";
export const DEFAULT_ADMIN_PASSWORD = process.env.TUCANGO_ADMIN_PASSWORD || "TucanAdmin2026";
export const DEFAULT_STUDENT_PASSWORD = process.env.TUCANGO_DEFAULT_STUDENT_PASSWORD || "Estudiante2026";
export const DEFAULT_DRIVER_PASSWORD = process.env.TUCANGO_DEFAULT_DRIVER_PASSWORD || "Motorista2026";

export interface RegistrarEstudianteDTO {
  identificacion: string;
  nombre: string;
  telefono: string;
  correoInstitucional: string;
  codigoEstudiantil: string;
  carrera: string;
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
}

export class TucanGoFacade {
  private _estudiantes: Map<string, Estudiante> = new Map();
  private _motoristas: Map<string, Motorista> = new Map();
  private _viajes: Map<string, Viaje> = new Map();
  private _contadorViajes: number = 100;
  private readonly _repository?: SistemaRepository;
  private readonly _eventBus: EventBus;

  constructor(repository?: SistemaRepository, eventBus?: EventBus) {
    this._repository = repository;
    this._eventBus = eventBus ?? new EventBus();

    const snapshot = this._repository?.cargar();
    if (snapshot) {
      this.rehidratarDesdeSnapshot(snapshot);
    } else {
      this.cargarDatosSemilla();
      this.persistir();
    }
  }

  public obtenerEventBus(): EventBus {
    return this._eventBus;
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
    const direccionInicialGrados = TucanGoFacade.calcularRumbo(
      p0.latitud,
      p0.longitud,
      p1.latitud,
      p1.longitud
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

  private static calcularRumbo(lat1: number, lng1: number, lat2: number, lng2: number): number {
    if (lat1 === lat2 && lng1 === lng2) return 0;
    const rLat1 = (lat1 * Math.PI) / 180;
    const rLat2 = (lat2 * Math.PI) / 180;
    const dLon = ((lng2 - lng1) * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos(rLat2);
    const x =
      Math.cos(rLat1) * Math.sin(rLat2) -
      Math.sin(rLat1) * Math.cos(rLat2) * Math.cos(dLon);
    return Math.round((((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360);
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
    const direccionGrados = TucanGoFacade.calcularRumbo(a.latitud, a.longitud, b.latitud, b.longitud);
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

  private exportarSnapshot(): EstadoSistemaSnapshot {
    return {
      contadorViajes: this._contadorViajes,
      estudiantes: this.obtenerEstudiantes().map((e) => ({
        identificacion: e.identificacion,
        nombre: e.nombre,
        telefono: e.telefono,
        correoInstitucional: e.correoInstitucional,
        codigoEstudiantil: e.codigoEstudiantil,
        carrera: e.carrera,
        passwordHash: e.passwordHash
      })),
      motoristas: this.obtenerMotoristas().map((m) => ({
        identificacion: m.identificacion,
        nombre: m.nombre,
        telefono: m.telefono,
        correoInstitucional: m.correoInstitucional,
        disponible: m.disponible,
        latitud: m.ubicacionActual.latitud,
        longitud: m.ubicacionActual.longitud,
        direccionGrados: m.direccionGrados,
        passwordHash: m.passwordHash,
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

    for (const estSnap of snapshot.estudiantes) {
      const est = new Estudiante(
        estSnap.identificacion,
        estSnap.nombre,
        estSnap.telefono,
        estSnap.correoInstitucional,
        estSnap.codigoEstudiantil,
        estSnap.carrera
      );
      if (estSnap.passwordHash) {
        est.asignarPasswordHash(estSnap.passwordHash);
      } else {
        est.establecerPassword(DEFAULT_STUDENT_PASSWORD);
      }
      this._estudiantes.set(est.identificacion, est);
    }

    for (const motSnap of snapshot.motoristas) {
      const ubicacion =
        typeof motSnap.latitud === "number" && typeof motSnap.longitud === "number"
          ? new Coordenada(motSnap.latitud, motSnap.longitud)
          : undefined;
      const mot = new Motorista(
        motSnap.identificacion,
        motSnap.nombre,
        motSnap.telefono,
        motSnap.correoInstitucional,
        motSnap.disponible,
        ubicacion,
        motSnap.direccionGrados ?? 0
      );
      if (motSnap.passwordHash) {
        mot.asignarPasswordHash(motSnap.passwordHash);
      } else {
        mot.establecerPassword(DEFAULT_DRIVER_PASSWORD);
      }
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

  // --- Inicialización de Semillas para Demo / Universidad ---
  private cargarDatosSemilla(): void {
    // 2 Estudiantes
    const est1 = new Estudiante(
      "1001",
      "Carlos Rivera",
      "3115551234",
      "c.rivera@uniamazonia.edu.co",
      "EST-2024-001",
      "Ingeniería de Sistemas"
    );
    est1.establecerPassword(DEFAULT_STUDENT_PASSWORD);

    const est2 = new Estudiante(
      "1002",
      "Laura Gómez",
      "3127778899",
      "l.gomez@uniamazonia.edu.co",
      "EST-2024-045",
      "Medicina Veterinaria"
    );
    est2.establecerPassword(DEFAULT_STUDENT_PASSWORD);

    this._estudiantes.set(est1.identificacion, est1);
    this._estudiantes.set(est2.identificacion, est2);

    // 3 Motoristas con sus motos geolocalizadas en Florencia
    const mot1 = new Motorista(
      "2001",
      "Jhonatan 'El Tucán' Silva",
      "3201234567",
      "j.silva@uniamazonia.edu.co",
      true,
      new Coordenada(1.6192, -75.6058),
      215
    );
    mot1.establecerPassword(DEFAULT_DRIVER_PASSWORD);
    const moto1 = new Moto("GNX-45F", "Suzuki", "GN 125", 125, true);
    mot1.registrarMoto(moto1);

    const mot2 = new Motorista(
      "2002",
      "Diana Marcela Castro",
      "3109876543",
      "d.castro@uniamazonia.edu.co",
      true,
      new Coordenada(1.6151, -75.6115),
      45
    );
    mot2.establecerPassword(DEFAULT_DRIVER_PASSWORD);
    const moto2 = new Moto("TUK-89D", "Yamaha", "Crypton FI", 115, true);
    mot2.registrarMoto(moto2);

    const mot3 = new Motorista(
      "2003",
      "Miguel Ángel Parra",
      "3154442211",
      "m.parra@uniamazonia.edu.co",
      true,
      new Coordenada(1.6229, -75.6112),
      135
    );
    mot3.establecerPassword(DEFAULT_DRIVER_PASSWORD);
    const moto3 = new Moto("FLR-92H", "Bajaj", "Pulsar NS 160", 160, true, true, "SOAT-2026-PUL");
    mot3.registrarMoto(moto3);

    this._motoristas.set(mot1.identificacion, mot1);
    this._motoristas.set(mot2.identificacion, mot2);
    this._motoristas.set(mot3.identificacion, mot3);
  }

  // --- Casos de Uso: Estudiantes y Motoristas ---
  public obtenerEstudiantes(): Estudiante[] {
    return Array.from(this._estudiantes.values());
  }

  public obtenerMotoristas(): Motorista[] {
    return Array.from(this._motoristas.values());
  }

  public registrarEstudiante(entrada: Estudiante | RegistrarEstudianteDTO): Estudiante {
    const estudiante =
      entrada instanceof Estudiante
        ? entrada
        : new Estudiante(
            entrada.identificacion,
            entrada.nombre,
            entrada.telefono,
            entrada.correoInstitucional,
            entrada.codigoEstudiantil,
            entrada.carrera
          );

    if (!(entrada instanceof Estudiante) && this._estudiantes.has(estudiante.identificacion)) {
      throw new Error(`Ya existe un estudiante registrado con identificación ${estudiante.identificacion}.`);
    }

    if (!(entrada instanceof Estudiante)) {
      estudiante.establecerPassword(entrada.password || DEFAULT_STUDENT_PASSWORD);
    } else if (!estudiante.passwordHash) {
      estudiante.establecerPassword(DEFAULT_STUDENT_PASSWORD);
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
    if (!dto.soatVigente) {
      throw new Error("El SOAT vigente es obligatorio para habilitar una motocicleta en TucanGo.");
    }
    if (this._motoristas.has((dto.identificacion || "").trim())) {
      throw new Error(`Ya existe un motorista registrado con identificación ${dto.identificacion}.`);
    }

    const moto = new Moto(
      dto.placa,
      dto.marca,
      dto.modelo,
      dto.cilindraje,
      true,
      dto.soatVigente,
      dto.numeroSoat || "SOAT-VIGENTE"
    );
    const motorista = new Motorista(
      dto.identificacion,
      dto.nombre,
      dto.telefono,
      dto.correoInstitucional,
      true
    );
    motorista.establecerPassword(dto.password || DEFAULT_DRIVER_PASSWORD);
    motorista.registrarMoto(moto);

    this._motoristas.set(motorista.identificacion, motorista);
    this.persistir();
    this.emitirEvento("MOTORISTA_REGISTRADO", {
      identificacion: motorista.identificacion,
      nombre: motorista.nombre,
      placa: moto.placa
    });
    return motorista;
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

  public iniciarViaje(codigoViaje: string): Viaje {
    const viaje = this._viajes.get(codigoViaje);
    if (!viaje) {
      throw new Error(`Viaje con código ${codigoViaje} no existe.`);
    }
    viaje.iniciar();
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

  public autenticarUsuario(
    identificador: string,
    rolPreferido?: "pasajero" | "motorista" | "admin",
    password?: string
  ): {
    rol: "pasajero" | "motorista" | "admin";
    identificacion: string;
    nombre: string;
    correo: string;
    telefono: string;
    detalle: string;
  } {
    const clave = (identificador || "").trim().toLowerCase();
    if (!clave) {
      throw new Error("Ingresa tu usuario, cédula, código o placa.");
    }

    // 1. Cuenta por defecto de Administrador (tucangoadmin)
    if (
      clave === DEFAULT_ADMIN_USER ||
      clave === DEFAULT_ADMIN_EMAIL ||
      rolPreferido === "admin"
    ) {
      if (clave !== DEFAULT_ADMIN_USER && clave !== DEFAULT_ADMIN_EMAIL) {
        throw new Error("Credenciales de administrador inválidas.");
      }
      if (password !== undefined && password !== DEFAULT_ADMIN_PASSWORD) {
        throw new Error("Contraseña incorrecta.");
      }
      this.emitirEvento("USUARIO_AUTENTICADO", {
        rol: "admin",
        identificacion: DEFAULT_ADMIN_USER,
        nombre: "Administrador TucanGo"
      });
      return {
        rol: "admin",
        identificacion: DEFAULT_ADMIN_USER,
        nombre: "Administrador TucanGo",
        correo: DEFAULT_ADMIN_EMAIL,
        telefono: "3000000000",
        detalle: "ADMIN · Supervisión General TucanGo"
      };
    }

    const buscarEst = () =>
      this.obtenerEstudiantes().find(
        (e) =>
          e.identificacion.toLowerCase() === clave ||
          e.correoInstitucional.toLowerCase() === clave ||
          e.telefono.toLowerCase() === clave ||
          e.codigoEstudiantil.toLowerCase() === clave ||
          (clave === "estudiante" && e.identificacion === "1001")
      );

    const buscarMot = () =>
      this.obtenerMotoristas().find(
        (m) =>
          m.identificacion.toLowerCase() === clave ||
          m.correoInstitucional.toLowerCase() === clave ||
          m.telefono.toLowerCase() === clave ||
          (m.obtenerMotoActiva()?.placa || "").toLowerCase() === clave ||
          (clave === "motorista" && m.identificacion === "2001")
      );

    if (rolPreferido !== "motorista") {
      const est = buscarEst();
      if (est) {
        if (password !== undefined && !est.verificarPassword(password)) {
          throw new Error("Contraseña incorrecta.");
        }
        this.emitirEvento("USUARIO_AUTENTICADO", {
          rol: "pasajero",
          identificacion: est.identificacion,
          nombre: est.nombre
        });
        return {
          rol: "pasajero",
          identificacion: est.identificacion,
          nombre: est.nombre,
          correo: est.correoInstitucional,
          telefono: est.telefono,
          detalle: `${est.carrera} · ${est.codigoEstudiantil}`
        };
      }
      if (rolPreferido === "pasajero") {
        throw new Error(`No existe un estudiante registrado con '${identificador}'.`);
      }
    }

    const mot = buscarMot();
    if (mot) {
      if (password !== undefined && !mot.verificarPassword(password)) {
        throw new Error("Contraseña incorrecta.");
      }
      const moto = mot.obtenerMotoActiva();
      this.emitirEvento("USUARIO_AUTENTICADO", {
        rol: "motorista",
        identificacion: mot.identificacion,
        nombre: mot.nombre
      });
      return {
        rol: "motorista",
        identificacion: mot.identificacion,
        nombre: mot.nombre,
        correo: mot.correoInstitucional,
        telefono: mot.telefono,
        detalle: moto ? `${moto.marca} ${moto.modelo} · Placa ${moto.placa}` : "Motorista TucanGo"
      };
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

    this.persistir();
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
      rumbo = TucanGoFacade.calcularRumbo(
        actualLat,
        actualLng,
        sectorOrigen.coordenada.latitud,
        sectorOrigen.coordenada.longitud
      );
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
}
