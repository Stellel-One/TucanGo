package co.edu.uniamazonia.logica2.modelo;

public class Calificacion {
    private double puntaje;
    private String comentario;
    private String rolEmisor;

    public Calificacion(double puntaje, String comentario, String rolEmisor) {
        if (puntaje < 1.0 || puntaje > 5.0) {
            throw new IllegalArgumentException("El puntaje debe estar estrictamente en el rango [1.0, 5.0]");
        }
        this.puntaje = puntaje;
        this.comentario = comentario;
        this.rolEmisor = rolEmisor;
    }

    public double getPuntaje() { return puntaje; }
    public String getComentario() { return comentario; }
    public String getRolEmisor() { return rolEmisor; }

    @Override
    public String toString() {
        return puntaje + "/5.0 * (" + rolEmisor + "): \"" + comentario + "\"";
    }
}
