package co.edu.uniamazonia.logica2;

/**
 * Demostracion de TucanGo v0.1 - Semana 1 (El Salto a los Objetos).
 * <p>
 * Valida la instanciacion de una clase unica con estado y comportamiento
 * derivado de la Bitacora de Empatia en el campus.
 * </p>
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("===============================================================");
        System.out.println("       TUCANGO v0.1 - SEMANA 1 (EL SALTO A LOS OBJETOS)       ");
        System.out.println("           Universidad de la Amazonia - Logica II              ");
        System.out.println("===============================================================\n");

        System.out.println("1. Instanciando la entidad base 'ViajeCampus':");
        ViajeCampus viaje = new ViajeCampus("CAMPUS-001", "Barrio Centro", 5000.0);
        System.out.println("   -> Estado inicial: " + viaje);

        System.out.println("\n2. Ejecutando comportamientos de negocio:");
        viaje.ajustarTarifa(5500.0);
        System.out.println("   -> Tarifa actualizada a: " + viaje.getTarifaPactada() + " COP");

        boolean seguro = viaje.marcarLlegadaSegura();
        System.out.println("   -> Llegada segura confirmada: " + seguro);
        System.out.println("   -> Estado final: " + viaje);

        System.out.println("\n===============================================================");
        System.out.println(" [OK] Semana 1 validada: 1 clase aislada con encapsulamiento.");
        System.out.println("===============================================================");
    }
}
