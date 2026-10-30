package co.edu.uniamazonia.logica2;

import co.edu.uniamazonia.logica2.modelo.SensorAmbiental;

/**
 * Punto de entrada de la aplicación.
 *
 * <p>Demuestra el uso de la entidad de referencia {@link SensorAmbiental}:
 * instancia el objeto, asigna valores, invoca sus métodos públicos y muestra
 * el estado resultante por consola.</p>
 */
public class Main {

    /**
     * Método principal que inicia la ejecución.
     *
     * @param args argumentos de línea de comandos (no se usan)
     */
    public static void main(String[] args) {
        // 1. Instanciar la entidad de referencia.
        SensorAmbiental sensor = new SensorAmbiental(
                "SEN-001",            // identificador
                "Bloque B - Aula 201", // ubicacion
                87.5,                 // nivelBateria
                true                  // activo
        );

        // 2. Mostrar el estado inicial con los getters.
        System.out.println("=== Estado inicial del sensor ===");
        System.out.println("Identificador : " + sensor.getIdentificador());
        System.out.println("Ubicacion     : " + sensor.getUbicacion());
        System.out.println("Nivel bateria : " + sensor.getNivelBateria() + "%");
        System.out.println("Activo        : " + sensor.isActivo());

        // 3. Invocar los métodos públicos de comportamiento.
        System.out.println();
        System.out.println("=== Comportamiento ===");
        sensor.registrarLectura();
        sensor.emitirAlerta();
        sensor.calibrar();

        // 4. Mostrar el estado tras la calibración.
        System.out.println();
        System.out.println("=== Estado tras calibrar ===");
        System.out.println("Nivel bateria : " + sensor.getNivelBateria() + "%");
        System.out.println("Activo        : " + sensor.isActivo());
    }
}
