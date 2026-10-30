package co.edu.uniamazonia.logica2;

import co.edu.uniamazonia.logica2.modelo.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("===============================================================");
        System.out.println("  TUCANGO v2.0 - SEMANA 3 (ENCAPSULAMIENTO & REGLA DE ORO OMG)");
        System.out.println("            Universidad de la Amazonia - Logica II             ");
        System.out.println("===============================================================\n");

        Moto moto = new Moto("ABC-12D", "Yamaha", "FZ 2.0", 150, true, "SOAT-2026-999");
        Motorista motorista = new Motorista("1117540101", "Jhonatan Saavedra", "3209876543", "j.saavedra@udla.edu.co", moto);
        Estudiante estudiante = new Estudiante("1117540201", "Gian Marco Castaneda", "3101234567", "g.castaneda@udla.edu.co", "EST-2026-001");
        Viaje viaje = new Viaje("VIA-201", "Campus Porvenir", "Barrio Centro", 5000.0);

        System.out.println("1. Flujo Transaccional con Encapsulamiento e Invariantes:");
        motorista.aceptarViaje(viaje);
        viaje.iniciarViaje();
        estudiante.marcarLlegadaSegura(viaje);
        System.out.println("   -> Viaje finalizado con exito: " + viaje.getEstado());

        System.out.println("\n2. Liquidacion de Pago de Confianza Mutua (Efectivo/Nequi):");
        viaje.getPago().reportarPagoEstudiante(MetodoPago.NEQUI);
        System.out.println("   -> Estudiante reporto pago Nequi: " + viaje.getPago());
        viaje.getPago().confirmarRecepcionMotorista();
        System.out.println("   -> Motorista confirmo recepcion: " + viaje.getPago());

        System.out.println("\n3. Calificacion Mutua con Invariante Fail-Fast [1.0 - 5.0]:");
        Calificacion cEst = new Calificacion(5.0, "Excelente conduccion y respeto al limite de velocidad.", "ESTUDIANTE");
        Calificacion cMot = new Calificacion(4.8, "Pasajero puntual y correcto.", "MOTORISTA");
        viaje.registrarCalificacionEstudiante(cEst);
        viaje.registrarCalificacionMotorista(cMot);
        System.out.println("   -> " + cEst);
        System.out.println("   -> " + cMot);

        System.out.println("\n===============================================================");
        System.out.println(" [OK] Semana 3 validada: Invariantes, pagos y calificaciones.");
        System.out.println("===============================================================");
    }
}
