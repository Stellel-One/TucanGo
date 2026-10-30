# TucanGo — Guía de Desarrollo y Reglas de Agentes (pstack + SDD + YOLO)

Este proyecto utiliza **OpenSpec** (Spec-Driven Development), las disciplinas de ingeniería de **pstack** (`poteto-mode`) y opera en **Modo YOLO / Autonomía Total**.

## 1. Reglas de Autonomía Total (Modo YOLO)

- **Cero Bloqueo Humano (`principle-never-block-on-the-human`):** Ningún agente debe pedir confirmación interactiva para leer, escribir, compilar o ejecutar tests. Todas las operaciones en el repositorio están pre-autorizadas.
- **Auto-Evaluación y Verificación Continua:** Cada fase se valida internamente antes de pasar al siguiente agente. Si una prueba falla, el ejecutor reintenta y corrige autónomamente sin esperar órdenes manuales.

## 2. Disciplinas Obligatorias de Ingeniería (pstack)

- **Model the Domain (`principle-model-the-domain`):** Modela el dominio y sus invariantes antes de generar código. Entidades POO limpias con encapsulamiento estricto (`private`).
- **Test-Driven Development (`tdd` & `principle-test-behavior-not-implementation`):**
  - Escribe primero los tests unitarios en JUnit 5.
  - Prueba el **comportamiento** y los contratos, no los detalles internos de implementación.
  - Asegura cobertura de casos borde (nulos, vacíos, valores inválidos).
- **Verificación Cruda (`principle-prove-it-works`):**
  - Ningún código se considera listo sin compilación limpia (`javac`) y tests pasando al 100%.
- **Revisión Adversaria (`interrogate`):**
  - Audita el `git diff` línea por línea antes de cada commit o PR.
  - Cero código de relleno (*slop*), sin comentarios obvios ni código muerto.

## 3. Roles en la Arena Herdr (Multi-Agente)

1. **Arquitecto (Hermes):**
   - Define especificaciones en `openspec/changes/` (`proposal.md`, `spec.md`, `tasks.md`).
2. **QA Adversario (Pi / Gentle-Pi):**
   - Implementa tests unitarios agresivos en JUnit 5 (`*Test.java`).
3. **Desarrollador (OpenCode):**
   - Implementa clases de dominio bajo `src/co/edu/uniamazonia/logica2/modelo/` hasta poner los tests en verde.
4. **Juez / Auditor (agy / Gemini 3.8 Flash High):**
   - Compila en consola con `javac`, corre los tests en terminal cruda y audita el `git diff` emitiendo el veredicto final.
