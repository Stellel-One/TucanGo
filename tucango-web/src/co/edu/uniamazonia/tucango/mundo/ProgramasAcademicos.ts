/**
 * Oferta oficial de pregrado de la Universidad de la Amazonia.
 *
 * Fuente: portal institucional, sección Programas > Pregrado
 * https://www.uniamazonia.edu.co/inicio/index.php/es/programas/pregrado.html
 * Consultada en noviembre de 2026.
 *
 * La lista vive en el dominio porque el programa académico es un dato
 * institucional validado, no una etiqueta libre que el usuario invente.
 */

export type ModalidadPrograma = "Presencial" | "A distancia";

export interface ProgramaAcademico {
  readonly nombre: string;
  readonly facultad: string;
  readonly modalidad: ModalidadPrograma;
}

export const PROGRAMAS_ACADEMICOS: readonly ProgramaAcademico[] = [
  // Facultad de Ciencias Agropecuarias
  {
    nombre: "Medicina Veterinaria y Zootecnia",
    facultad: "Ciencias Agropecuarias",
    modalidad: "Presencial"
  },

  // Facultad de Ciencias Básicas
  { nombre: "Biología", facultad: "Ciencias Básicas", modalidad: "Presencial" },
  { nombre: "Química", facultad: "Ciencias Básicas", modalidad: "Presencial" },

  // Facultad de Ciencias Contables, Económicas y Administrativas
  {
    nombre: "Administración de Empresas",
    facultad: "Ciencias Contables, Económicas y Administrativas",
    modalidad: "Presencial"
  },
  {
    nombre: "Contaduría Pública",
    facultad: "Ciencias Contables, Económicas y Administrativas",
    modalidad: "Presencial"
  },

  // Facultad de Ciencias de la Educación
  {
    nombre: "Licenciatura en Ciencias Sociales",
    facultad: "Ciencias de la Educación",
    modalidad: "Presencial"
  },
  {
    nombre: "Licenciatura en Educación Artística",
    facultad: "Ciencias de la Educación",
    modalidad: "Presencial"
  },
  {
    nombre: "Licenciatura en Educación Física, Deportes y Recreación",
    facultad: "Ciencias de la Educación",
    modalidad: "Presencial"
  },
  {
    nombre: "Licenciatura en Lenguas Extranjeras con Énfasis en Inglés",
    facultad: "Ciencias de la Educación",
    modalidad: "Presencial"
  },
  {
    nombre: "Licenciatura en Literatura y Lengua Castellana",
    facultad: "Ciencias de la Educación",
    modalidad: "Presencial"
  },
  {
    nombre: "Licenciatura en Matemáticas",
    facultad: "Ciencias de la Educación",
    modalidad: "Presencial"
  },

  // Facultad de Derecho
  { nombre: "Derecho (Caquetá)", facultad: "Derecho", modalidad: "Presencial" },
  { nombre: "Derecho (Guaviare)", facultad: "Derecho", modalidad: "Presencial" },

  // Facultad de Ingeniería
  {
    nombre: "Ingeniería Agroecológica (Caquetá)",
    facultad: "Ingeniería",
    modalidad: "Presencial"
  },
  {
    nombre: "Ingeniería Agroecológica (Guaviare)",
    facultad: "Ingeniería",
    modalidad: "Presencial"
  },
  {
    nombre: "Ingeniería Agroecológica (Putumayo)",
    facultad: "Ingeniería",
    modalidad: "Presencial"
  },
  { nombre: "Ingeniería de Sistemas", facultad: "Ingeniería", modalidad: "Presencial" },
  { nombre: "Ingeniería de Alimentos", facultad: "Ingeniería", modalidad: "Presencial" },

  // Facultad de Ciencias de la Salud
  { nombre: "Enfermería", facultad: "Ciencias de la Salud", modalidad: "Presencial" },
  { nombre: "Psicología", facultad: "Ciencias de la Salud", modalidad: "Presencial" },

  // Educación a Distancia
  {
    nombre: "Tecnología en Criminalística",
    facultad: "Educación a Distancia",
    modalidad: "A distancia"
  },
  {
    nombre: "Administración Financiera",
    facultad: "Educación a Distancia",
    modalidad: "A distancia"
  },
  {
    nombre: "Licenciatura en Educación Infantil",
    facultad: "Educación a Distancia",
    modalidad: "A distancia"
  },
  { nombre: "Mercadeo", facultad: "Educación a Distancia", modalidad: "A distancia" }
];

const NOMBRES_VALIDOS = new Set(
  PROGRAMAS_ACADEMICOS.map((programa) => programa.nombre.toLowerCase())
);

export function esProgramaAcademicoValido(nombre: string): boolean {
  return NOMBRES_VALIDOS.has((nombre || "").trim().toLowerCase());
}

export function agruparProgramasPorFacultad(): Array<{
  facultad: string;
  programas: ProgramaAcademico[];
}> {
  const grupos = new Map<string, ProgramaAcademico[]>();
  for (const programa of PROGRAMAS_ACADEMICOS) {
    const lista = grupos.get(programa.facultad) || [];
    lista.push(programa);
    grupos.set(programa.facultad, lista);
  }
  return Array.from(grupos.entries()).map(([facultad, programas]) => ({
    facultad,
    programas
  }));
}
