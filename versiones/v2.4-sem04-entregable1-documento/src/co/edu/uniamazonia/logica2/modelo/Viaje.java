package co.edu.uniamazonia.logica2.modelo;

public class Viaje {
    private String codigoViaje;
    private String origen;
    private String destino;
    private double tarifa;
    private String fechaHora;
    private String estado;
    private Pago pago;
    private Calificacion calificacionEstudiante;
    private Calificacion calificacionMotorista;

    public Viaje(String codigoViaje, String origen, String destino,
            double tarifa, String fechaHora, String estado) {
        this.codigoViaje = codigoViaje;
        this.origen = origen;
        this.destino = destino;
        this.tarifa = tarifa;
        this.fechaHora = fechaHora;
        this.estado = estado;
    }

    public void iniciarViaje() {
        if (estado.equals("SOLICITADO")) {
            estado = "EN_CURSO";
        }
    }

    public void finalizarViaje() {
        if (estado.equals("EN_CURSO")) {
            estado = "FINALIZADO";
        }
    }

    public void cancelarViaje() {
        if (estado.equals("SOLICITADO")) {
            estado = "CANCELADO";
        }
    }

    public void agregarCalificacion(Calificacion calificacion) {
        if (calificacion.getRolEmisor().equalsIgnoreCase("Estudiante")) {
            calificacionEstudiante = calificacion;
        } else if (calificacion.getRolEmisor()
                .equalsIgnoreCase("Motorista")) {
            calificacionMotorista = calificacion;
        }
    }

    public String getCodigoViaje() {
        return codigoViaje;
    }

    public String getOrigen() {
        return origen;
    }

    public String getDestino() {
        return destino;
    }

    public double getTarifa() {
        return tarifa;
    }

    public String getEstado() {
        return estado;
    }

    public Pago getPago() {
        return pago;
    }

    public void setPago(Pago pago) {
        this.pago = pago;
    }

    public int getCantidadCalificaciones() {
        int cantidad = 0;
        if (calificacionEstudiante != null) {
            cantidad++;
        }
        if (calificacionMotorista != null) {
            cantidad++;
        }
        return cantidad;
    }
}
