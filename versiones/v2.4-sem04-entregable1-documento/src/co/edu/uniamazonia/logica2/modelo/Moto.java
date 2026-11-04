package co.edu.uniamazonia.logica2.modelo;

public class Moto {
    private String placa;
    private String numeroSoat;
    private String fechaVencimientoSoat;
    private boolean activa;

    public Moto(String placa, String numeroSoat,
            String fechaVencimientoSoat) {
        this.placa = placa;
        this.numeroSoat = numeroSoat;
        this.fechaVencimientoSoat = fechaVencimientoSoat;
        this.activa = true;
    }

    public boolean validarSoat() {
        return fechaVencimientoSoat.compareTo("2026-10-10") >= 0;
    }

    public String getPlaca() {
        return placa;
    }

    public String getNumeroSoat() {
        return numeroSoat;
    }

    public boolean isActiva() {
        return activa;
    }

    public void setActiva(boolean activa) {
        this.activa = activa;
    }
}
