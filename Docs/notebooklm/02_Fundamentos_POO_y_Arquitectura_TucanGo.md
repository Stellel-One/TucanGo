# Fundamentos de POO y Arquitectura de TucanGo

## 1. Pilares de la Programacion Orientada a Objetos en TucanGo

### A. Abstraccion y Modelado del Dominio
* **Entidad Transaccional Central:** `Viaje`. Modela la interaccion dinamica entre los actores a traves del tiempo, gestionando su ciclo de vida mediante estados finitos (`EstadoViaje`: `SOLICITADO`, `ACEPTADO`, `EN_CURSO`, `COMPLETADO`, `CANCELADO`).
* **Entidades Maestras:** `Estudiante` y `Motorista`, especializaciones de la clase abstracta `Persona`.
* **Entidades Complementarias:** `Moto`, `Pago`, `Calificacion`.

### B. Encapsulamiento Estricto e Invariantes de Clase
* **Information Hiding (Ocultamiento de Informacion):** Todos los atributos de instancia se declaran `private`. Ninguna entidad externa puede mutar directamente la memoria de un objeto.
* **Invariantes de Clase:** Predicados logicos que deben cumplirse durante todo el ciclo de vida del objeto:
  * En `Calificacion`: $1.0 \le \text{puntaje} \le 5.0$.
  * En `Pago` y `Viaje`: $\text{monto} \ge 0.0$ y `Double.isFinite(monto)`.
  * En `Moto`: Placa no nula y no vacia; vigencia obligatoria de SOAT para operar.

### C. Ciclo de Vida: Constructores Fail-Fast vs Setters Controlados
1. **Constructores (Politica Fail-Fast):**
   * Un objeto nunca debe instanciarse en la memoria Heap en un estado corrupto o incompleto.
   * Si los argumentos son invalidos, nulos o violan invariantes, el constructor lanza `IllegalArgumentException` inmediatamente.
2. **Metodos Modificadores (Setters con retorno boolean):**
   * Cuando el objeto ya existe y recibe una solicitud de modificacion con valores inadmisibles, no se interrumpe la ejecucion; el metodo retorna `false` y conserva el estado valido previo.

### D. Atributos Derivados (Calculados)
* **Regla de Oro:** Los valores calculados a partir de otros atributos o colecciones **nunca tienen setter**.
* **Ejemplos:**
  * Tarifa total del viaje o subtotal con recargos (`calcularTarifa()`, `darTotal()`).
  * Promedio de calificaciones de un motorista (`darPromedioCalificaciones()`).
  * Permitir un `setTotal(double t)` permitiria introducir inconsistencias graves de negocio.

---

## 2. Colecciones Dinamicas (`ArrayList<T>`) y Memoria
* **Por que no arreglos primitivos (`Tipo[]`):** Los arreglos tienen tamano fijo definido en compilacion o instanciacion temprana. `ArrayList<T>` administra memoria dinamica en el Heap, creciendo o contrayendose segun el flujo de operacion.
* **Instanciacion Segura:** Toda coleccion se instancia en el constructor de la clase contenedora (`this.motos = new ArrayList<Moto>();`). Declararla sin instanciar dejaria la referencia en `null`, provocando `NullPointerException` en tiempo de ejecucion.
* **Proteccion contra Fuga de Referencias (Rep Exposure):** Los metodos consultores no exponen la coleccion interna directa. Retornan una vista inmodificable (`Collections.unmodifiableList(...)`) o una copia defensiva (`new ArrayList<>(...)`).

---

## 3. Jerarquias y Relaciones Estructurales
* **Herencia y Polimorfismo (`Persona`):** Clase abstracta que unifica identidad, nombre, correo y telefono. Evita duplicacion de codigo y establece un contrato comun.
* **Desacoplamiento `Motorista` y `Moto`:** Una relacion `1..*` (asociacion/agregacion). Un motorista no 'es' una moto; puede tener multiples vehiculos registrados con diferentes estados de SOAT.
* **Separacion Modelo vs Servicio:**
  * Capa `modelo`: Contiene las entidades ricas en logica y preservacion de invariantes.
  * Capa `servicio`: Orquesta casos de uso transversales (autenticacion, generacion de reportes consolidados) sin acoplar la logica a la UI.
