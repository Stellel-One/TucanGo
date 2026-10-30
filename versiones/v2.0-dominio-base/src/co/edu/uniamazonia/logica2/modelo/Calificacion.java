package co.edu.uniamazonia.logica2.modelo;

/**
 * Entidad que representa la calificación de un viaje en TucanGo.
 * <p>
 * Permite a los estudiantes evaluar el servicio (1–5 estrellas) y dejar
 * un comentario. Es clave para la reputación y seguridad del sistema.
 * </p>
 *
 * @author Equipo TucanGo
 * @version 1.0
 */
public class Calificacion {

    /** Puntaje de 1 a 5 estrellas. */
    private int puntaje;

    /** Comentario libre del estudiante sobre el viaje. */
    private String comentario;

    /**
     * Construye una calificación con puntaje y comentario.
     *
     * @param puntaje   valor 1–5
     * @param comentario texto libre (puede ser vacío)
     * @throws IllegalArgumentException si puntaje fuera de rango
     */
    public Calificacion(int puntaje, String comentario) {
        if (puntaje < 1 || puntaje > 5) {
            throw new IllegalArgumentException("El puntaje debe estar entre 1 y 5");
        }
        this.puntaje = puntaje;
        this.comentario = comentario != null ? comentario : "";
    }

    // Getters y Setters

    public int getPuntaje() {
        return puntaje;
    }

    public void setPuntaje(int puntaje) {
        if (puntaje < 1 || puntaje > 5) {
            throw new IllegalArgumentException("El puntaje debe estar entre 1 y 5");
        }
        this.puntaje = puntaje;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario != null ? comentario : "";
    }

    // Responsabilidades

    /**
     * Registra la calificación en el sistema.
     */
    public void registrarCalificacion() {
        System.out.println("Calificación registrada: " + puntaje + "/5 - \"" + comentario + "\"");
    }

    /**
     * Obtiene el puntaje numérico de la calificación.
     *
     * @return puntaje 1–5
     */
    public int obtenerPuntaje() {
        return puntaje;
    }

    @Override
    public String toString() {
        return "Calificacion{puntaje=" + puntaje + ", comentario='" + comentario + "'}";
    }
}