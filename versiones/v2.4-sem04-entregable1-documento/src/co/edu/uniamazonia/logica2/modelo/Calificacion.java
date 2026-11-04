package co.edu.uniamazonia.logica2.modelo;

public class Calificacion {
    private int puntaje;
    private String comentario;
    private String rolEmisor;
    private String fechaHora;

    public Calificacion(int puntaje, String comentario,
            String rolEmisor, String fechaHora) {
        if (validarPuntaje(puntaje)) {
            this.puntaje = puntaje;
        } else {
            this.puntaje = 1;
        }
        this.comentario = comentario;
        this.rolEmisor = rolEmisor;
        this.fechaHora = fechaHora;
    }

    public boolean validarPuntaje(int puntaje) {
        return puntaje >= 1 && puntaje <= 5;
    }

    public int getPuntaje() {
        return puntaje;
    }

    public String getComentario() {
        return comentario;
    }

    public String getRolEmisor() {
        return rolEmisor;
    }

    public String getFechaHora() {
        return fechaHora;
    }
}
