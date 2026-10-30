# Tasks: Implementación y Validación de TucanGo v5.0

## Tareas de Implementación (Orden TDD)

- [x] **Fase 1: Estructura y Enumeraciones**
  - [x] Crear paquete `co.edu.uniamazonia.logica2.modelo`
  - [x] Crear enum `EstadoViaje.java`
  - [x] Crear enum `MetodoPago.java`
  - [x] Crear enum `EstadoPago.java`
  - [x] Crear enum `RolAdmin.java`

- [x] **Fase 2: Entidades del Dominio (POO Pura)**
  - [x] Crear clase abstracta `Persona.java`
  - [x] Crear subclase `Estudiante.java`
  - [x] Crear subclase `Motorista.java` (soporte multi-moto con lista y selección activa)
  - [x] Crear subclase `Administrador.java`
  - [x] Crear clase `Moto.java`
  - [x] Crear clase `Calificacion.java` (rango 1.0 - 5.0)
  - [x] Crear clase `Pago.java` (reporte mutuo y confirmación)
  - [x] Crear clase `Viaje.java` (asociaciones con Pago y lista 0..2 Calificacion)

- [x] **Fase 3: Servicios del Sistema**
  - [x] Crear clase `ServicioAutenticacion.java`
  - [x] Crear clase `ServicioReportes.java`

- [x] **Fase 4: Demostración y Ejecución**
  - [x] Actualizar `Main.java` con el flujo universitario completo.

- [x] **Fase 5: Verificación Cruda (Juez / Auditor)**
  - [x] Compilar todas las clases con `javac -d bin src/**/*.java`
  - [x] Ejecutar `java -cp bin co.edu.uniamazonia.logica2.Main` y capturar salida
  - [x] Auditar `git diff` y certificar cumplimiento con UML v5.0.

