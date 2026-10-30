package co.edu.uniamazonia.logica2.modelo;

public class Viaje {
    private String codigoViaje;
    private String origen;
    private String destino;
    private double tarifa;
    private String estado;
    private Motorista motorista;

    public Viaje(String codigoViaje, String origen, String destino, double tarifa) {
        this.codigoViaje = codigoViaje;
        this.origen = origen;
        this.destino = destino;
        this.tarifa = tarifa;
        this.estado = "SOLICITADO";
    }

    public void asignarMotorista(Motorista motorista) {
        this.motorista = motorista;
        this.estado = "ACEPTADO";
    }

    public void iniciarViaje() {
        this.estado = "EN_CURSO";
    }

    public void finalizarViaje() {
        this.estado = "FINALIZADO";
        if (this.motorista != null) {
            this.motorista.setDisponible(true);
        }
    }

    public String getCodigoViaje() { return codigoViaje; }
    public String getOrigen() { return origen; }
    public String getDestino() { return destino; }
    public double getTarifa() { return tarifa; }
    public String getEstado() { return estado; }
    public Motorista getMotorista() { return motorista; }

    @Override
    public String toString() {
        return "Viaje [" + codigoViaje + ": " + origen + " -> " + destino + ", Tarifa: $" + tarifa + ", Estado: " + estado + "]";
    }
}
