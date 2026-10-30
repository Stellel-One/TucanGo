package co.edu.uniamazonia.logica2.modelo;

public class Estudiante {
    private String codigoEstudiantil;
    private String nombre;
    private String telefono;

    public Estudiante(String codigoEstudiantil, String nombre, String telefono) {
        this.codigoEstudiantil = codigoEstudiantil;
        this.nombre = nombre;
        this.telefono = telefono;
    }

    public boolean solicitarViaje(Viaje viaje) {
        return viaje != null;
    }

    public boolean marcarLlegadaSegura(Viaje viaje) {
        if (viaje != null) {
            viaje.finalizarViaje();
            return true;
        }
        return false;
    }

    public String getCodigoEstudiantil() { return codigoEstudiantil; }
    public String getNombre() { return nombre; }
    public String getTelefono() { return telefono; }

    @Override
    public String toString() {
        return "Estudiante [" + codigoEstudiantil + " - " + nombre + "]";
    }
}
