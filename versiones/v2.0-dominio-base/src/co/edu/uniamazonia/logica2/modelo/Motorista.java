package co.edu.uniamazonia.logica2.modelo;

/**
 * Entidad que representa a un motorista verificado en el sistema TucanGo.
 * <p>
 * Solo motoristas con documentación al día (identificación, placa, SOAT vigente)
 * pueden aceptar viajes. El sistema verifica estos documentos antes de habilitarlos.
 * </p>
 *
 * @author Equipo TucanGo
 * @version 1.0
 */
public class Motorista {

    /** Número de identificación (cédula/licencia de conducción). */
    private String identificacion;

    /** Placa de la motocicleta autorizada. */
    private String placa;

    /** Indica si el SOAT está vigente (true) o vencido (false). */
    private boolean soatVigente;

    /**
     * Construye un motorista con sus datos de verificación.
     *
     * @param identificacion número de identificación
     * @param placa          placa del vehículo
     * @param soatVigente    estado del SOAT
     */
    public Motorista(String identificacion, String placa, boolean soatVigente) {
        this.identificacion = identificacion;
        this.placa = placa;
        this.soatVigente = soatVigente;
    }

    // Getters y Setters

    public String getIdentificacion() {
        return identificacion;
    }

    public void setIdentificacion(String identificacion) {
        this.identificacion = identificacion;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public boolean isSoatVigente() {
        return soatVigente;
    }

    public void setSoatVigente(boolean soatVigente) {
        this.soatVigente = soatVigente;
    }

    // Responsabilidades

    /**
     * Acepta una solicitud de viaje.
     *
     * @return true si el motorista acepta el viaje
     */
    public boolean aceptarViaje() {
        if (!soatVigente) {
            System.out.println("Motorista " + identificacion + " no puede aceptar viajes: SOAT vencido.");
            return false;
        }
        System.out.println("Motorista " + identificacion + " (placa " + placa + ") acepta el viaje.");
        return true;
    }

    /**
     * Registra la disponibilidad del motorista para atender viajes.
     */
    public void registrarDisponibilidad() {
        System.out.println("Motorista " + identificacion + " se marca como disponible.");
    }

    /**
     * Verifica que la documentación del motorista esté al día.
     *
     * @return true si identificación y SOAT son válidos
     */
    public boolean verificarDocumentos() {
        boolean valido = identificacion != null && !identificacion.isBlank()
                && placa != null && !placa.isBlank()
                && soatVigente;
        System.out.println("Verificación documentos motorista " + identificacion + ": " + (valido ? "OK" : "INCOMPLETO"));
        return valido;
    }

    @Override
    public String toString() {
        return "Motorista{identificacion='" + identificacion + "', placa='" + placa + "', soatVigente=" + soatVigente + "}";
    }
}