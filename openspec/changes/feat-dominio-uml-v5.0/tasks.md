# Tasks: Implementación y Validación de TucanGo v5.0

## Tareas de Implementación (Orden TDD)

- [ ] **Fase 1: Estructura y Enumeraciones**
  - [ ] Crear paquete `co.edu.uniamazonia.logica2.modelo`
  - [ ] Crear enum `EstadoViaje.java`
  - [ ] Crear enum `MetodoPago.java`
  - [ ] Crear enum `EstadoPago.java`
  - [ ] Crear enum `RolAdmin.java`

- [ ] **Fase 2: Entidades del Dominio (POO Pura)**
  - [ ] Crear clase abstracta `Persona.java`
  - [ ] Crear subclase `Estudiante.java`
  - [ ] Crear subclase `Motorista.java` (soporte multi-moto con lista y selección activa)
  - [ ] Crear subclase `Administrador.java`
  - [ ] Crear clase `Moto.java`
  - [ ] Crear clase `Calificacion.java` (rango 1.0 - 5.0)
  - [ ] Crear clase `Pago.java` (reporte mutuo y confirmación)
  - [ ] Crear clase `Viaje.java` (asociaciones con Pago y lista 0..2 Calificacion)

- [ ] **Fase 3: Servicios del Sistema**
  - [ ] Crear clase `ServicioAutenticacion.java`
  - [ ] Crear clase `ServicioReportes.java`

- [ ] **Fase 4: Demostración y Ejecución**
  - [ ] Actualizar `Main.java` con el flujo universitario completo.

- [ ] **Fase 5: Verificación Cruda (Juez / Auditor)**
  - [ ] Compilar todas las clases con `javac -d bin src/**/*.java`
  - [ ] Ejecutar `java -cp bin co.edu.uniamazonia.logica2.Main` y capturar salida
  - [ ] Auditar `git diff` y certificar cumplimiento con UML v5.0.
