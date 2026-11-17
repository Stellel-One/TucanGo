export type TipoEventoDominio =
  | "VIAJE_SOLICITADO"
  | "VIAJE_ACEPTADO"
  | "VIAJE_INICIADO"
  | "VIAJE_FINALIZADO"
  | "VIAJE_CANCELADO"
  | "VIAJE_CALIFICADO"
  | "LLEGADA_SEGURA_CONFIRMADA"
  | "ESTUDIANTE_REGISTRADO"
  | "MOTORISTA_REGISTRADO"
  | "USUARIO_AUTENTICADO"
  | "MOTORISTA_DISPONIBILIDAD_CAMBIADA"
  | "UBICACION_MOTORISTA_ACTUALIZADA"
  | "TRACKING_VIAJE_ACTUALIZADO";

export interface EventoDominio {
  tipo: TipoEventoDominio;
  timestamp: string;
  payload: Record<string, unknown>;
}

export type ListenerEventoDominio = (evento: EventoDominio) => void;

export class EventBus {
  private _suscriptores: Set<ListenerEventoDominio> = new Set();

  public suscribir(listener: ListenerEventoDominio): () => void {
    this._suscriptores.add(listener);
    return () => {
      this._suscriptores.delete(listener);
    };
  }

  public publicar(evento: EventoDominio): void {
    for (const listener of this._suscriptores) {
      try {
        listener(evento);
      } catch (err) {
        console.error("[EventBus] Error en suscriptor:", err);
      }
    }
  }
}
