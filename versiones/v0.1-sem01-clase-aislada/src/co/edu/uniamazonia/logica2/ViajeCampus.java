package co.edu.uniamazonia.logica2;

/**
 * Entidad elemental del "Mundo del Problema" identificada tras la Bitácora de Empatía
 * de la Semana 1: Transporte informal en motocicleta en el campus de la Uniamazonia.
 * <p>
 * Representa una única clase aislada con atributos privados y métodos con responsabilidades
 * claras para modelar un traslado seguro en el campus.
 * </p>
 *
 * @author Equipo TucanGo · Universidad de la Amazonia
 * @version 0.1 (Semana 1 - El Salto a los Objetos)
 */
public class ViajeCampus {

    // 4 Atributos privados que modelan la señal del problema
    private String codigoViaje;
    private String destino;
    private double tarifaPactada;
    private boolean completado;

    /**
     * Constructor con parámetros. Inicializa el viaje en estado pendiente.
     *
     * @param codigoViaje   identificador único del viaje
     * @param destino       lugar de llegada en Florencia
     * @param tarifaPactada valor acordado del viaje
     */
    public ViajeCampus(String codigoViaje, String destino, double tarifaPactada) {
        this.codigoViaje = codigoViaje;
        this.destino = destino;
        this.tarifaPactada = tarifaPactada;
        this.completado = false;
    }

    /**
     * Actualiza el destino de llegada del estudiante.
     *
     * @param nuevoDestino nuevo punto de llegada
     */
    public void cambiarDestino(String nuevoDestino) {
        if (nuevoDestino != null && !nuevoDestino.isBlank()) {
            this.destino = nuevoDestino;
        }
    }

    /**
     * Ajusta la tarifa del viaje si el trayecto se modifica.
     *
     * @param nuevaTarifa valor ajustado
     */
    public void ajustarTarifa(double nuevaTarifa) {
        if (nuevaTarifa > 0) {
            this.tarifaPactada = nuevaTarifa;
        }
    }

    /**
     * Marca el viaje como completado cuando el estudiante llega seguro.
     *
     * @return true si se confirmó la llegada
     */
    public boolean marcarLlegadaSegura() {
        this.completado = true;
        return this.completado;
    }

    // Métodos consultores (Getters)
    public String getCodigoViaje() {
        return codigoViaje;
    }

    public String getDestino() {
        return destino;
    }

    public double getTarifaPactada() {
        return tarifaPactada;
    }

    public boolean isCompletado() {
        return completado;
    }

    @Override
    public String toString() {
        return "ViajeCampus [codigo=" + codigoViaje + ", destino=" + destino
                + ", tarifa=$" + tarifaPactada + ", completado=" + (completado ? "SI" : "NO") + "]";
    }
}
