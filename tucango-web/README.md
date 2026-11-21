# TucanGo Web — Edición TypeScript (POO & Arquitectura en 3 Paquetes)

**Producción:** [https://tucango.stellel.com](https://tucango.stellel.com)

Este módulo implementa **TucanGo** como una aplicación web ejecutable de movilidad universitaria segura para la Universidad de la Amazonia (Florencia, Caquetá), aplicando **Programación Orientada a Objetos**, encapsulamiento estricto, patrones de diseño y persistencia en **SQLite (modo WAL)**.

---

## 📦 Arquitectura Institucional en 3 Paquetes

```text
tucango-web/
├── src/co/edu/uniamazonia/tucango/
│   ├── interfaz/
│   │   └── server.ts                  # Servidor HTTP, API REST, sesiones HttpOnly y SSE
│   └── mundo/
│       ├── Persona.ts                 # Superclase abstracta
│       ├── Estudiante.ts              # Especialización pasajero + ubicaciones frecuentes
│       ├── Motorista.ts               # Especialización conductor ("Tucán") + flota
│       ├── Administrador.ts           # Auditoría y aprobación de flota
│       ├── Moto.ts                    # Validación de placa, cilindraje y SOAT vigente
│       ├── Viaje.ts                   # Ciclo de vida, PIN de abordaje y llegada segura
│       ├── EstadoViaje.ts             # Patrón State (Solicitado, Aceptado, EnCurso, Finalizado, Cancelado)
│       ├── EstrategiaTarifa.ts        # Patrón Strategy (EstudiantilFija, PorKilometro, Lluvia, Nocturna)
│       ├── Pago.ts                    # Efectivo, Nequi, Daviplata
│       ├── Calificacion.ts            # Reseñas validadas en rango [1.0, 5.0]
│       ├── Coordenada.ts              # Cálculo geográfico Haversine y rumbo
│       ├── SectorCampus.ts            # Catálogo de sedes y sectores de Florencia
│       ├── EventBus.ts                # Publicación de eventos de dominio
│       ├── ErroresAuth.ts             # Excepciones de dominio (ValidacionError, CredencialesInvalidasError)
│       ├── PasswordHasher.ts          # Hashing PBKDF2/SHA-256 con sal única
│       ├── SistemaRepository.ts       # Puerto de persistencia
│       ├── SqliteSistemaRepository.ts # Persistencia SQLite WAL + cifrado AES-256-GCM
│       ├── TucanGoFacade.ts           # Patrón Fachada (orquestador central de casos de uso)
│       ├── SimuladorCampusPOO.ts      # Simulación POO ejecutable en consola
│       ├── BarriosFlorencia.ts        # Catálogo oficial de barrios
│       └── ProgramasAcademicos.ts     # Catálogo de programas académicos
├── test/co/edu/uniamazonia/tucango/
│   └── test/
│       ├── beta_v1.test.ts
│       ├── domain.test.ts
│       └── server.test.ts
├── public/                            # Frontend web (HTML, CSS, JS, Leaflet, Chart.js)
└── data/                              # Base de datos SQLite (tucango.db)
```

---

## 🏛️ Principios y Patrones POO Aplicados

1. **Encapsulamiento Estricto & Validación Fail-Fast:**
   - Todas las entidades (`Persona`, `Estudiante`, `Motorista`, `Moto`, `Pago`, `Calificacion`) protegen sus atributos como privados.
   - Validación en dos capas: retroalimentación en tiempo real en los formularios web y excepciones de dominio (`ValidacionError`) en `.mundo`.
2. **Jerarquía de Herencia y Polimorfismo:**
   - Clase abstracta base `Persona` con especialización en `Estudiante`, `Motorista` y `Administrador`.
3. **State Pattern (Ciclo de Vida del Viaje):**
   - Cada estado (`EstadoSolicitado`, `EstadoAceptado`, `EstadoEnCurso`, `EstadoFinalizado`, `EstadoCancelado`) encapsula las transiciones permitidas y valida el PIN de abordaje.
4. **Strategy Pattern (Tarifas Dinámicas):**
   - Algoritmos de cálculo de tarifa intercambiables (`TarifaEstudiantilFija`, `TarifaPorKilometro`, `TarifaDinamicaLluvia`, `TarifaNocturna`).
5. **Patrón Fachada (Facade / Villalobos):**
   - `TucanGoFacade` centraliza y orquesta todos los casos de uso para la capa `.interfaz`.

---

## 🚀 Cómo Ejecutar

### 1. Ejecutar Pruebas Unitarias y de Integración
```bash
cd tucango-web
npm test
```
*Ejecuta las 3 suites (19 pruebas) nativamente en Node.js 22 con `node:test` y `node:assert`.*

### 2. Iniciar el Servidor Web
```bash
cd tucango-web
npm start
```
Abre tu navegador en: [http://localhost:3000](http://localhost:3000)

### 3. Ejecutar la Simulación POO en Consola
```bash
cd tucango-web
npm run sim
```

---

## 🖥️ Experiencia en la Web (Dual-View)
- **Modo Pasajero:** Selecciona estudiante, define ruta por el campus, elige la estrategia de tarifa, selecciona método de pago (Efectivo/Nequi/Daviplata) y monitorea el estado del viaje en tiempo real.
- **Modo Conductor:** Radar en vivo de solicitudes, aceptación de viajes, inicio de trayecto y cobro automatizado al finalizar con modal de calificación.
- **Inspector de Arquitectura:** Métricas en vivo de viajes e ingresos recaudados.
