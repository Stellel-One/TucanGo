# Banco de Preguntas de Sustentacion y Respuestas de Nivel Senior

Este banco de preguntas recopila los cuestionamientos mas criticos del jurado docente, senalando la trampa habitual del estudiante y la respuesta arquitectonica sustentada en el codigo.

---

## Eje 1: Mundo del Problema vs. Mundo de la Solucion
* **Pregunta:** ¿Por que eligieron modelar estas clases y como filtraron el ruido de la senal?
* **Trampa del estudiante:** *"Creamos una clase para cada cosa que se nos ocurrio para que el programa funcionara"*.
* **Respuesta Senior:**
  > *"Aplicamos el metodo de Jorge Villalobos. En el Mundo del Problema observamos la inseguridad del campus y la falta de trazabilidad. Mediante descubrimiento linguistico, los sustantivos del dominio con estado y responsabilidad propia pasaron a ser clases (`Estudiante`, `Motorista`, `Viaje`, `Moto`). Filtramos el ruido (color del casco, modelo de celular) y nos quedamos con la senal critica para la solucion (identidad, SOAT, tarifa acordada, confirmacion de llegada segura)."*

---

## Eje 2: UML y Rigor en los Diagramas
* **Pregunta:** En el diagrama de clases, ¿por que `Viaje` no incluye un atributo `- estudiante: Estudiante` si en el codigo Java si existe esa variable?
* **Trampa del estudiante:** *"Fue un error y se nos olvido ponerlo en el diagrama"*.
* **Respuesta Senior:**
  > *"No es un error, es la regla de no redundancia grafica de UML. Si existe una linea de asociacion dirigida entre `Viaje` y `Estudiante`, duplicar el atributo en el compartimento de variables seria redundante. La linea representa la relacion estructural; Java la implementa como una variable de referencia."*

---

## Eje 3: Encapsulamiento e Invariantes
* **Pregunta:** ¿Cual es la diferencia entre Ocultamiento de Informacion y Preservacion de Invariantes?
* **Trampa del estudiante:** *"Encapsular es solo poner private y generar getters y setters en el IDE"*.
* **Respuesta Senior:**
  > *"El ocultamiento de informacion declara los atributos como `private` para que nadie dependa de la representacion en memoria. La preservacion de invariantes es la logica de negocio activa que impide que el objeto entre en un estado invalido (ej. un puntaje de calificacion fuera del rango [1.0, 5.0])."*

* **Pregunta:** ¿Por que en el constructor lanzan excepciones Fail-Fast y en los setters retornan boolean?
* **Respuesta Senior:**
  > *"En el constructor aplicamos Fail-Fast: un objeto jamas debe nacer en el Heap con estado corrupto o nulo; si un parametro es invalido, se aborta la instanciacion lanzando `IllegalArgumentException`. En cambio, en los setters controlados el objeto ya existe y esta operando; si recibe un dato invalido, rechaza la mutacion retornando `false` sin tirar abajo la aplicacion."*

* **Pregunta:** ¿Por que `Viaje` o `Pago` no tienen `setTotal()`?
* **Respuesta Senior:**
  > *"Porque los totales son atributos derivados. Permitir un setter arbitrario permitiria violar la coherencia de la transaccion. Se calculan en tiempo de ejecucion mediante metodos de negocio."*

---

## Eje 4: Colecciones Dinamicas (`ArrayList<T>`)
* **Pregunta:** ¿Por que usar `ArrayList<T>` en vez de `Tipo[]`?
* **Respuesta Senior:**
  > *"Un arreglo primitivo tiene longitud estatica fija. `ArrayList<T>` administra memoria dinamica en el Heap, creciendo segun la demanda real del campus sin forzar reasignaciones manuales."*

* **Pregunta:** ¿Por que si en UML la relacion dice `1..*`, al hacer `new ArrayList<>()` el tamano es 0?
* **Respuesta Senior:**
  > *"La multiplicidad `1..*` es una regla del Mundo del Problema (un motorista no puede operar sin al menos una moto verificada). En la maquina virtual, la coleccion nace vacia y son los metodos de negocio (`registrarMoto()`, `validarParaOperar()`) los que garantizan que el motorista no entre en estado activo hasta cumplir la regla."*

---

## Eje 5: Marco Legal y Etico
* **Pregunta:** Si el mototaxismo es ilegal por ley nacional, ¿por que la Universidad avalaria TucanGo?
* **Trampa del estudiante:** *"Porque todo el mundo lo usa en la ciudad"*.
* **Respuesta Senior:**
  > *"TucanGo no es transporte publico ni cobra intermediacion. Amparados en la Ley 30 de 1992 (Autonomia Universitaria), es una plataforma de bienestar y seguridad institucional para verificar la identidad de quienes ingresan con estudiantes, validar el SOAT y registrar trazabilidad de llegada sana y salva al campus."*
