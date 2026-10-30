# Proposal: Implementación del Modelo de Dominio TucanGo (UML v5.0)

## 1. Contexto y Objetivos
Implementar la arquitectura completa de clases del sistema **TucanGo v5.0** (Semana 3 / Lógica y Algoritmos II - Universidad de la Amazonia) bajo el paquete `co.edu.uniamazonia.logica2`.

## 2. Alcance de Entidades y Servicios a Implementar
1. **Enumeraciones (`modelo/`):**
   - `EstadoViaje` (`SOLICITADO`, `ACEPTADO`, `EN_CURSO`, `FINALIZADO`, `CANCELADO`)
   - `MetodoPago` (`EFECTIVO`, `NEQUI`)
   - `EstadoPago` (`PENDIENTE`, `PAGADO_REPORTADO`, `CONFIRMADO_RECIBIDO`)
   - `RolAdmin` (`DESARROLLADOR`, `BIENESTAR_UNIVERSITARIO`)

2. **Jerarquía `Persona` (`modelo/`):**
   - `Persona` (Clase base abstracta con `# identificacion`, `# nombre`, `# telefono`, `# correoInstitucional`, constructores y getters).
   - `Estudiante` (Hereda de `Persona`, añade `- codigoEstudiantil`, `solicitarViaje()`, `marcarLlegadaSegura()`).
   - `Motorista` (Hereda de `Persona`, añade `- disponible`, `ArrayList<Moto> motos`, `registrarMoto()`, `seleccionarMotoActiva()`, `aceptarViaje()`, etc.).
   - `Administrador` (Hereda de `Persona`, añade `- rol : RolAdmin`, `consultarReportesDemanda()`, `gestionarUsuarios()`).

3. **Módulo Vehículo (`modelo/`):**
   - `Moto` (`placa`, `marca`, `modelo`, `cilindraje`, `soatVigente`, `numeroSoat`, `activa`, `validarSoat()`).

4. **Transacción, Pago y Confianza (`modelo/`):**
   - `Viaje` (`codigoViaje`, `origen`, `destino`, `tarifa`, `estado`, `fechaHora`, `calcularTarifa()`, `iniciarViaje()`, `finalizarViaje()`, `cancelarViaje()`, referencias a `Pago` y lista `0..2` de `Calificacion`).
   - `Pago` (`valor`, `metodo`, `estado`, `pagadoPorEstudiante`, `confirmadoPorMotorista`, `reportarPagoEstudiante()`, `confirmarRecepcionMotorista()`).
   - `Calificacion` (`puntaje : Double` 1.0-5.0, `comentario`, `rolEmisor`, `fechaHora`, `registrarCalificacion()`, `obtenerPuntaje()`).

5. **Servicios (`servicio/` o `modelo/`):**
   - `ServicioAutenticacion` (`registrarse()`, `iniciarSesion()`, `cerrarSesion()`).
   - `ServicioReportes` (`obtenerDestinosMasFrecuentes()`, `consultarViajesPorDestino()`, `calcularPorcentajePorSector()`).

6. **Punto de Entrada (`Main.java`):**
   - Demostración interactiva en consola que ejecute el ciclo de vida completo: registro de estudiante y motorista con moto activa, solicitud de viaje desde el campus, aceptación, viaje en curso, reporte/confirmación de pago y calificación mutua.
