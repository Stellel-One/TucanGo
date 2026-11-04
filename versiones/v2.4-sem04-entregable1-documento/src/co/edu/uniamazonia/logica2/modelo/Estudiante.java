package co.edu.uniamazonia.logica2.modelo;

public class Estudiante extends Persona {
    private String codigoEstudiantil;
    private int viajesSolicitados;

    public Estudiante(String identificacion, String nombre,
            String telefono, String correoInstitucional,
            String codigoEstudiantil) {
        super(identificacion, nombre, telefono, correoInstitucional);
        this.codigoEstudiantil = codigoEstudiantil;
        this.viajesSolicitados = 0;
    }

    public Viaje solicitarViaje(String origen, String destino,
            double tarifa) {
        viajesSolicitados++;
        return new Viaje("V" + viajesSolicitados, origen,
                destino, tarifa, "2026-10-10", "SOLICITADO");
    }

    public void marcarLlegadaSegura(Viaje viaje) {
        System.out.println("Llegada segura registrada.");
    }

    public String getCodigoEstudiantil() {
        return codigoEstudiantil;
    }

    public int getViajesSolicitados() {
        return viajesSolicitados;
    }
}
