package co.edu.uniamazonia.logica2.modelo;

import java.util.ArrayList;
import java.util.List;

/**
 * Clase Controladora de Fachada (Root Class) del Patron Arquitectonico de Jorge Villalobos.
 * <p>
 * Centraliza la administracion de usuarios, la flota de motoristas y el registro historico
 * de viajes, actuando como punto de entrada transaccional unico del dominio TucanGo.
 * </p>
 *
 * @author Equipo TucanGo - Universidad de la Amazonia
 * @version 3.5 (Semanas 7-8 / Entregable 2)
 */
public class TucanGoSistema {

    private String nombreCampus;
    private List<Estudiante> estudiantes;
    private List<Motorista> motoristas;
    private List<Viaje> historicoViajes;

    public TucanGoSistema(String nombreCampus) {
        this.nombreCampus = nombreCampus;
        this.estudiantes = new ArrayList<>();
        this.motoristas = new ArrayList<>();
        this.historicoViajes = new ArrayList<>();
    }

    public void registrarEstudiante(Estudiante estudiante) {
        if (estudiante != null) {
            this.estudiantes.add(estudiante);
        }
    }

    public void registrarMotorista(Motorista motorista) {
        if (motorista != null) {
            this.motoristas.add(motorista);
        }
    }

    public Viaje coordinarSolicitudViaje(String codigoEstudiantil, String origen, String destino, double tarifa) {
        Estudiante est = buscarEstudiante(codigoEstudiantil);
        if (est == null) {
            return null;
        }

        String codigoV = "TUCAN-" + (historicoViajes.size() + 1);
        Viaje viaje = new Viaje(codigoV, origen, destino, tarifa);
        est.getViajesSolicitados().add(viaje);
        this.historicoViajes.add(viaje);

        // Matching con primer motorista disponible con documentos vigentes
        for (Motorista m : motoristas) {
            if (m.isDisponible() && m.verificarDocumentos()) {
                m.aceptarViaje(viaje);
                break;
            }
        }

        return viaje;
    }

    public Estudiante buscarEstudiante(String codigo) {
        for (Estudiante e : estudiantes) {
            if (e.getCodigoEstudiantil().equalsIgnoreCase(codigo)) {
                return e;
            }
        }
        return null;
    }

    public Motorista buscarMotorista(String identificacion) {
        for (Motorista m : motoristas) {
            if (m.getIdentificacion().equalsIgnoreCase(identificacion)) {
                return m;
            }
        }
        return null;
    }

    public double calcularIngresosTotalesCampus() {
        double total = 0.0;
        for (Viaje v : historicoViajes) {
            if (v.getEstado() == EstadoViaje.FINALIZADO && v.getPago().getEstado() == EstadoPago.CONFIRMADO_RECIBIDO) {
                total += v.getTarifa();
            }
        }
        return total;
    }

    public String getNombreCampus() { return nombreCampus; }
    public List<Estudiante> getEstudiantes() { return estudiantes; }
    public List<Motorista> getMotoristas() { return motoristas; }
    public List<Viaje> getHistoricoViajes() { return historicoViajes; }
}
