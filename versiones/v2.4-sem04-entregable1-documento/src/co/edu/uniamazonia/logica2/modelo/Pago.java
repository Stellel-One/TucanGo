package co.edu.uniamazonia.logica2.modelo;

public class Pago {
    private double valor;
    private String metodo;
    private boolean pagadoPorEstudiante;
    private boolean confirmadoPorMotorista;

    public Pago(double valor, String metodo) {
        this.valor = valor;
        this.metodo = metodo;
        this.pagadoPorEstudiante = false;
        this.confirmadoPorMotorista = false;
    }

    public void reportarPagoEstudiante() {
        pagadoPorEstudiante = true;
    }

    public void confirmarRecepcionMotorista() {
        if (pagadoPorEstudiante) {
            confirmadoPorMotorista = true;
        }
    }

    public double getValor() {
        return valor;
    }

    public String getMetodo() {
        return metodo;
    }

    public boolean isPagadoPorEstudiante() {
        return pagadoPorEstudiante;
    }

    public boolean isConfirmadoPorMotorista() {
        return confirmadoPorMotorista;
    }
}
