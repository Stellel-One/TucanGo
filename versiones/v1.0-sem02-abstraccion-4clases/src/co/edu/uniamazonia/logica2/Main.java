package co.edu.uniamazonia.logica2;

import co.edu.uniamazonia.logica2.modelo.Estudiante;
import co.edu.uniamazonia.logica2.modelo.Moto;
import co.edu.uniamazonia.logica2.modelo.Motorista;
import co.edu.uniamazonia.logica2.modelo.Viaje;

public class Main {
    public static void main(String[] args) {
        System.out.println("===============================================================");
        System.out.println("   TUCANGO v1.0 - SEMANA 2 (MUNDO DEL PROBLEMA & 4 CLASES)    ");
        System.out.println("            Universidad de la Amazonia - Logica II             ");
        System.out.println("===============================================================\n");

        Moto moto = new Moto("ABC-12D", "Yamaha", "FZ 2.0", 150, true);
        Motorista motorista = new Motorista("1117540101", "Jhonatan Saavedra", "3209876543", moto);
        Estudiante estudiante = new Estudiante("EST-2026-001", "Gian Marco Castaneda", "3101234567");
        Viaje viaje = new Viaje("VIA-101", "Campus Porvenir", "Barrio Centro", 5000.0);

        System.out.println("1. Entidades del Mundo del Problema instanciadas:");
        System.out.println("   -> " + estudiante);
        System.out.println("   -> " + motorista);
        System.out.println("   -> " + viaje);

        System.out.println("\n2. Colaboracion de Objetos segun Diagrama UML v1.0:");
        boolean aceptado = motorista.aceptarViaje(viaje);
        System.out.println("   -> Motorista acepta viaje (SOAT verificado): " + aceptado);
        System.out.println("   -> Estado del viaje: " + viaje.getEstado());

        viaje.iniciarViaje();
        System.out.println("   -> Viaje en curso: " + viaje.getEstado());

        estudiante.marcarLlegadaSegura(viaje);
        System.out.println("   -> Llegada segura confirmada: " + viaje.getEstado());
        System.out.println("   -> Disponibilidad restaurada de motorista: " + motorista.isDisponible());

        System.out.println("\n===============================================================");
        System.out.println(" [OK] Semana 2 validada: 4 clases colaborando limpiamente.");
        System.out.println("===============================================================");
    }
}
