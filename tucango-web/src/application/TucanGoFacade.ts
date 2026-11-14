import { Estudiante } from "../domain/model/Estudiante.ts";
import { Motorista } from "../domain/model/Motorista.ts";
import { Moto } from "../domain/model/Moto.ts";
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

export interface RegistrarEstudianteDTO {
  identificacion: string;
  nombre: string;
  telefono: string;
  correoInstitucional: string;
  codigoEstudiantil: string;
  carrera: string;
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

    return { origen, destino, distanciaKm, tiempoEstimadoMin };
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
        carrera: e.carrera
      })),
      motoristas: this.obtenerMotoristas().map((m) => ({
        identificacion: m.identificacion,
        nombre: m.nombre,
        telefono: m.telefono,
        correoInstitucional: m.correoInstitucional,
        disponible: m.disponible,
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
      this._estudiantes.set(est.identificacion, est);
    }

    for (const motSnap of snapshot.motoristas) {
      const mot = new Motorista(
        motSnap.identificacion,
        motSnap.nombre,
        motSnap.telefono,
        motSnap.correoInstitucional,
        motSnap.disponible
      );
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
    const est2 = new Estudiante(
      "1002",
      "Laura Gómez",
      "3127778899",
      "l.gomez@uniamazonia.edu.co",
      "EST-2024-045",
      "Medicina Veterinaria"
    );
    this._estudiantes.set(est1.identificacion, est1);
    this._estudiantes.set(est2.identificacion, est2);

    // 2 Motoristas con sus motos
    const mot1 = new Motorista(
      "2001",
      "Jhonatan 'El Tucán' Silva",
      "3201234567",
      "j.silva@uniamazonia.edu.co"
    );
    const moto1 = new Moto("GNX-45F", "Suzuki", "GN 125", 125, true);
    mot1.registrarMoto(moto1);

    const mot2 = new Motorista(
      "2002",
      "Diana Marcela Castro",
      "3109876543",
      "d.castro@uniamazonia.edu.co"
    );
    const moto2 = new Moto("TUK-89D", "Yamaha", "Crypton FI", 115, true);
    mot2.registrarMoto(moto2);

    this._motoristas.set(mot1.identificacion, mot1);
    this._motoristas.set(mot2.identificacion, mot2);
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
