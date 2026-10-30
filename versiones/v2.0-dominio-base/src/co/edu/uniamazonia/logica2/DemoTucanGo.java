package co.edu.uniamazonia.logica2;

import co.edu.uniamazonia.logica2.modelo.Calificacion;
import co.edu.uniamazonia.logica2.modelo.Estudiante;
import co.edu.uniamazonia.logica2.modelo.Motorista;
import co.edu.uniamazonia.logica2.modelo.Pago;
import co.edu.uniamazonia.logica2.modelo.Viaje;

/**
 * Demostración básica del modelo de dominio TucanGo.
 * <p>
 * Ejecuta un flujo completo: crea entidades, vincula un viaje,
 * ejecuta operaciones y muestra el resultado por consola.
 * </p>
 *
 * @author Equipo TucanGo
 * @version 1.0
 */
public class DemoTucanGo {

    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("  DEMO TUCANGO - Modelo de Dominio POO  ");
        System.out.println("========================================\n");

        // 1. Crear entidades base
        Estudiante estudiante = new Estudiante("20231001", "Juan Guillermo Ferrer Gasca", "3001234567");
        Motorista motorista = new Motorista("1000456789", "XYZ-123", true); // SOAT vigente

        System.out.println("--- Entidades creadas ---");
        System.out.println(estudiante);
        System.out.println(motorista);
        System.out.println();

        // 2. Verificar documentos del motorista
        System.out.println("--- Verificación de motorista ---");
        motorista.verificarDocumentos();
        System.out.println();

        // 3. Crear viaje y vincular entidades
        Viaje viaje = new Viaje("VJ-20240908-001", "Campus Universidad", "Barrio El Prado", 8000.0);
        viaje.setEstudiante(estudiante);
        viaje.setMotorista(motorista);

        // 4. Motorista acepta el viaje
        System.out.println("--- Flujo de viaje ---");
        motorista.aceptarViaje();

        // 5. Ejecutar operaciones del viaje
        viaje.calcularTarifa();
        viaje.iniciarViaje();
        viaje.finalizarViaje();
        System.out.println();

        // 6. Estudiante confirma llegada segura
        System.out.println("--- Confirmación de seguridad ---");
        estudiante.marcarLlegadaSegura();
        System.out.println();

        // 7. Registrar pago
        System.out.println("--- Registro de pago ---");
        Pago pago = new Pago(viaje.getTarifa());
        viaje.setPago(pago);
        pago.registrarPago();
        pago.confirmarPago();
        System.out.println();

        // 8. Registrar calificación
        System.out.println("--- Calificación del servicio ---");
        Calificacion calificacion = new Calificacion(5, "Motorista muy amable, viaje seguro y puntual.");
        viaje.setCalificacion(calificacion);
        calificacion.registrarCalificacion();
        System.out.println();

        // 9. Resumen final
        System.out.println("========================================");
        System.out.println("  RESUMEN DEL VIAJE");
        System.out.println("========================================");
        System.out.println("Viaje:      " + viaje.getCodigoViaje());
        System.out.println("Ruta:       " + viaje.getOrigen() + " -> " + viaje.getDestino());
        System.out.println("Tarifa:     $" + viaje.getTarifa());
        System.out.println("Estudiante: " + viaje.getEstudiante().getNombre() + " (" + viaje.getEstudiante().getCodigo() + ")");
        System.out.println("Motorista:  " + viaje.getMotorista().getIdentificacion() + " - Placa: " + viaje.getMotorista().getPlaca());
        System.out.println("Pago:       $" + viaje.getPago().getValor() + " [" + viaje.getPago().getEstado() + "]");
        System.out.println("Calificación: " + viaje.getCalificacion().getPuntaje() + "/5 - \"" + viaje.getCalificacion().getComentario() + "\"");
        System.out.println("========================================");
    }
}