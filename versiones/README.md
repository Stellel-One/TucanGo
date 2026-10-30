# 📁 Directorio de Versiones Aisladas — TucanGo

Cada versión histórica del proyecto se encuentra completamente aislada y autocontenida como un **proyecto nativo de Apache NetBeans con Apache Ant**, compatible con JDK 17 y JDK 21.

---

## 🗂️ Versiones Disponibles

| Carpeta | Nombre del Proyecto | Descripción | Clase Principal / Target |
| :--- | :--- | :--- | :--- |
| [`v1.0-conceptual/`](v1.0-conceptual/) | `TucanGo-v1.0-Conceptual` | Modelo conceptual inicial y análisis lingüístico (Guía 1 y 2). | `co.edu.uniamazonia.logica2.Main` |
| [`v2.0-dominio-base/`](v2.0-dominio-base/) | `TucanGo-v2.0-DominioBase` | Primer modelo POO en Java con las 5 clases centrales. | `co.edu.uniamazonia.logica2.DemoTucanGo` |
| [`v5.0-dominio-estable/`](v5.0-dominio-estable/) | `TucanGo-v5.0-DominioEstable` | Arquitectura consolidada con servicios y 36 tests JUnit 5. | `co.edu.uniamazonia.logica2.PrototipoInteractivo` |
| [`v5.1-simulador-uber/`](v5.1-simulador-uber/) | `TucanGo-v5.1-SimuladorUber` | Simulador interactivo en terminal estilo Uber/DiDi. | `co.edu.uniamazonia.logica2.SimuladorUberCampus` |

---

## 🚀 Cómo Abrir y Ejecutar en Apache NetBeans

1. En NetBeans, ve a **File** $\rightarrow$ **Open Project...** (Ctrl + Shift + O).
2. Navega a `c:\Dev-Stellel\TucanGo\versiones\` y selecciona la versión deseada (o todas a la vez).
3. Presiona **F6** (*Run Project*) para ejecutar el programa en la consola de NetBeans.
4. Presiona **Alt + F6** (*Test Project*) en las versiones con suite JUnit 5 para correr las pruebas.

---

## ⚙️ Ejecución por Terminal con Apache Ant

```bash
# Ejemplo: compilar y ejecutar v5.1
cd versiones/v5.1-simulador-uber
ant run

# Ejecutar pruebas unitarias
ant test
```
