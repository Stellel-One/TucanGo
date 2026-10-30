package co.edu.uniamazonia.logica2.modelo;

public class Viaje {
    private String codigoViaje;
    private String origen;
    private String destino;
    private double tarifa;
    private EstadoViaje estado;
    private Pago pago;
    private Calificacion calificacionEstudiante;
    private Calificacion calificacionMotorista;

    public Viaje(String codigoViaje, String origen, String destino, double tarifa) {
        if (tarifa < 0) {
            throw new IllegalArgumentException("La tarifa no puede ser negativa");
        }
        this.codigoViaje = codigoViaje;
        this.origen = origen;
        this.destino = destino;
        this.tarifa = tarifa;
        this.estado = EstadoViaje.SOLICITADO;
        this.pago = new Pago(tarifa, MetodoPago.EFECTIVO);
    }

    public void iniciarViaje() {
        this.estado = EstadoViaje.EN_CURSO;
    }

    public void finalizarViaje() {
        this.estado = EstadoViaje.FINALIZADO;
    }

    public void registrarCalificacionEstudiante(Calificacion c) {
        this.calificacionEstudiante = c;
    }

    public void registrarCalificacionMotorista(Calificacion c) {
        this.calificacionMotorista = c;
    }

    public String getCodigoViaje() { return codigoViaje; }
    public String getOrigen() { return origen; }
    public String getDestino() { return destino; }
    public double getTarifa() { return tarifa; }
    public EstadoViaje getEstado() { return estado; }
    public void setEstado(EstadoViaje estado) { this.estado = estado; }
    public Pago getPago() { return pago; }

    @Override
    public String toString() {
        return "Viaje [" + codigoViaje + ": " + origen + " -> " + destino + ", Tarifa: " + tarifa + " COP, Estado: " + estado + ", Pago: " + pago + "]";
    }
}
