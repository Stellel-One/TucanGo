export interface EstrategiaTarifa {
  readonly nombre: string;
  readonly descripcion: string;
  calcular(distanciaKm: number, tarifaBase: number): number;
}

export class TarifaEstudiantilFija implements EstrategiaTarifa {
  public readonly nombre = "Tarifa Plana Estudiantil";
  public readonly descripcion = "Tarifa preferencial fija de campus ($2.500 COP) sin importar la distancia.";

  public calcular(_distanciaKm: number, _tarifaBase: number): number {
    return 2500;
  }
}

export class TarifaPorKilometro implements EstrategiaTarifa {
  public readonly nombre = "Tarifa Estándar por Distancia";
  public readonly descripcion = "Base inicial más $1.200 COP por cada kilómetro recorrido.";

  public calcular(distanciaKm: number, tarifaBase: number = 3000): number {
    const distancia = Math.max(1, distanciaKm);
    return Math.round(tarifaBase + distancia * 1200);
  }
}

export class TarifaDinamicaLluvia implements EstrategiaTarifa {
  public readonly nombre = "Tarifa Dinámica (Lluvia / Clima Florencia)";
  public readonly descripcion = "Recargo del 40% por condiciones climáticas adversas en la Amazonía.";

  public calcular(distanciaKm: number, tarifaBase: number = 3000): number {
    const costoBase = new TarifaPorKilometro().calcular(distanciaKm, tarifaBase);
    return Math.round(costoBase * 1.4);
  }
}

export class TarifaNocturna implements EstrategiaTarifa {
  public readonly nombre = "Tarifa Nocturna";
  public readonly descripcion = "Recargo nocturno seguro del 25% para salidas tarde de clase.";

  public calcular(distanciaKm: number, tarifaBase: number = 3000): number {
    const costoBase = new TarifaPorKilometro().calcular(distanciaKm, tarifaBase);
    return Math.round(costoBase * 1.25);
  }
}
