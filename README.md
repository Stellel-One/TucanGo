<p align="center">
  <img src="Docs/java-logo-1.png" alt="TucanGo" width="120" />
</p>

<h1 align="center">TucanGo</h1>

<p align="center">
  <strong>Movilidad estudiantil segura en el campus</strong>
</p>

<p align="center">
  <img src="Docs/Gemini_Generated_Image_bawbewbawbewbawb.jpg" alt="Ilustración TucanGo" width="70%" />
</p>

<p align="center">
  <a href="https://github.com/Stellel-One/TucanGo"><img alt="Repo" src="https://img.shields.io/badge/GitHub-TucanGo-181717?logo=github"></a>
  <img alt="Licencia" src="https://img.shields.io/badge/Licencia-Académica-blue">
  <img alt="Java" src="https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white">
  <img alt="Build" src="https://img.shields.io/badge/Build-Ant-green">
  <img alt="Curso" src="https://img.shields.io/badge/Curso-Lógica%20%26%20Algoritmos%20II-purple">
</p>

---

**TucanGo** es un proyecto académico de **Lógica & Algoritmos II** (Universidad de la Amazonia, Ingeniería de Sistemas) que aplica **Programación Orientada a Objetos en Java** para modelar una solución a una problemática real del entorno universitario.

## 🎯 Idea del proyecto

El transporte informal en motocicleta (mototaxis) es una práctica común entre los estudiantes para ir y volver del campus, pero opera **sin ningún control**: no hay registro de quién conduce, no hay tarifa definida y no hay forma de saber si un viaje fue seguro. El riesgo percibido es mayor para las estudiantes mujeres, y los motoristas trabajan sin ingreso estable ni respaldo.

**TucanGo** propone entrelazar estos dos mundos — la universidad y el transporte informal — mediante un modelo de **confianza y trazabilidad**:

- 🛡️ **Seguridad para el estudiante:** cada viaje queda registrado (quién conduce, de dónde a dónde, y confirmación de llegada), y se puede calificar el servicio.
- 🤝 **Formalización para el motorista:** trabaja sobre motoristas previamente **verificados** (identificación, placa y SOAT vigente), con "clientes" asegurados y **pagos justos** registrados.
- 🏫 **Bienestar universitario:** la Universidad actúa como garante de bienestar dentro de su ámbito (verificación y control interno), sin habilitar transporte público.

> **⚖️ Encuadre responsable:** el sistema se plantea como una capa de seguridad y confianza sobre motoristas verificados dentro del ámbito del campus. **No** habilita ni legaliza el transporte público de pasajeros en moto (actividad no permitida a nivel nacional en Colombia); se concentra en lo que la Universidad sí puede controlar: **verificación, trazabilidad, reputación y pago**.

---

## 👥 Integrantes del Equipo

| # | Nombre completo | Código estudiantil | Rol |
|---|-----------------|--------------------|-----|
| 1 | Jhonatan Alexander Saavedra Culma | _(pendiente)_ | _(pendiente)_ |
| 2 | Gian Marco Castañeda Samboni | _(pendiente)_ | Backend / Arquitectura |
| 3 | Andrés David Pinilla Parra | _(pendiente)_ | _(pendiente)_ |
| 4 | Juan Guillermo Ferrer Gasca | _(pendiente)_ | _(pendiente)_ |

---

## 📂 Documentación y Entregables

- **Modelo Conceptual:** [`Docs/modelo-conceptual.md`](Docs/modelo-conceptual.md)
- **Presentación del Proyecto:** [`Docs/Presentacion Proyecto.pptx`](Docs/Presentacion%20Proyecto.pptx) y [`Docs/presentacion-proyecto.md`](Docs/presentacion-proyecto.md)
- **Diagrama UML v5.0 (Definitivo):** [`Docs/diagrama-uml-v5.0.md`](Docs/diagrama-uml-v5.0.md) | [Ver PNG](Docs/diagrama-uml-v5.0.png)
- **Historial de Versiones UML:**
  - [UML v1.0](Docs/diagrama-uml-v1.0.md)
  - [UML v2.0](Docs/diagrama-uml-v2.0.md)
  - [UML v3.0](Docs/diagrama-uml-v3.0.md)
- **Especificaciones SDD:** [`openspec/`](openspec/)

---

## ⚙️ Compilación y Ejecución

Compilar todas las clases con JDK 21:

```bash
mkdir -p bin
javac -d bin $(find src -name "*.java")
```

Ejecutar la demostración del ecosistema:

```bash
java -cp bin co.edu.uniamazonia.logica2.Main
```

### 🎮 Prototipo Interactivo

Permite **escribir los datos** (nombre del estudiante, motorista, viaje, pago, calificación)
y ver cómo responde el modelo en consola, paso a paso:

```bash
java -cp bin co.edu.uniamazonia.logica2.PrototipoInteractivo
```

**Menú:**
1. Registrar estudiante (nombre, cédula, teléfono, correo, código)
2. Registrar motorista (+ moto: placa, marca, modelo, cilindraje, SOAT)
3. Solicitar viaje (origen, destino, tarifa)
4. Aceptar viaje (motorista)
5. Iniciar viaje
6. Finalizar viaje
7. Reportar pago (EFECTIVO / NEQUI)
8. Confirmar pago (motorista)
9. Calificar viaje (1.0 – 5.0)
10. Ver estado del sistema
0. Salir

**Ejemplo de sesión:**
```
  MENU PRINCIPAL
  Estudiante: Juan Guillermo Ferrer Gasca   |   Motorista: Jhonatan Alexander Saavedra
  ...
[OK] Viaje solicitado: VIA-1 (Campus Universidad -> Barrio Centro, $8000.0)
[OK] El motorista acepto el viaje VIA-1 (estado: ACEPTADO)
[OK] Viaje VIA-1 INICIADO (estado: EN_CURSO)
[OK] Viaje VIA-1 FINALIZADO (estado: FINALIZADO)
[OK] Pago reportado por el estudiante: $8000.0 (NEQUI) estado: PAGADO_REPORTADO
[OK] El motorista confirmo la recepcion. Estado: CONFIRMADO_RECIBIDO
[OK] Calificacion registrada: 5.0/5 por ESTUDIANTE "Excelente servicio, moto impecable"
```
