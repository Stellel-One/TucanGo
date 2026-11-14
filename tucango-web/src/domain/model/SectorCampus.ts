import { Coordenada } from "./Coordenada.ts";

export class SectorCampus {
  private readonly _id: string;
  private readonly _nombre: string;
  private readonly _referencia: string;
  private readonly _coordenada: Coordenada;
  private readonly _esCampusUniamazonia: boolean;

  constructor(
    id: string,
    nombre: string,
    referencia: string,
    coordenada: Coordenada,
    esCampusUniamazonia: boolean
  ) {
    if (!id || id.trim().length === 0) {
      throw new Error("El identificador del sector es obligatorio.");
    }
    if (!nombre || nombre.trim().length === 0) {
      throw new Error("El nombre del sector es obligatorio.");
    }

    this._id = id.trim().toUpperCase();
    this._nombre = nombre.trim();
    this._referencia = (referencia || "").trim();
    this._coordenada = coordenada;
    this._esCampusUniamazonia = esCampusUniamazonia;
  }

  public get id(): string {
    return this._id;
  }

  public get nombre(): string {
    return this._nombre;
  }

  public get referencia(): string {
    return this._referencia;
  }

  public get coordenada(): Coordenada {
    return this._coordenada;
  }

  public get esCampusUniamazonia(): boolean {
    return this._esCampusUniamazonia;
  }
}

export const SECTORES_FLORENCIA: readonly SectorCampus[] = Object.freeze([
  new SectorCampus(
    "PORVENIR",
    "Campus Porvenir - Portería Principal",
    "Av. Circunvalar, Sede Principal Uniamazonia",
    new Coordenada(1.6203, -75.6042),
    true
  ),
  new SectorCampus(
    "CENTRO",
    "Sede Centro - Edificio Administrativo",
    "Calle 17 Carrera 10, Centro Florencia",
    new Coordenada(1.6142, -75.6126),
    true
  ),
  new SectorCampus(
    "BALCANES",
    "Granja Balcanes (Km 17)",
    "Vía Morelia - Centro Experimental Uniamazonia",
    new Coordenada(1.5415, -75.6612),
    true
  ),
  new SectorCampus(
    "LA_VEGA",
    "Barrio La Vega - Zona Estudiantil",
    "Corredor residencial nororiental, Florencia",
    new Coordenada(1.6238, -75.6121),
    false
  ),
  new SectorCampus(
    "TERMINAL",
    "Terminal de Transportes Florencia",
    "Av. Circunvalar Sur, Terminal Terrestre",
    new Coordenada(1.6079, -75.6054),
    false
  ),
  new SectorCampus(
    "PLAZA_PIZARRO",
    "Plaza Pizarro / Centro Comercial",
    "Parque Santander y zona financiera",
    new Coordenada(1.6149, -75.6169),
    false
  )
]);

export function buscarSectorPorId(id: string): SectorCampus | undefined {
  if (!id) return undefined;
  const normalizado = id.trim().toUpperCase();
  return SECTORES_FLORENCIA.find((sector) => sector.id === normalizado);
}
