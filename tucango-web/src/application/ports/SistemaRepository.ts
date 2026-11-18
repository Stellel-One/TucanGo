import type { MetodoPago, EstadoPago } from "../../domain/model/Pago.ts";

export interface AdministradorSnapshot {
  identificacion: string;
  nombre: string;
  telefono: string;
  correoInstitucional: string;
  cargo: string;
  passwordHash: string;
  debeCambiarPassword?: boolean;
}

export interface EstudianteSnapshot {
  identificacion: string;
  nombre: string;
  telefono: string;
  correoInstitucional: string;
  codigoEstudiantil: string;
  carrera: string;
  passwordHash?: string;
  debeCambiarPassword?: boolean;
}

export interface MotoSnapshot {
  placa: string;
  marca: string;
  modelo: string;
  cilindraje: number;
  activa: boolean;
  soatVigente: boolean;
  numeroSoat: string;
}

export interface MotoristaSnapshot {
  identificacion: string;
  nombre: string;
  telefono: string;
  correoInstitucional: string;
  disponible: boolean;
  latitud?: number;
  longitud?: number;
  direccionGrados?: number;
  passwordHash?: string;
  debeCambiarPassword?: boolean;
  estadoAprobacion?: "PENDIENTE_APROBACION" | "ACTIVO" | "RECHAZADO";
  fotoRostroUrl?: string;
  fotoMotoUrl?: string;
  fotoSoatUrl?: string;
  fotoLicenciaUrl?: string;
  compromisoAceptado?: boolean;
  motivoRechazo?: string;
  fechaAprobacion?: string;
  correoBienvenidaEnviado?: boolean;
  motos: MotoSnapshot[];
}

export interface NotificacionCorreoSnapshot {
  id: string;
  destinatario: string;
  asunto: string;
  mensajeHtml: string;
  enviadoEn: string;
  tipo: "BIENVENIDA_TUCAN" | "RECHAZO_TUCAN" | "GENERAL";
}

export interface CalificacionSnapshot {
  puntuacion: number;
  comentario: string;
  autorIdentificacion: string;
}

export interface ViajeSnapshot {
  codigoViaje: string;
  estudianteId: string;
  motoristaId?: string;
  origen: string;
  destino: string;
  distanciaKm: number;
  estrategiaNombre: string;
  tarifa: number;
  estadoNombre: string;
  motivoCancelacion?: string;
  fechaCreacion: string;
  llegadaSeguraConfirmada: boolean;
  fechaLlegadaSegura?: string;
  pinSeguridad?: string;
  progresoRuta?: number;
  etapaTracking?: string;
  ubicacionMotoristaLat?: number;
  ubicacionMotoristaLng?: number;
  direccionMotoristaGrados?: number;
  pago: {
    monto: number;
    metodo: MetodoPago;
    estado: EstadoPago;
    fechaPago?: string;
  };
  calificaciones: CalificacionSnapshot[];
}

export interface EstadoSistemaSnapshot {
  contadorViajes: number;
  administradores?: AdministradorSnapshot[];
  estudiantes: EstudianteSnapshot[];
  motoristas: MotoristaSnapshot[];
  viajes: ViajeSnapshot[];
  notificacionesCorreo?: NotificacionCorreoSnapshot[];
}

export interface SistemaRepository {
  cargar(): EstadoSistemaSnapshot | null;
  guardar(snapshot: EstadoSistemaSnapshot): void;
  revocarSesion?(jti: string, expiraEnMs: number): void;
  estaSesionRevocada?(jti: string): boolean;
  limpiarSesionesExpiradas?(): void;
}
