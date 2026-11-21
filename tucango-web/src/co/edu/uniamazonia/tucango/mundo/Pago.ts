import { ValidacionError } from "./ErroresAuth.ts";
export const MetodoPago = {
  EFECTIVO: "EFECTIVO",
  NEQUI: "NEQUI",
  DAVIPLATA: "DAVIPLATA"
} as const;

export type MetodoPago = (typeof MetodoPago)[keyof typeof MetodoPago];

export const EstadoPago = {
  PENDIENTE: "PENDIENTE",
  PAGADO: "PAGADO",
  CANCELADO: "CANCELADO"
} as const;

export type EstadoPago = (typeof EstadoPago)[keyof typeof EstadoPago];

export class Pago {
  private _monto: number;
  private _metodo: MetodoPago;
  private _estado: EstadoPago;
  private _fechaPago?: Date;

  constructor(monto: number, metodo: MetodoPago = MetodoPago.EFECTIVO) {
    if (!Number.isFinite(monto) || monto < 0) {
      throw new ValidacionError("El monto del pago debe ser un número no negativo.");
    }
    this._monto = monto;
    this._metodo = metodo;
    this._estado = EstadoPago.PENDIENTE;
  }

  public get monto(): number {
    return this._monto;
  }

  public get metodo(): MetodoPago {
    return this._metodo;
  }

  public get estado(): EstadoPago {
    return this._estado;
  }

  public get fechaPago(): Date | undefined {
    return this._fechaPago;
  }

  public procesarPago(): void {
    if (this._estado === EstadoPago.PAGADO) {
      throw new ValidacionError("El pago ya fue procesado anteriormente.");
    }
    this._estado = EstadoPago.PAGADO;
    this._fechaPago = new Date();
  }

  public cancelar(): void {
    this._estado = EstadoPago.CANCELADO;
  }

  public static reconstruir(
    monto: number,
    metodo: MetodoPago,
    estado: EstadoPago,
    fechaPago?: string
  ): Pago {
    const pago = new Pago(monto, metodo);
    pago._estado = estado;
    if (fechaPago) {
      pago._fechaPago = new Date(fechaPago);
    }
    return pago;
  }
}
