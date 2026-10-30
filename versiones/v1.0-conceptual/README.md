# TucanGo — Movilidad estudiantil segura en el campus

**TucanGo** es un proyecto académico de **Lógica & Algoritmos II** (Universidad de la
Amazonia, Ingeniería de Sistemas) que aplica Programación Orientada a Objetos en
Java para modelar una solución a una problemática real del entorno universitario.

## Idea del proyecto

El transporte informal en motocicleta (mototaxis) es una práctica común entre los
estudiantes para ir y volver del campus, pero opera **sin ningún control**: no hay
registro de quién conduce, no hay tarifa definida y no hay forma de saber si un
viaje fue seguro. El riesgo percibido es mayor para las estudiantes mujeres, y los
motoristas trabajan sin ingreso estable ni respaldo.

**TucanGo** propone entrelazar estos dos mundos — la universidad y el transporte
informal — mediante un modelo de **confianza y trazabilidad**:

- **Seguridad para el estudiante:** cada viaje queda registrado (quién conduce, de
  dónde a dónde, y confirmación de llegada), y se puede calificar el servicio.
- **Formalización para el motorista:** trabaja sobre motoristas previamente
  **verificados** (identificación, placa y SOAT vigente), con "clientes" asegurados
  y **pagos justos** registrados.
- **Bienestar universitario:** la Universidad actúa como garante de bienestar dentro
  de su ámbito (verificación y control interno), sin habilitar transporte público.

> **Encuadre responsable:** el sistema se plantea como una capa de seguridad y
> confianza sobre motoristas verificados dentro del ámbito del campus. No habilita
> ni legaliza el transporte público de pasajeros en moto (actividad no permitida a
> nivel nacional); se concentra en lo que la Universidad sí puede controlar:
> verificación, trazabilidad, reputación y pago.

## Equipo

Somos **4 integrantes**. Los nombres quedan pendientes de confirmar:

| # | Nombre completo | Código estudiantil | Rol |
|---|-----------------|--------------------|-----|
| 1 | _(pendiente)_   | _(pendiente)_      | _(pendiente)_ |
| 2 | _(pendiente)_   | _(pendiente)_      | _(pendiente)_ |
| 3 | _(pendiente)_   | _(pendiente)_      | _(pendiente)_ |
| 4 | _(pendiente)_   | _(pendiente)_      | _(pendiente)_ |

## Documentación

- **Modelo conceptual (Guía 2):** [`docs/modelo-conceptual.md`](docs/modelo-conceptual.md)
  — Bitácora de Empatía, análisis señal/ruido, las 5 clases del dominio
  (`Estudiante`, `Motorista`, `Viaje`, `Calificacion`, `Pago`), asociaciones,
  multiplicidades y el diagrama UML v1.0.
- **Material del curso (guías):** `Docs/`
- **Especificación (SDD):** `openspec/`
- **Gestión de tareas del equipo:** `Gestion_Tareas_Equipo_LogicaII.xlsx`

## Stack técnico

| Aspecto | Valor |
|---------|-------|
| Lenguaje | Java (POO) |
| JDK | 21 (Microsoft OpenJDK) |
| IDE | Apache NetBeans |
| Build | Apache Ant (Java with Ant) |
| Versión | `master` |

## Estructura del repositorio

```
.
├── .gitignore                        # Reglas de control de versiones
├── README.md                         # Este documento
├── Docs/                             # Guías del curso (PDF)
├── docs/                             # Documentos del proyecto (modelo conceptual)
├── openspec/                         # Especificación del proyecto (SDD)
├── Gestion_Tareas_Equipo_LogicaII.xlsx
└── src/
    └── co/edu/uniamazonia/logica2/
        ├── Main.java                 # Punto de entrada (demo)
        └── modelo/
            └── SensorAmbiental.java  # Plantilla de referencia (ejemplo de la Guía 1)
```

> **Nota:** `SensorAmbiental` es una **plantilla de ejemplo** de la Guía 1 que ilustra
> los estándares de codificación; no corresponde al dominio real del proyecto. Las
> entidades definitivas (`Estudiante`, `Motorista`, `Viaje`, `Calificacion`, `Pago`)
> se modelan en [`docs/modelo-conceptual.md`](docs/modelo-conceptual.md).

## Arquitectura en capas (futura implementación)

| Capa | Paquete | Responsabilidad | Estado |
|------|---------|-----------------|--------|
| `modelo` | `co.edu.uniamazonia.logica2.modelo` | Entidades del dominio del problema | Creada ahora |
| `servicio` | `co.edu.uniamazonia.logica2.servicio` | Lógica de negocio | Futura |
| `persistencia` | `co.edu.uniamazonia.logica2.persistencia` | Acceso a datos | Futura |
| `vista` | `co.edu.uniamazonia.logica2.vista` | Presentación / consola | Futura |
| `util` | `co.edu.uniamazonia.logica2.util` | Helpers transversales | Futura |

## Convenciones de codificación (estándares del curso)

| Elemento | Regla | Ejemplo |
|----------|-------|---------|
| Clase | Sustantivo en singular, UpperCamelCase | `Motorista`, `Viaje` |
| Atributo | `private`, lowerCamelCase | `private String placa;` |
| Método | `public`, verbo en infinitivo, lowerCamelCase | `aceptarViaje()`, `calcularTarifa()` |
| Tipos | Coherentes con el dato | `String`, `int`, `double`, `boolean` |
| Encapsulamiento | Atributos privados + getters/setters | `getTarifa()` / `setTarifa(...)` |

Notas:

- Para atributos `boolean`, el getter se nombra con `is` (convención JavaBeans):
  `isSoatVigente()` en lugar de `getSoatVigente()`.
- Los comentarios Javadoc se escriben en español, sin jerga regional.

## Roadmap

- [ ] Confirmar los 4 integrantes del equipo y completar la tabla.
- [ ] Traducir el modelo conceptual (5 clases) a código Java del dominio.
- [ ] Agregar la capa `servicio` con la lógica de negocio.
- [ ] Agregar la capa `persistencia` para guardar/cargar datos.
- [ ] Conectar la capa `vista` (menú por consola).
- [ ] Incorporar JUnit para pruebas unitarias.
