# TucanGo — Diagrama y Modelo de Dominio UML v3.2

> **Contexto:** Modelo de Dominio Orientado a Objetos para el sistema de confianza y trazabilidad de movilidad estudiantil en el campus (**TucanGo**).
> **Evolución v3.1 → v3.2:** Multiplicidad de flota para `Motorista` (`1..*` motos registradas) con bandera de selección de moto activa (`activa`).

---

## 1. Decisiones Arquitectónicas y de Flota (v3.2)

| Módulo / Aspecto | Decisión Implementada en v3.2 | Justificación Académica & POO |
| :--- | :--- | :--- |
| **1. Multi-Moto por Motorista** | Multiplicidad `Motorista "1" --> "1..*" Moto`. Métodos `registrarMoto(moto: Moto)` y `seleccionarMotoActiva(placa: String)`. Atributo `- activa : Boolean` en `Moto`. | **Realismo del Dominio:** Un conductor registra al menos 1 moto principal, pero puede tener secundarias y alternar cuál conduce en el día. En Java se mapea como `ArrayList<Moto>`. |
| **2. Jerarquía `Persona` con RBAC** | `Persona` abstracta con tres subclases: `Estudiante`, `Motorista` y `Administrador` (`RolAdmin`: `DESARROLLADOR` o `BIENESTAR_UNIVERSITARIO`). | **Polimorfismo & Seguridad:** Control de Acceso Basado en Roles. |
| **3. Módulo Analítico (`ServicioReportes`)** | Métodos para consultar destinos más frecuentes y porcentajes por sector con acceso exclusivo para `Administrador`. | **SRP & Privacidad:** La inteligencia de movilidad se aísla de los usuarios comunes. |
| **4. Pagos Informados Mutuos** | `MetodoPago` (`EFECTIVO`, `NEQUI`) y banderas mutuas (`pagadoPorEstudiante`, `confirmadoPorMotorista`). Cero comprobantes. | Modela el acuerdo de confianza entre pares de la comunidad universitaria. |
| **5. Calificación Bidireccional** | `Viaje "1" --> "0..2" Calificacion` con puntaje decimal `Double` (`1.0` - `5.0`) y `rolEmisor`. | Reputación mutua y seguridad comunitaria. |

---

## 2. Diagrama de Clases UML v3.2 (Mermaid)

```mermaid
classDiagram
    direction TB

    %% ==========================================
    %% JERARQUÍA DE PERSONAS (ENTIDAD BASE ABSTRACTA)
    %% ==========================================
    class Persona {
        <<abstract>>
        # identificacion : String
        # nombre : String
        # telefono : String
        # correoInstitucional : String
        + obtenerIdentificacion() String
        + obtenerNombreCompleto() String
    }

    class Estudiante {
        - codigoEstudiantil : String
        + solicitarViaje(origen: String, destino: String) Boolean
        + marcarLlegadaSegura(codigoViaje: String) Boolean
    }

    class Motorista {
        - disponible : Boolean
        + aceptarViaje(codigoViaje: String) Boolean
        + registrarDisponibilidad(estado: Boolean) Void
        + registrarMoto(moto: Moto) Void
        + seleccionarMotoActiva(placa: String) Boolean
        + verificarDocumentos() Boolean
    }

    class RolAdmin {
        <<enumeration>>
        DESARROLLADOR
        BIENESTAR_UNIVERSITARIO
    }

    class Administrador {
        - rol : RolAdmin
        + consultarReportesDemanda() Void
        + gestionarUsuarios() Void
    }

    Persona <|-- Estudiante : Generalización (Es-Una)
    Persona <|-- Motorista : Generalización (Es-Una)
    Persona <|-- Administrador : Generalización (Es-Una)

    %% ==========================================
    %% MÓDULO VEHÍCULO (FLOTA DINÁMICA)
    %% ==========================================
    class Moto {
        - placa : String
        - marca : String
        - modelo : String
        - cilindraje : Integer
        - soatVigente : Boolean
        - numeroSoat : String
        - activa : Boolean
        + validarSoat() Boolean
    }

    Motorista "1" --> "1..*" Moto : registra / conduce (motos)

    %% ==========================================
    %% SERVICIOS (AUTENTICACIÓN Y REPORTES)
    %% ==========================================
    class ServicioAutenticacion {
        + registrarse(persona: Persona, clave: String) Boolean
        + iniciarSesion(correo: String, clave: String) Boolean
        + cerrarSesion(identificacion: String) Void
    }

    class ServicioReportes {
        + obtenerDestinosMasFrecuentes(limite: Integer) List
        + consultarViajesPorDestino(destino: String) List
        + calcularPorcentajePorSector(sector: String) Real
    }

    ServicioAutenticacion ..> Persona : gestiona >
    Administrador "1" ..> ServicioReportes : consulta >
    ServicioReportes ..> Viaje : analiza >

    %% ==========================================
    %% NÚCLEO TRANSACCIONAL (VIAJE)
    %% ==========================================
    class EstadoViaje {
        <<enumeration>>
        SOLICITADO
        ACEPTADO
        EN_CURSO
        FINALIZADO
        CANCELADO
    }

    class Viaje {
        - codigoViaje : String
        - origen : String
        - destino : String
        - tarifa : Real
        - estado : EstadoViaje
        - fechaHora : String
        + calcularTarifa() Real
        + iniciarViaje() Void
        + finalizarViaje() Void
        + cancelarViaje() Void
    }

    Estudiante "1" --> "0..*" Viaje : solicita (viajesSolicitados)
    Motorista  "1" --> "0..*" Viaje : atiende (viajesAtendidos)

    %% ==========================================
    %% PAGOS (REPORTE MUTUO)
    %% ==========================================
    class MetodoPago {
        <<enumeration>>
        EFECTIVO
        NEQUI
    }

    class EstadoPago {
        <<enumeration>>
        PENDIENTE
        PAGADO_REPORTADO
        CONFIRMADO_RECIBIDO
    }

    class Pago {
        - valor : Real
        - metodo : MetodoPago
        - estado : EstadoPago
        - pagadoPorEstudiante : Boolean
        - confirmadoPorMotorista : Boolean
        - fechaHora : String
        + reportarPagoEstudiante(metodo: MetodoPago) Void
        + confirmarRecepcionMotorista() Boolean
    }

    Viaje "1" --> "1" Pago : liquidaCon (pago)

    %% ==========================================
    %% CALIFICACIÓN BIDIRECCIONAL
    %% ==========================================
    class Calificacion {
        - puntaje : Real
        - comentario : String
        - rolEmisor : String
        - fechaHora : String
        + registrarCalificacion(puntaje: Real, comentario: String, emisor: String) Void
        + obtenerPuntaje() Real
    }

    Viaje "1" --> "0..2" Calificacion : evaluadoEn (calificaciones)
```
