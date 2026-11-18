import type { Viaje } from "./Viaje.ts";
import type { Motorista } from "../model/Motorista.ts";

export interface EstadoViaje {
  readonly nombre: string;
  solicitar(viaje: Viaje): void;
  aceptar(viaje: Viaje, motorista: Motorista): void;
  iniciar(viaje: Viaje): void;
  finalizar(viaje: Viaje): void;
  cancelar(viaje: Viaje, motivo: string): void;
}

export class EstadoSolicitado implements EstadoViaje {
  public readonly nombre = "SOLICITADO";

  public solicitar(_viaje: Viaje): void {
    throw new Error("El viaje ya se encuentra solicitado y en espera de motorista.");
  }

  public aceptar(viaje: Viaje, motorista: Motorista): void {
    if (motorista.estadoAprobacion !== "ACTIVO") {
      throw new Error(
        `El motorista ${motorista.nombre} aún no está aprobado para operar en TucanGo.`
      );
    }
    if (!motorista.disponible) {
      throw new Error(`El motorista ${motorista.nombre} no se encuentra disponible.`);
    }
    const moto = motorista.obtenerMotoActiva();
    if (!moto) {
      throw new Error(`El motorista ${motorista.nombre} no tiene una moto activa asignada.`);
    }
    if (!moto.soatVigente) {
      throw new Error(`La moto ${moto.placa} de ${motorista.nombre} no tiene SOAT vigente.`);
    }
    viaje.asignarMotorista(motorista);
    motorista.disponible = false;
    viaje.cambiarEstado(new EstadoAceptado());
  }

  public iniciar(_viaje: Viaje): void {
    throw new Error("No se puede iniciar un viaje sin antes ser aceptado por un motorista.");
  }

  public finalizar(_viaje: Viaje): void {
    throw new Error("No se puede finalizar un viaje que aún no ha iniciado.");
  }

  public cancelar(viaje: Viaje, motivo: string): void {
    viaje.registrarMotivoCancelacion(motivo);
    viaje.cambiarEstado(new EstadoCancelado());
  }
}

export class EstadoAceptado implements EstadoViaje {
  public readonly nombre = "ACEPTADO";

  public solicitar(_viaje: Viaje): void {
    throw new Error("El viaje ya fue aceptado por un motorista.");
  }

  public aceptar(_viaje: Viaje, _motorista: Motorista): void {
    throw new Error("El viaje ya tiene un motorista asignado.");
  }

  public iniciar(viaje: Viaje): void {
    viaje.cambiarEstado(new EstadoEnCurso());
  }

  public finalizar(_viaje: Viaje): void {
    throw new Error("El viaje debe iniciarse antes de poder finalizarse.");
  }

  public cancelar(viaje: Viaje, motivo: string): void {
    if (viaje.motorista) {
      viaje.motorista.disponible = true;
    }
    viaje.registrarMotivoCancelacion(motivo);
    viaje.cambiarEstado(new EstadoCancelado());
  }
}

export class EstadoEnCurso implements EstadoViaje {
  public readonly nombre = "EN_CURSO";

  public solicitar(_viaje: Viaje): void {
    throw new Error("El viaje está en curso.");
  }

  public aceptar(_viaje: Viaje, _motorista: Motorista): void {
    throw new Error("El viaje ya está en curso con un motorista en ruta.");
  }

  public iniciar(_viaje: Viaje): void {
    throw new Error("El viaje ya se encuentra en marcha.");
  }

  public finalizar(viaje: Viaje): void {
    if (viaje.motorista) {
      viaje.motorista.disponible = true;
    }
    viaje.pago.procesarPago();
    viaje.cambiarEstado(new EstadoFinalizado());
  }

  public cancelar(_viaje: Viaje, _motivo: string): void {
    throw new Error("No es seguro cancelar un viaje una vez que ya está en curso sobre la moto.");
  }
}

export class EstadoFinalizado implements EstadoViaje {
  public readonly nombre = "FINALIZADO";

  public solicitar(): void {
    throw new Error("El viaje ya fue completado exitosamente.");
  }

  public aceptar(): void {
    throw new Error("El viaje ya finalizó.");
  }

  public iniciar(): void {
    throw new Error("El viaje ya finalizó.");
  }

  public finalizar(): void {
    throw new Error("El viaje ya está finalizado.");
  }

  public cancelar(): void {
    throw new Error("No se puede cancelar un viaje que ya concluyó.");
  }
}

export class EstadoCancelado implements EstadoViaje {
  public readonly nombre = "CANCELADO";

  public solicitar(): void {
    throw new Error("El viaje fue cancelado.");
  }

  public aceptar(): void {
    throw new Error("No se puede aceptar un viaje cancelado.");
  }

  public iniciar(): void {
    throw new Error("No se puede iniciar un viaje cancelado.");
  }

  public finalizar(): void {
    throw new Error("No se puede finalizar un viaje cancelado.");
  }

  public cancelar(): void {
    throw new Error("El viaje ya se encuentra cancelado.");
  }
}
