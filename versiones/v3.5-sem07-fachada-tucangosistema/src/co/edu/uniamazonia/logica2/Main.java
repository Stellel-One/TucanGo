package co.edu.uniamazonia.logica2;

import co.edu.uniamazonia.logica2.modelo.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("===============================================================");
        System.out.println(" TUCANGO v3.5 - SEMANAS 7-8 (FACHADA RAIZ SEGUN J. VILLALOBOS)");
        System.out.println("            Universidad de la Amazonia - Logica II             ");
        System.out.println("===============================================================\n");

        TucanGoSistema sistema = new TucanGoSistema("Sede Porvenir - Florencia");

        Estudiante est = new Estudiante("1117540201", "Gian Marco Castaneda", "3101234567", "g.castaneda@udla.edu.co", "EST-2026-001");
        Motorista mot = new Motorista("1117540101", "Jhonatan Saavedra", "3209876543", "j.saavedra@udla.edu.co");
        mot.registrarMoto(new Moto("ABC-12D", "Yamaha", "FZ 2.0", 150, true, "SOAT-2026-999"));
        mot.seleccionarMotoActiva("ABC-12D");

        sistema.registrarEstudiante(est);
        sistema.registrarMotorista(mot);

        System.out.println("1. Fachada coordinando solicitud transaccional de viaje:");
        Viaje viaje = sistema.coordinarSolicitudViaje("EST-2026-001", "Campus Porvenir", "Barrio Centro", 5000.0);
        System.out.println("   -> Viaje coordinado: " + viaje.getCodigoViaje() + " (Estado: " + viaje.getEstado() + ")");

        System.out.println("\n2. Ejecucion de ciclo de vida del viaje:");
        viaje.iniciarViaje();
        viaje.finalizarViaje();
        viaje.getPago().reportarPagoEstudiante(MetodoPago.NEQUI);
        viaje.getPago().confirmarRecepcionMotorista();
        System.out.println("   -> Viaje finalizado y liquidado por fachada.");

        System.out.println("\n3. Metrica de negocio en la raiz del dominio:");
        System.out.println("   -> Total ingresos liquidados en el campus: " + sistema.calcularIngresosTotalesCampus() + " COP");

        System.out.println("\n===============================================================");
        System.out.println(" [OK] Semanas 7-8 validadas: Clase controladora de fachada.");
        System.out.println("===============================================================");
    }
}
