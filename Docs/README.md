# 📚 Documentación Oficial & Material Académico — TucanGo

Este directorio reúne tanto los **documentos oficiales y diagramas UML del proyecto TucanGo** como el **material pedagógico oficial** del curso de **Lógica & Algoritmos II** (Universidad de la Amazonia), estructurado cronológicamente bajo las directrices del Ing. Yuber Arley Castro Grillo y los textos guía de Jorge Villalobos y Joyanes Aguilar.

---

## 🗂️ 1. Entregables y Diagramas de TucanGo (`Docs/`)

Cada archivo refleja una fase del proyecto vinculada directamente con una versión del software:

| Archivo | Fase / Versión Asociada | Descripción |
| :--- | :---: | :--- |
| [`PROY_DOC_ModeloConceptual_v1.0.md`](PROY_DOC_ModeloConceptual_v1.0.md) | **v0.1 / v1.0** (Semanas 1–2) | Bitácora de empatía, dolor real en el campus, separación señal/ruido y descubrimiento lingüístico. |
| [`PROY_UML_v1.0_Abstraccion_4Clases.md`](PROY_UML_v1.0_Abstraccion_4Clases.md) | **v1.0** (Semana 2) | Diagrama UML preliminar (4 clases: `Estudiante`, `Motorista`, `Moto`, `Viaje`) modelado sin IDE. |
| [`PROY_UML_v2.0_Encapsulamiento_Invariantes.md`](PROY_UML_v2.0_Encapsulamiento_Invariantes.md) | **v2.0** (Semana 3) | Diagrama UML con encapsulamiento estricto, regla de oro OMG, `Pago` y `Calificacion`. |
| [`PROY_DOC_Entregable1_TucanGo_Oficial_APA7.docx`](PROY_DOC_Entregable1_TucanGo_Oficial_APA7.docx) | **v2.5** (Semana 4) | **Documento oficial radicado** en formato APA 7ma Edición (1er Entregable del Proyecto - 10%). |
| [`PROY_SLIDES_Sustentacion_Entregable1.md`](PROY_SLIDES_Sustentacion_Entregable1.md) | **v2.5** (Semana 4) | Diapositivas en Markdown/Marp para la sustentación oral (10 min). También en [PDF](PROY_SLIDES_Sustentacion_Entregable1.pdf) y [PPTX](PROY_SLIDES_Sustentacion_Entregable1.pptx). |
| [`PROY_UML_v3.0_FlotaDinamica_ArrayList.md`](PROY_UML_v3.0_FlotaDinamica_ArrayList.md) | **v3.0** (Semanas 5–6) | Diagrama UML con multiplicidad `1..*` (flota multi-moto y listas de viajes en `ArrayList`). [Ver PNG](PROY_UML_v3.0_FlotaDinamica_ArrayList.png). |
| [`PROY_MEMORIA_Orquestacion_MultiAgente.md`](PROY_MEMORIA_Orquestacion_MultiAgente.md) | **v3.0** (Semana 6) | Memoria técnica de refinamiento arquitectónico con ciclo multi-agente de ingeniería. |
| [`PROY_UML_v5.0_ArquitecturaConsolidada_Definitiva.md`](PROY_UML_v5.0_ArquitecturaConsolidada_Definitiva.md) | **v5.0** (Semana 10+) | **Diagrama UML consolidado definitivo** con herencia polimórfica `Persona`, RBAC y servicios. [Ver PNG](PROY_UML_v5.0_ArquitecturaConsolidada_Definitiva.png). |

---

## 📖 2. Material Pedagógico y Curricular (`Docs/material-academico/`)

Estructurado con la convención `SEM[Semana]_` para guías y presentaciones, y `REF_` para literatura técnica:

### 📅 Semanas de Cátedra (Plan Oficial)
- **Syllabus & Cierre:**
  - [`SEM00_SYLLABUS_AcuerdoPedagogico_LogicaII.docx`](material-academico/SEM00_SYLLABUS_AcuerdoPedagogico_LogicaII.docx): Acuerdo pedagógico oficial firmado (ponderaciones: 70% seguimiento, 30% cierre).
  - [`SEM00_SLIDES_Presentacion_Metodologia_Evaluacion.pdf`](material-academico/SEM00_SLIDES_Presentacion_Metodologia_Evaluacion.pdf): Reglas de juego, crisis del software y Manifiesto del Programador.
