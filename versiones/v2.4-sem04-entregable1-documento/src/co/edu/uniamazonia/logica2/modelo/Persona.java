package co.edu.uniamazonia.logica2.modelo;

public abstract class Persona {
    private String identificacion;
    private String nombre;
    private String telefono;
    private String correoInstitucional;

    public Persona(String identificacion, String nombre,
            String telefono, String correoInstitucional) {
        this.identificacion = identificacion;
        this.nombre = nombre;
        this.telefono = telefono;
        this.correoInstitucional = correoInstitucional;
    }

    public String getIdentificacion() {
        return identificacion;
    }

    public String getNombre() {
        return nombre;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getCorreoInstitucional() {
        return correoInstitucional;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
}
