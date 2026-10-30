package co.edu.uniamazonia.logica2.modelo;

public class Motorista {
    private String identificacion;
    private String nombre;
    private String telefono;
    private String correoInstitucional;
    private boolean disponible;
    private Moto moto;

    public Motorista(String identificacion, String nombre, String telefono, String correoInstitucional, Moto moto) {
        this.identificacion = identificacion;
        this.nombre = nombre;
        this.telefono = telefono;
        this.correoInstitucional = correoInstitucional;
        this.disponible = true;
        this.moto = moto;
    }

    public boolean aceptarViaje(Viaje viaje) {
        if (this.disponible && verificarDocumentos() && viaje != null) {
            this.disponible = false;
            viaje.setEstado(EstadoViaje.ACEPTADO);
            return true;
        }
        return false;
    }

    public boolean verificarDocumentos() {
        return this.moto != null && this.moto.validarSoat();
    }

    public String getIdentificacion() { return identificacion; }
    public String getNombre() { return nombre; }
    public String getTelefono() { return telefono; }
    public String getCorreoInstitucional() { return correoInstitucional; }
    public boolean isDisponible() { return disponible; }
    public void setDisponible(boolean disponible) { this.disponible = disponible; }
    public Moto getMoto() { return moto; }

    @Override
    public String toString() {
        return "Motorista [" + nombre + " (ID: " + identificacion + "), " + moto + "]";
    }
}
