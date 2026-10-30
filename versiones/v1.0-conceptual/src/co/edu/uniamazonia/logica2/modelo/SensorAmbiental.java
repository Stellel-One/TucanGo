package co.edu.uniamazonia.logica2.modelo;

/**
 * Plantilla de ejemplo de una entidad del "Mundo del Problema".
 *
 * <p>Esta clase NO es la entidad definitiva del equipo. Funciona como
 * referencia de los estándares de codificación de la guía del curso:
 * atributos privados, getters/setters y métodos cuyo nombre usa un verbo
 * en infinitivo. El equipo debe reemplazarla por la entidad real que
 * defina para su problema.</p>
 *
 * <p>Corresponde a la capa {@code modelo}, donde viven las entidades del
 * dominio del problema y nada más.</p>
 */
public class SensorAmbiental {

    /** Identificador único del sensor dentro del sistema. */
    private String identificador;

    /** Ubicación física donde está instalado el sensor. */
    private String ubicacion;

    /** Nivel de batería expresado como porcentaje (de 0.0 a 100.0). */
    private double nivelBateria;

    /** Indica si el sensor está activo (true) o inactivo (false). */
    private boolean activo;

    /**
     * Construye un sensor con todos sus atributos inicializados.
     *
     * @param identificador identificador único del sensor
     * @param ubicacion     ubicación física del sensor
     * @param nivelBateria  nivel de batería inicial (porcentaje)
     * @param activo        estado inicial del sensor
     */
    public SensorAmbiental(String identificador, String ubicacion,
            double nivelBateria, boolean activo) {
        this.identificador = identificador;
        this.ubicacion = ubicacion;
        this.nivelBateria = nivelBateria;
        this.activo = activo;
    }

    /**
     * Devuelve el identificador único del sensor.
     *
     * @return el identificador del sensor
     */
    public String getIdentificador() {
        return identificador;
    }

    /**
     * Establece el identificador único del sensor.
     *
     * @param identificador nuevo identificador del sensor
     */
    public void setIdentificador(String identificador) {
        this.identificador = identificador;
    }

    /**
     * Devuelve la ubicación física del sensor.
     *
     * @return la ubicación del sensor
     */
    public String getUbicacion() {
        return ubicacion;
    }

    /**
     * Establece la ubicación física del sensor.
     *
     * @param ubicacion nueva ubicación del sensor
     */
    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    /**
     * Devuelve el nivel de batería del sensor.
     *
     * @return el nivel de batería en porcentaje
     */
    public double getNivelBateria() {
        return nivelBateria;
    }

    /**
     * Establece el nivel de batería del sensor.
     *
     * @param nivelBateria nuevo nivel de batería en porcentaje
     */
    public void setNivelBateria(double nivelBateria) {
        this.nivelBateria = nivelBateria;
    }

    /**
     * Indica si el sensor está activo.
     *
     * @return true si el sensor está activo, false en caso contrario
     */
    public boolean isActivo() {
        return activo;
    }

    /**
     * Establece el estado activo/inactivo del sensor.
     *
     * @param activo nuevo estado del sensor
     */
    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    /**
     * Registra una lectura del sensor y la muestra por consola.
     *
     * <p>Simula la captura de un dato ambiental. En la entidad real, esta
     * lógica podría delegarse a la capa {@code servicio}.</p>
     *
     * @return la lectura simulada generada por el sensor
     */
    public double registrarLectura() {
        // Lectura de ejemplo: en el problema real se calcularía con datos reales.
        double lectura = 23.5;
        System.out.println("Lectura registrada en " + ubicacion + ": " + lectura);
        return lectura;
    }

    /**
     * Emite una alerta asociada al sensor y la muestra por consola.
     *
     * @return el mensaje de alerta generado
     */
    public String emitirAlerta() {
        String mensaje = "Alerta del sensor " + identificador + " (" + ubicacion + ")";
        System.out.println(mensaje);
        return mensaje;
    }

    /**
     * Calibra el sensor restableciendo su nivel de batería al máximo.
     *
     * <p>Deja el sensor inactivo mientras se completa la calibración, como
     * medida de seguridad durante el mantenimiento.</p>
     */
    public void calibrar() {
        this.activo = false;
        this.nivelBateria = 100.0;
        System.out.println("Sensor " + identificador + " calibrado. Batería al 100%.");
    }
}
