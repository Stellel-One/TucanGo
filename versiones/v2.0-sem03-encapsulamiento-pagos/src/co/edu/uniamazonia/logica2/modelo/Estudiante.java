package co.edu.uniamazonia.logica2.modelo;

public class Estudiante {
    private String identificacion;
    private String nombre;
    private String telefono;
    private String correoInstitucional;
    private String codigoEstudiantil;

    public Estudiante(String identificacion, String nombre, String telefono, String correoInstitucional, String codigoEstudiantil) {
        this.identificacion = identificacion;
        this.nombre = nombre;
        this.telefono = telefono;
        this.correoInstitucional = correoInstitucional;
        this.codigoEstudiantil = codigoEstudiantil;
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

    public String getIdentificacion() { return identificacion; }
    public String getNombre() { return nombre; }
    public String getTelefono() { return telefono; }
    public String getCorreoInstitucional() { return correoInstitucional; }
    public String getCodigoEstudiantil() { return codigoEstudiantil; }

    @Override
    public String toString() {
        return "Estudiante [" + codigoEstudiantil + ": " + nombre + " (" + correoInstitucional + ")]";
    }
}
