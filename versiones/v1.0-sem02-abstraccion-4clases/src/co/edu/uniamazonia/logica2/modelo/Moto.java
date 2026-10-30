package co.edu.uniamazonia.logica2.modelo;

public class Moto {
    private String placa;
    private String marca;
    private String modelo;
    private int cilindraje;
    private boolean soatVigente;

    public Moto(String placa, String marca, String modelo, int cilindraje, boolean soatVigente) {
        this.placa = placa;
        this.marca = marca;
        this.modelo = modelo;
        this.cilindraje = cilindraje;
        this.soatVigente = soatVigente;
    }

    public boolean validarSoat() {
        return this.soatVigente;
    }

    public String getPlaca() { return placa; }
    public String getMarca() { return marca; }
    public String getModelo() { return modelo; }
    public int getCilindraje() { return cilindraje; }
    public boolean isSoatVigente() { return soatVigente; }

    @Override
    public String toString() {
        return "Moto [" + placa + " - " + marca + " " + modelo + " (" + cilindraje + "cc), SOAT: " + (soatVigente ? "Vigente" : "Vencido") + "]";
    }
}
