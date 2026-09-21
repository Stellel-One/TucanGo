# Memoria de Diseño: Orquestación Multi-Agente y Refinamiento UML v3.0

Fecha: 16 de Septiembre de 2026
Proyecto: TucanGo (Lógica y Algoritmos II - Univ. Amazonia)

---

## 1. Arquitectura de Orquestación 4-Agentes (Loop Engineering $0)

Diseño de ciclo cerrado de retroalimentación sin bloating de contexto y con costo $0 en generación:

```text
[1. Arquitecto: Claude Sonnet (Hermes)] 
       │  (Contrato técnico en openspec/)
       ▼
[2. QA Adversario: DeepSeek V4.1 Flash (Pi)]
       │  (Tests JUnit 5 agresivos en test/*Test.java)
       ▼
[3. Desarrollador: DeepSeek V4.1 Flash (OpenCode)]
       │  (Implementación Java en src/)
       ▼
[4. Filtro Crudo: Terminal / javac / JUnit]
       │  (Compilación y ejecución real)
       ▼
[5. Juez & Auditor: Claude Sonnet (agy / Herdr)]
       │  (Auditoría diff + veredicto APROBADO/RECHAZADO)
       └─── (Si falla, feedback al Dev / máx 3 iteraciones)
```

### Roles y Modelos:
1. **Arquitecto (`hermes` / `ag/claude-sonnet-4-6`):** Redacta `proposal.md`, `spec.md` y `tasks.md` en `openspec/`. Conciso, sin relleno.
2. **QA Adversario (`pi` / `deepseek-v4.1-flash:free` vía VansRouter):** Genera la batería de pruebas en JUnit 5 para romper el código antes de programar (TDD). Cero charla, 100% asserts y casos borde.
3. **Desarrollador (`opencode` / `deepseek-v4.1-flash:free` vía VansRouter):** Escribe el código Java en `co.edu.uniamazonia.logica2...` para pasar los tests.
4. **Juez / Auditor (`juez` en Herdr / `agy` con `ag/claude-sonnet-4-6`):** Compila en consola, audita `git diff` línea por línea y valida arquitectura POO.

---

## 2. Decisiones Pendientes para UML v3.0 (TucanGo)

Basado en las anotaciones del equipo y principios `pstack` (`principle-model-the-domain`):

1. **Módulo de Motos:**
   - Separar la clase `Moto` de `Motorista` (Principio de Responsabilidad Única - SRP).
   - Atributos propuestos: `placa`, `marca`, `modelo`, `cilindraje`, `soatVigente`, `numeroSoat`.
   - Relación: `Motorista "1" -- "1" Moto : conduce >`.

2. **Módulo de Pagos y Nequi:**
   - Modelado polimórfico propuesto:
     - Clase abstracta `Pago` (`idPago`, `monto`, `fechaHora`, `estado`).
     - Subclase `PagoNequi` (`numeroTelefono`, `referenciaTransferencia`).
     - Subclase `PagoEfectivo` (`montoRecibido`, `cambioDevuelto`).

3. **Separación de Usuario:**
   - Definir si se refiere a separación por paquetes (`usuarios`, `viajes`, `pagos`, `vehiculos`) o separación de lógica de sesión (`ServicioAutenticacion` vs entidad pura `Usuario`).

4. **Calificación:**
   - Definir si es unilateral (`Estudiante -> Motorista`) o bidireccional (`Estudiante <-> Motorista`).
