# TucanGo — Diagrama y Modelo de Dominio UML v5.0 (Definitivo)

> **Contexto:** Modelo de Dominio Orientado a Objetos para el sistema de confianza y trazabilidad de movilidad estudiantil en el campus (**TucanGo**).
> **Versión:** v5.0 (Consolidada y definitiva para entrega de Lógica y Algoritmos II - Universidad de la Amazonia).

---

## 1. Arquitectura Consolidada del Sistema

| Componente | Responsabilidad en el Dominio | Mapeo POO |
| :--- | :--- | :--- |
| **`Persona`** | Superclase abstracta con datos base del campus (`identificacion`, `nombre`, `telefono`, `correoInstitucional`). | Herencia (Generalización `Es-Una`). |
| **`Estudiante`** | Persona que solicita traslados seguros desde el campus hacia su destino. | Subclase con `- codigoEstudiantil`. |
| **`Motorista`** | Persona autorizada que atiende viajes y gestiona su flota de motocicletas. | Subclase con gestión de flota `1..*`. |
| **`Administrador`** | Personal autorizado (Desarrolladores / Bienestar Universitario) para auditar la demanda y seguridad del campus. | Subclase con `- rol : RolAdmin`. |
| **`Moto`** | Entidad de vehículo con atributos técnicos y regulatorios (`soatVigente`, `activa`). | Separación SRP de `Motorista`. |
| **`Viaje`** | Entidad central que coordina origen, destino, tarifa pactada y ciclo de vida transaccional. | Mapea relaciones con Pago y Calificación. |
| **`Pago`** | Mecanismo de reporte y confirmación mutua sin comprobante (`EFECTIVO` o `NEQUI`). | Estado mutuo de confianza entre pares. |
| **`Calificacion`** | Sistema de reputación bidireccional con puntuación decimal (`Double` 1.0 a 5.0). | Multiplicidad `0..2` por cada `Viaje`. |
| **`ServicioAutenticacion`** | Gestiona el registro y login seguro sin acoplar las entidades de dominio. | Capa de Servicio desacoplada. |
| **`ServicioReportes`** | Analiza destinos y zonas de mayor concurrencia con acceso restringido para `Administrador`. | Módulo de Inteligencia de Datos. |

---

## 2. Diagrama de Clases UML v5.0 (Mermaid)

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
