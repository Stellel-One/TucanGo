# Contexto Academico y Pedagogico — Catedra de POO

## 1. Identificacion del Contexto Institucional
* **Institucion:** Universidad de la Amazonia (Florencia, Caqueta, Colombia).
* **Unidad Academica:** Facultad de Ingenieria — Programa de Ingenieria de Sistemas.
* **Espacio Academico:** Logica y Algoritmos II (Programacion Orientada a Objetos - POO).
* **Proyecto Integrador:** TucanGo — Sistema de Movilidad Segura y Trazabilidad Universitaria.

---

## 2. Marco Pedagogico: Aprendizaje Activo Basado en Casos
La catedra adopta formalmente el modelo pedagogico de **Jorge Villalobos y Rubby Casallas** (*Fundamentos de Programacion: Aprendizaje Activo Basado en Casos*):

1. **Separacion de Mundos:**
   * **El Mundo del Problema:** Espacio real donde existen las necesidades, restricciones, dolores de los usuarios y reglas del contexto amazonico (movilidad informal, distancias entre sedes, carencia de transporte publico formal nocturno, riesgos viales).
   * **El Mundo de la Solucion:** Modelo conceptual y computacional construido en Java. No es una copia desordenada de la realidad, sino un sistema formal de objetos que colaboran mediante envio de mensajes para resolver el problema.
2. **Descubrimiento Linguistico Riguroso:**
   * **Sustantivos relevantes:** Candidatos a clases (`Estudiante`, `Motorista`, `Viaje`, `Moto`, `Pago`, `Calificacion`).
   * **Verbos de negocio:** Candidatos a metodos y contratos de colaboracion (`solicitarViaje()`, `asignarMotorista()`, `completarViaje()`, `procesarPago()`).
   * **Filtrado de Ruido:** Atributos irrelevantes para la logica computacional (color del casco, modelo exacto de telefono, marca de vestimenta) son descartados para preservar alta cohesion y evitar modelos sobrecargados.

---

## 3. Criterios de Evaluacion del Jurado Docente
El jurado docente de Logica II enfoca la sustentacion en la justificacion arquitectonica y el dominio del codigo:
* **Cero programacion intuitiva:** Todo atributo y metodo debe tener un proposito fundado en una regla del negocio o invariante.
* **Separacion de responsabilidades:** Claridad entre entidades del dominio (`modelo`), orquestadores (`servicio`) e interfaces de usuario.
* **Defensa viva del codigo:** El estudiante debe ser capaz de abrir cualquier clase en el IDE, senalar lineas exactas, explicar por que se uso un tipo de dato y que pasa en memoria Heap si un parametro es invalido.
