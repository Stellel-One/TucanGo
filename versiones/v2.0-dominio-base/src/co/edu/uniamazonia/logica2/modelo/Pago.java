package co.edu.uniamazonia.logica2.modelo;

/**
 * Entidad que representa el pago de un viaje en TucanGo.
 * <p>
 * Registra el valor acordado y el estado (pendiente/confirmado).
 * No procesa pagos electrónicos reales; solo modela el registro.
 * </p>
 *
 * @author Equipo TucanGo
 * @version 1.0
 */
public class Pago {

    /** Valor monetario del viaje. */
    private double valor;

    /** Estado del pago: "pendiente" o "confirmado". */
    private String estado;

    /**
     * Construye un pago con su valor inicial en estado pendiente.
     *
     * @param valor monto del viaje
     */
    public Pago(double valor) {
        this.valor = valor;
        this.estado = "pendiente";
    }

    // Getters y Setters

    public double getValor() {
        return valor;
    }

    public void setValor(double valor) {
        this.valor = valor;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        if (estado != null && (estado.equalsIgnoreCase("pendiente") || estado.equalsIgnoreCase("confirmado"))) {
            this.estado = estado.toLowerCase();
        }
    }

    // Responsabilidades

    /**
     * Registra el pago en el sistema.
     */
    public void registrarPago() {
        System.out.println("Pago registrado: $" + valor + " [" + estado + "]");
    }

    /**
     * Confirma que el pago se realizó correctamente.
     *
     * @return true si el estado cambió a confirmado
     */
    public boolean confirmarPago() {
        if ("pendiente".equalsIgnoreCase(estado)) {
            this.estado = "confirmado";
            System.out.println("Pago CONFIRMADO: $" + valor);
            return true;
        }
        System.out.println("Pago ya estaba en estado: " + estado);
        return false;
    }

    @Override
    public String toString() {
        return "Pago{valor=" + valor + ", estado='" + estado + "'}";
    }
}