package co.edu.uniamazonia.logica2.modelo;

public class Motorista extends Persona {
    private boolean disponible;
    private Moto motoActiva;
    private int viajesAtendidos;

    public Motorista(String identificacion, String nombre,
            String telefono, String correoInstitucional) {
        super(identificacion, nombre, telefono, correoInstitucional);
        this.disponible = false;
        this.motoActiva = null;
        this.viajesAtendidos = 0;
    }

    public void registrarMoto(Moto moto) {
        if (moto.validarSoat()) {
            motoActiva = moto;
        }
    }

    public void seleccionarMotoActiva(Moto moto) {
        if (moto.validarSoat()) {
            motoActiva = moto;
        }
    }

    public Moto obtenerMotoActiva() {
        return motoActiva;
    }

    public boolean aceptarViaje(Viaje viaje) {
        if (disponible && motoActiva != null
                && viaje.getEstado().equals("SOLICITADO")) {
            viajesAtendidos++;
            return true;
        }
        return false;
    }

    public void registrarDisponibilidad(boolean disponible) {
        this.disponible = disponible;
    }

    public boolean isDisponible() {
        return disponible;
    }

    public int getViajesAtendidos() {
        return viajesAtendidos;
    }
}
