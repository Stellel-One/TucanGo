package co.edu.uniamazonia.logica2.modelo;

/**
 * Entidad que representa a un estudiante usuario del sistema TucanGo.
 * <p>
 * Responsable de solicitar viajes y confirmar su llegada segura.
 * </p>
 *
 * @author Equipo TucanGo
 * @version 1.0
 */
public class Estudiante {

    /** Código único del estudiante en la universidad. */
    private String codigo;

    /** Nombre completo del estudiante. */
    private String nombre;

    /** Teléfono de contacto para emergencias. */
    private String telefono;

    /**
     * Construye un estudiante con sus datos básicos.
     *
     * @param codigo    código universitario
     * @param nombre    nombre completo
     * @param telefono  teléfono de contacto
     */
    public Estudiante(String codigo, String nombre, String telefono) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.telefono = telefono;
    }

    // Getters y Setters

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    // Responsabilidades

    /**
     * Solicita un viaje en el sistema.
     *
     * @return true si la solicitud se registró correctamente
     */
    public boolean solicitarViaje() {
        System.out.println("Estudiante " + nombre + " (" + codigo + ") solicita un viaje.");
        // Aquí se delegaría a la capa de servicio para crear el Viaje
        return true;
    }

    /**
     * Confirma que el estudiante llegó sano y salvo a su destino.
     *
     * @return true si la confirmación se registró
     */
    public boolean marcarLlegadaSegura() {
        System.out.println("Estudiante " + nombre + " confirma llegada segura.");
        return true;
    }

    @Override
    public String toString() {
        return "Estudiante{codigo='" + codigo + "', nombre='" + nombre + "', telefono='" + telefono + "'}";
    }
}