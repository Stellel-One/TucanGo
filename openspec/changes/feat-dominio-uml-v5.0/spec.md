# Spec: Modelo de Dominio TucanGo v5.0

## 1. Estándares Técnicos
- **Lenguaje:** Java 21 (JDK 21)
- **Paquete Base:** `co.edu.uniamazonia.logica2`
- **Encapsulamiento:** Estricto (`private` para atributos propios, `# protected` para atributos de la superclase `Persona`).
- **Nomenclatura:** camelCase para métodos/atributos, PascalCase para clases, UPPER_SNAKE_CASE para enumeraciones.
- **Validaciones e Invariantes:**
  - `Calificacion.puntaje` debe estar estrictamente en el rango `[1.0, 5.0]`.
  - `Moto.cilindraje` debe ser entero positivo (`> 0`).
  - `Viaje.tarifa` debe ser positiva (`>= 0`).

## 2. Definición de Clases

### 2.1 Enumeraciones
- `EstadoViaje`: `SOLICITADO`, `ACEPTADO`, `EN_CURSO`, `FINALIZADO`, `CANCELADO`.
- `MetodoPago`: `EFECTIVO`, `NEQUI`.
- `EstadoPago`: `PENDIENTE`, `PAGADO_REPORTADO`, `CONFIRMADO_RECIBIDO`.
- `RolAdmin`: `DESARROLLADOR`, `BIENESTAR_UNIVERSITARIO`.

### 2.2 Entidades
- `Persona` (abstract): `# identificacion : String`, `# nombre : String`, `# telefono : String`, `# correoInstitucional : String`.
- `Estudiante` extends `Persona`: `- codigoEstudiantil : String`, `solicitarViaje(origen, destino) : boolean`, `marcarLlegadaSegura(codigoViaje) : boolean`.
- `Motorista` extends `Persona`: `- disponible : boolean`, `- motos : List<Moto>`, `registrarMoto(moto)`, `seleccionarMotoActiva(placa)`, `obtenerMotoActiva() : Moto`, `aceptarViaje(codigoViaje) : boolean`, `registrarDisponibilidad(estado) : void`, `verificarDocumentos() : boolean`.
- `Administrador` extends `Persona`: `- rol : RolAdmin`, `consultarReportesDemanda() : void`, `gestionarUsuarios() : void`.
- `Moto`: `- placa : String`, `- marca : String`, `- modelo : String`, `- cilindraje : int`, `- soatVigente : boolean`, `- numeroSoat : String`, `- activa : boolean`, `validarSoat() : boolean`.
- `Viaje`: `- codigoViaje : String`, `- origen : String`, `- destino : String`, `- tarifa : double`, `- estado : EstadoViaje`, `- fechaHora : String`, `- pago : Pago`, `- calificaciones : List<Calificacion>`, `calcularTarifa() : double`, `iniciarViaje() : void`, `finalizarViaje() : void`, `cancelarViaje() : void`, `agregarCalificacion(calificacion) : void`.
- `Pago`: `- valor : double`, `- metodo : MetodoPago`, `- estado : EstadoPago`, `- pagadoPorEstudiante : boolean`, `- confirmadoPorMotorista : boolean`, `- fechaHora : String`, `reportarPagoEstudiante(metodo) : void`, `confirmarRecepcionMotorista() : boolean`.
- `Calificacion`: `- puntaje : double`, `- comentario : String`, `- rolEmisor : String`, `- fechaHora : String`, `registrarCalificacion(puntaje, comentario, emisor) : void`, `obtenerPuntaje() : double`.

### 2.3 Servicios
- `ServicioAutenticacion`: `registrarse(persona, clave) : boolean`, `iniciarSesion(correo, clave) : boolean`, `cerrarSesion(identificacion) : void`.
- `ServicioReportes`: `obtenerDestinosMasFrecuentes(limite) : List<String>`, `consultarViajesPorDestino(destino) : List<Viaje>`, `calcularPorcentajePorSector(sector) : double`.