- **Semana 1 (El Salto a los Objetos & Empatía):**
  - [`SEM01_SLIDES_ElSaltoALosObjetos_DesignThinking.pdf`](material-academico/SEM01_SLIDES_ElSaltoALosObjetos_DesignThinking.pdf): De la programación estructurada a objetos.
  - [`SEM01_GUIA_TallerEmpatia_AbstraccionJava.pdf`](material-academico/SEM01_GUIA_TallerEmpatia_AbstraccionJava.pdf): Taller de campo y formato oficial de Bitácora de Empatía.
- **Semana 2 (El Arte de Abstraer):**
  - [`SEM02_SLIDES_ArteAbstraccion_UML_Notacion.pdf`](material-academico/SEM02_SLIDES_ArteAbstraccion_UML_Notacion.pdf): Estándares de clases y notación UML Nivel 1.
  - [`SEM02_SLIDES_MundoProblema_DescubrimientoLinguistico.pdf`](material-academico/SEM02_SLIDES_MundoProblema_DescubrimientoLinguistico.pdf): Señal vs. Ruido y análisis gramatical (sustantivos $\rightarrow$ clases, verbos $\rightarrow$ métodos).
- **Semana 3 (Relaciones & Encapsulamiento):**
  - [`SEM03_SLIDES_EcosistemasDigitales_RelacionesUML.pdf`](material-academico/SEM03_SLIDES_EcosistemasDigitales_RelacionesUML.pdf): Asociación, agregación, composición y Regla de Oro OMG.
  - [`SEM03_GUIA_Encapsulamiento_Invariantes_Clase.pdf`](material-academico/SEM03_GUIA_Encapsulamiento_Invariantes_Clase.pdf): Ocultamiento de información, constructores Fail-Fast y preservación de invariantes.
- **Semana 4 (Entregable 1 & Parcial 1):**
  - [`SEM04_FORMATO_Entregable1_Proyecto_APA7.docx`](material-academico/SEM04_FORMATO_Entregable1_Proyecto_APA7.docx): Plantilla institucional APA 7ma para la Entrega 1.
- **Semanas 5 y 6 (Colecciones `ArrayList` y Algoritmos):**
  - [`SEM05_GUIA_ColeccionesDinamicas_ArrayList.pdf`](material-academico/SEM05_GUIA_ColeccionesDinamicas_ArrayList.pdf): Estructuras fijas vs dinámicas y traducción de `1..*`.
  - [`SEM06_TALLER_AlgoritmosColecciones_5Retos.pdf`](material-academico/SEM06_TALLER_AlgoritmosColecciones_5Retos.pdf): Retos de captura, búsqueda lineal, control de duplicados y métricas.
- **Semana 10 (Reto del Arquitecto):**
  - [`SEM10_GUIA_RetoArquitecto_Mantenimiento_Evolucion.pdf`](material-academico/SEM10_GUIA_RetoArquitecto_Mantenimiento_Evolucion.pdf): Mantenimiento de código legado, excepciones de negocio y desacoplamiento.

### 📚 Libros y Proyectos de Referencia (`REF_`)
- [`REF_LIBRO_Villalobos_AprendizajeActivoCasos.pdf`](material-academico/REF_LIBRO_Villalobos_AprendizajeActivoCasos.pdf): *Fundamentos de programación* (Jorge Villalobos & Rubby Casallas). Texto guía rector.
- [`REF_CAP01_Villalobos_MundoDelProblema.pdf`](material-academico/REF_CAP01_Villalobos_MundoDelProblema.pdf): Capítulo 1: Modelado de clases y el Mundo del Problema.
- [`REF_LIBRO_Bhargava_GrokkingAlgorithms_2daEd.pdf`](material-academico/REF_LIBRO_Bhargava_GrokkingAlgorithms_2daEd.pdf): Referencia visual de algoritmos y estructuras.
- [`REF_CODE_TiendaBase_FacturacionSimple.zip`](material-academico/REF_CODE_TiendaBase_FacturacionSimple.zip): Proyecto NetBeans de facturación elemental.
- [`REF_CODE_TiendaAmazonica_Completa_Swing.zip`](material-academico/REF_CODE_TiendaAmazonica_Completa_Swing.zip): Caso de estudio completo con excepciones y GUI Swing.
