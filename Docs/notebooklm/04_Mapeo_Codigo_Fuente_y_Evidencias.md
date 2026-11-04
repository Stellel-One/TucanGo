# Mapeo de Codigo Fuente y Evidencias de Implementacion

Este documento consolida las evidencias directas del codigo fuente del proyecto TucanGo (`src/co/edu/uniamazonia/logica2/`), permitiendo validar de forma irrefutable cada principio de POO ante el jurado calificador.

---

## 1. Herencia y Reutilizacion de Codigo
* **Clase Base:** `co.edu.uniamazonia.logica2.modelo.Persona`
  * Definida como `public abstract class Persona`.
  * Atributos privados: `identificacion`, `nombre`, `telefono`, `correoInstitucional`.
  * Constructor base parametrizado: `Persona(String identificacion, String nombre, String telefono, String correoInstitucional)`.
* **Subclases:**
  * `Estudiante extends Persona`: Invoca `super(...)` y anade logica de saldo y solicitudes de viaje.
  * `Motorista extends Persona`: Invoca `super(...)` e incorpora estado de disponibilidad y listas asociadas (`motos`, `viajesAtendidos`).

---

## 2. Invariantes y Constructores Fail-Fast
* **Calificacion (`Calificacion.java`):**
  * Metodo validador: `public boolean validarPuntaje(double puntaje) { return puntaje >= 1.0 && puntaje <= 5.0; }`
  * Politica Fail-Fast en constructor:
    ```java
    private void asegurarPuntajeValido(double puntaje) {
        if (!validarPuntaje(puntaje)) {
            throw new IllegalArgumentException("El puntaje debe estar estrictamente en el rango [1.0, 5.0]");
        }
    }
    ```
* **Viaje (`Viaje.java`):**
  * Validacion de tarifa no negativa en constructor:
    ```java
    if (tarifa < 0) {
        throw new IllegalArgumentException("La tarifa no puede ser negativa");
    }
    ```
* **Moto (`Moto.java`):**
  * Validacion de placa no nula y obligatoriedad de vigencia del SOAT para autorizar la operacion.

---

## 3. Manejo de Colecciones Dinamicas en Memoria
* **Instanciacion de Listas en Constructor (`Motorista.java`):**
  ```java
  public Motorista(String identificacion, String nombre, String telefono, String correoInstitucional) {
      super(identificacion, nombre, telefono, correoInstitucional);
      this.disponible = true;
      this.motos = new ArrayList<>();
      this.viajesAtendidos = new ArrayList<>();
  }
  ```
  * **Justificacion arquitectonica:** Evita que las referencias nazcan en `null`, previniendo `NullPointerException` en tiempo de ejecucion.
* **Control de Insercion y Recorrido Polimorfico:**
  * Metodo `registrarMoto(Moto moto)` con validacion defensiva de nulidad (`if (moto != null)`).
  * Metodo `seleccionarMotoActiva(String placa)` que recorre la coleccion usando `for (Moto m : this.motos)` preservando la encapsulacion.

---

## 4. Atributos Derivados (Sin Setters)
* **Viaje (`Viaje.java`):**
  * `calcularTarifa()`: Calcula o consulta la tarifa dinamica segun las reglas del viaje sin permitir que un agente externo fije arbitrariamente el total.
* **Pago (`Pago.java`):**
  * Atributo `monto` protegido contra modificaciones externas una vez transaccionado.
