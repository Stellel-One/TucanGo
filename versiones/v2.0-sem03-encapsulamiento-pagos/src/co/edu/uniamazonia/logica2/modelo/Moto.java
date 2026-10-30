package co.edu.uniamazonia.logica2.modelo;

public class Moto {
    private String placa;
    private String marca;
    private String modelo;
    private int cilindraje;
    private boolean soatVigente;
    private String numeroSoat;

    public Moto(String placa, String marca, String modelo, int cilindraje, boolean soatVigente, String numeroSoat) {
        if (cilindraje <= 0) {
            throw new IllegalArgumentException("El cilindraje debe ser mayor a 0");
        }
        this.placa = placa;
        this.marca = marca;
        this.modelo = modelo;
        this.cilindraje = cilindraje;
        this.soatVigente = soatVigente;
        this.numeroSoat = numeroSoat;
    }

    public boolean validarSoat() {
        return this.soatVigente && this.numeroSoat != null && !this.numeroSoat.isBlank();
    }

    public String getPlaca() { return placa; }
    public String getMarca() { return marca; }
    public String getModelo() { return modelo; }
    public int getCilindraje() { return cilindraje; }
    public boolean isSoatVigente() { return soatVigente; }
    public String getNumeroSoat() { return numeroSoat; }

    @Override
    public String toString() {
        return "Moto [" + placa + " " + marca + " " + modelo + " (" + cilindraje + "cc) SOAT: " + (validarSoat() ? numeroSoat : "INVÁLIDO") + "]";
    }
}
