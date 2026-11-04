export class Moto {
  private _placa: string;
  private _marca: string;
  private _modelo: string;
  private _cilindraje: number;
  private _activa: boolean;

  constructor(
    placa: string,
    marca: string,
    modelo: string,
    cilindraje: number,
    activa: boolean = false
  ) {
    if (!placa || placa.trim().length === 0) {
      throw new Error("La placa de la moto es obligatoria.");
    }
    if (!marca || marca.trim().length === 0) {
      throw new Error("La marca de la moto es obligatoria.");
    }
    if (cilindraje <= 0) {
      throw new Error("El cilindraje debe ser mayor a cero.");
    }

    this._placa = placa.trim().toUpperCase();
    this._marca = marca.trim();
    this._modelo = modelo.trim();
    this._cilindraje = cilindraje;
    this._activa = activa;
  }

  public get placa(): string {
    return this._placa;
  }

  public get marca(): string {
    return this._marca;
  }

  public get modelo(): string {
    return this._modelo;
  }

  public get cilindraje(): number {
    return this._cilindraje;
  }

  public get activa(): boolean {
    return this._activa;
  }

  public set activa(estado: boolean) {
    this._activa = estado;
  }

  public get descripcionCorta(): string {
    return `${this._marca} ${this._modelo} (${this._cilindraje}cc) - Placa: ${this._placa}`;
  }
}
