export class Coordenada {
  private readonly _latitud: number;
  private readonly _longitud: number;

  constructor(latitud: number, longitud: number) {
    if (!Number.isFinite(latitud) || latitud < -90 || latitud > 90) {
      throw new Error("La latitud debe estar entre -90 y 90 grados.");
    }
    if (!Number.isFinite(longitud) || longitud < -180 || longitud > 180) {
      throw new Error("La longitud debe estar entre -180 y 180 grados.");
    }

    this._latitud = latitud;
    this._longitud = longitud;
  }

  public get latitud(): number {
    return this._latitud;
  }

  public get longitud(): number {
    return this._longitud;
  }

  public distanciaKmHacia(destino: Coordenada): number {
    if (this._latitud === destino.latitud && this._longitud === destino.longitud) {
      return 0;
    }

    const RADIO_TIERRA_KM = 6371;
    const dLat = Coordenada.aRadianes(destino.latitud - this._latitud);
    const dLon = Coordenada.aRadianes(destino.longitud - this._longitud);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(Coordenada.aRadianes(this._latitud)) *
        Math.cos(Coordenada.aRadianes(destino.latitud)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = RADIO_TIERRA_KM * c;

    return Math.round(distancia * 100) / 100;
  }

  public rumboHacia(destino: Coordenada): number {
    if (this._latitud === destino.latitud && this._longitud === destino.longitud) {
      return 0;
    }
    const lat1 = Coordenada.aRadianes(this._latitud);
    const lat2 = Coordenada.aRadianes(destino.latitud);
    const dLon = Coordenada.aRadianes(destino.longitud - this._longitud);
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    return Math.round((((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360);
  }

  private static aRadianes(grados: number): number {
    return (grados * Math.PI) / 180;
  }
}
