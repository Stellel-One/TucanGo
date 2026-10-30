package co.edu.uniamazonia.logica2.modelo;

/**
 * Entidad central que representa un viaje en el sistema TucanGo.
 * <p>
 * Vincula a un {@link Estudiante} y a un {@link Motorista}, y agrega
 * {@link Calificacion} y {@link Pago}. Es la transacción núcleo del sistema.
 * </p>
 *
 * @author Equipo TucanGo
 * @version 1.0
 */
public class Viaje {

    /** Código único generado para el viaje. */
    private String codigoViaje;

    /** Punto de origen del viaje. */
    private String origen;

    /** Punto de destino del viaje. */
    private String destino;

    /** Tarifa acordada para el viaje. */
    private double tarifa;

    /** Estudiante que solicita el viaje. */
    private Estudiante estudiante;

    /** Motorista que atiende el viaje. */
    private Motorista motorista;

    /** Calificación opcional del viaje (0..1). */
    private Calificacion calificacion;

    /** Pago asociado al viaje (1..1). */
    private Pago pago;

    /**
     * Construye un viaje con sus datos esenciales.
     *
     * @param codigoViaje identificador único
     * @param origen      punto de partida
     * @param destino     punto de llegada
     * @param tarifa      valor acordado
     */
    public Viaje(String codigoViaje, String origen, String destino, double tarifa) {
        this.codigoViaje = codigoViaje;
        this.origen = origen;
        this.destino = destino;
        this.tarifa = tarifa;
    }

    // Getters y Setters

    public String getCodigoViaje() {
        return codigoViaje;
    }

    public void setCodigoViaje(String codigoViaje) {
        this.codigoViaje = codigoViaje;
    }

    public String getOrigen() {
        return origen;
    }

    public void setOrigen(String origen) {
        this.origen = origen;
    }

    public String getDestino() {
        return destino;
    }

    public void setDestino(String destino) {
        this.destino = destino;
    }

    public double getTarifa() {
        return tarifa;
    }

    public void setTarifa(double tarifa) {
        this.tarifa = tarifa;
    }

    public Estudiante getEstudiante() {
        return estudiante;
    }

    public void setEstudiante(Estudiante estudiante) {
        this.estudiante = estudiante;
    }

    public Motorista getMotorista() {
        return motorista;
    }

    public void setMotorista(Motorista motorista) {
        this.motorista = motorista;
    }

    public Calificacion getCalificacion() {
        return calificacion;
    }

    public void setCalificacion(Calificacion calificacion) {
        this.calificacion = calificacion;
    }

    public Pago getPago() {
        return pago;
    }

    public void setPago(Pago pago) {
        this.pago = pago;
    }

    // Responsabilidades

    /**
     * Calcula la tarifa del viaje (puede aplicar lógica de distancia, hora, etc.).
     *
     * @return tarifa calculada
     */
    public double calcularTarifa() {
        // Lógica base: tarifa fija acordada; aquí podría ir cálculo por distancia/tiempo
        System.out.println("Calculando tarifa para viaje " + codigoViaje + ": $" + tarifa);
        return tarifa;
    }

    /**
     * Marca el inicio del recorrido.
     */
    public void iniciarViaje() {
        System.out.println("Viaje " + codigoViaje + " INICIADO: " + origen + " -> " + destino);
    }

    /**
     * Marca la finalización del recorrido.
     */
    public void finalizarViaje() {
        System.out.println("Viaje " + codigoViaje + " FINALIZADO en " + destino);
    }

    @Override
    public String toString() {
        return "Viaje{codigoViaje='" + codigoViaje + "', origen='" + origen + "', destino='" + destino
                + "', tarifa=" + tarifa + "}";
    }
}