package co.edu.uniamazonia.logica2.modelo;

public class Pago {
    private double valor;
    private MetodoPago metodo;
    private EstadoPago estado;
    private boolean pagadoPorEstudiante;
    private boolean confirmadoPorMotorista;

    public Pago(double valor, MetodoPago metodo) {
        if (valor < 0) {
            throw new IllegalArgumentException("El valor del pago no puede ser negativo");
        }
        this.valor = valor;
        this.metodo = metodo;
        this.estado = EstadoPago.PENDIENTE;
        this.pagadoPorEstudiante = false;
        this.confirmadoPorMotorista = false;
    }

    public void reportarPagoEstudiante(MetodoPago metodo) {
        this.metodo = metodo;
        this.pagadoPorEstudiante = true;
        this.estado = EstadoPago.PAGADO_REPORTADO;
    }

    public boolean confirmarRecepcionMotorista() {
        if (this.pagadoPorEstudiante || this.estado == EstadoPago.PAGADO_REPORTADO) {
            this.confirmadoPorMotorista = true;
            this.estado = EstadoPago.CONFIRMADO_RECIBIDO;
            return true;
        }
        return false;
    }

    public double getValor() { return valor; }
    public MetodoPago getMetodo() { return metodo; }
    public EstadoPago getEstado() { return estado; }
    public boolean isConfirmadoPorMotorista() { return confirmadoPorMotorista; }

    @Override
    public String toString() {
        return valor + " COP (" + metodo + ") - Estado: " + estado;
    }
}
