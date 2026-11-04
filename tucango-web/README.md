# TucanGo Web — Edición TypeScript (POO & Clean Architecture)

Este módulo implementa **TucanGo** como una aplicación web interactiva inspirada en plataformas modernas de movilidad (Uber, InDrive, DiDi), demostrando **Programación Orientada a Objetos pura**, encapsulamiento riguroso y patrones de diseño de software reconocidos por la industria y la academia.

---

## 🏛️ Principios y Patrones POO Aplicados

1. **Encapsulamiento Estricto & Validación Fail-Fast:**
   - Todas las entidades (`Persona`, `Estudiante`, `Motorista`, `Moto`, `Pago`, `Calificacion`) protegen sus atributos como privados.
   - Invariantes de dominio (ej. placas no vacías, correos institucionales válidos, calificaciones estrictamente entre 1.0 y 5.0) validados en el constructor.
2. **Jerarquía de Herencia y Polimorfismo:**
   - Clase abstracta base `Persona` con implementación polimórfica en `Estudiante` y `Motorista`.
3. **State Pattern (Ciclo de Vida del Viaje):**
   - El estado del viaje no se maneja con `switch` o `if/else` frágiles. Cada estado (`EstadoSolicitado`, `EstadoAceptado`, `EstadoEnCurso`, `EstadoFinalizado`, `EstadoCancelado`) es un objeto que encapsula qué transiciones están permitidas y cuáles lanzan excepciones.
4. **Strategy Pattern (Tarifas Dinámicas):**
   - Algoritmos de cálculo de tarifa desacoplados e intercambiables en tiempo de ejecución:
     - `TarifaEstudiantilFija`: Subsidio campus ($2.500 COP fijo).
     - `TarifaPorKilometro`: Base + costo por km.
     - `TarifaDinamicaLluvia`: Recargo del 40% por clima adverso en Florencia.
     - `TarifaNocturna`: Recargo nocturno seguro del 25%.
5. **Patrón Fachada (Facade / Villalobos):**
   - `TucanGoFacade` centraliza y orquesta todos los casos de uso para la capa de presentación web.

---

## 🚀 Cómo Ejecutar

### 1. Ejecutar Pruebas Unitarias (TDD)
```bash
cd tucango-web
npm test
```
*Corre nativamente en Node.js 22 usando el test runner oficial `node:test` y `node:assert`.*

### 2. Iniciar el Servidor Web Interactivo
```bash
cd tucango-web
npm start
```
Abre tu navegador en: [http://localhost:3000](http://localhost:3000)

---

## 🖥️ Experiencia en la Web (Dual-View)
- **Modo Pasajero:** Selecciona estudiante, define ruta por el campus, elige la estrategia de tarifa, selecciona método de pago (Efectivo/Nequi/Daviplata) y monitorea el estado del viaje en tiempo real.
- **Modo Conductor:** Radar en vivo de solicitudes, aceptación de viajes, inicio de trayecto y cobro automatizado al finalizar con modal de calificación.
- **Inspector de Arquitectura:** Métricas en vivo de viajes e ingresos recaudados.
