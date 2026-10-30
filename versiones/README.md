# 🗂️ Versiones Pedagógicas Incrementales de TucanGo (Semanas 1 a 10+)

Este directorio contiene la **evolución progresiva de TucanGo** a lo largo del semestre de **Lógica & Algoritmos II** en la Universidad de la Amazonia. Cada carpeta es un **proyecto nativo e independiente de Apache NetBeans con Apache Ant**, listo para abrir, compilar y ejecutar en consola.

---

## 🚀 Matriz de Versiones y Progresión Temática

| Carpeta | Proyecto NetBeans | Hito Pedagógico | Resumen de Dominio en TucanGo | Comando Ant |
| :--- | :--- | :---: | :--- | :---: |
| [`v0.1-sem01-clase-aislada/`](v0.1-sem01-clase-aislada/) | `TucanGo-v0.1-Sem01-ClaseAislada` | **Semana 1** | **El Salto a los Objetos:** 1 clase aislada (`ViajeCampus`) modelando el dolor real del campus con atributos privados y métodos esenciales. | `ant run` |
| [`v1.0-sem02-abstraccion-4clases/`](v1.0-sem02-abstraccion-4clases/) | `TucanGo-v1.0-Sem02-Abstraccion4Clases` | **Semana 2** | **Mundo del Problema (4 clases):** Separación señal/ruido. Colaboración entre `Estudiante`, `Motorista`, `Moto` y `Viaje`. | `ant run` |
| [`v2.0-sem03-encapsulamiento-pagos/`](v2.0-sem03-encapsulamiento-pagos/) | `TucanGo-v2.0-Sem03-EncapsulamientoPagos` | **Semana 3** | **Encapsulamiento & Regla de Oro:** Validaciones Fail-Fast en constructores, `Pago` de confianza mutua (Efectivo/Nequi) y `Calificacion` (1.0–5.0). | `ant run` |
| [`v2.5-sem04-entregable1-oficial/`](v2.5-sem04-entregable1-oficial/) | `TucanGo-v2.5-Sem04-Entregable1Oficial` | **Semana 4** | **Primer Entregable Oficial (APA 7ma):** Paquetes `modelo` y `servicio` (`ServicioAutenticacion`, `ServicioReportes`) correspondientes al documento radicado. | `ant run` |
| [`v3.0-sem05-colecciones-arraylist/`](v3.0-sem05-colecciones-arraylist/) | `TucanGo-v3.0-Sem05-ColeccionesArrayList` | **Semanas 5–6** | **Colecciones Dinámicas:** `ArrayList<Moto>` multi-moto en `Motorista`, historial de viajes y algoritmos de búsqueda y métricas. | `ant run` |
| [`v3.5-sem07-fachada-tucangosistema/`](v3.5-sem07-fachada-tucangosistema/) | `TucanGo-v3.5-Sem07-FachadaTucanGoSistema` | **Semanas 7–8** | **Clase Controladora de Fachada (Patrón Villalobos):** `TucanGoSistema` centraliza la orquestación del negocio y cálculo de ingresos. | `ant run` |
| [`v4.0-sem09-herencia-persona/`](v4.0-sem09-herencia-persona/) | `TucanGo-v4.0-Sem09-HerenciaPersona` | **Semana 9** | **Herencia y Generalización:** Superclase abstracta `Persona` extendida por `Estudiante`, `Motorista` y `Administrador` (`RolAdmin`). | `ant run` |
| [`v5.0-sem10-arquitectura-consolidada/`](v5.0-sem10-arquitectura-consolidada/) | `TucanGo-v5.0-Sem10-ArquitecturaConsolidada` | **Semana 10+** | **Arquitectura Consolidada & Testing:** Excepciones de negocio, métricas analíticas, **36 tests JUnit 5** y simulador interactivo estilo Uber/DiDi. | `ant test`<br>`ant run` |

---

## 🛠️ Cómo Abrir en Apache NetBeans

1. En NetBeans, ve al menú superior: **File** $\rightarrow$ **Open Project...** (o presiona `Ctrl + Shift + O`).
2. Entra a la carpeta `c:\Dev-Stellel\TucanGo\versiones\`.
3. Selecciona la versión que deseas inspeccionar o sustentar (puedes seleccionarlas todas a la vez).
4. Presiona **F6** (*Run Project*) o **Shift + F6** (*Run File*) para ejecutar el programa en la consola de NetBeans.
5. En `v5.0`, presiona **Alt + F6** (*Test Project*) para ejecutar los 36 tests unitarios automatizados.
