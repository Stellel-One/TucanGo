package co.edu.uniamazonia.logica2;

import co.edu.uniamazonia.logica2.modelo.Calificacion;
import co.edu.uniamazonia.logica2.modelo.Estudiante;
import co.edu.uniamazonia.logica2.modelo.Moto;
import co.edu.uniamazonia.logica2.modelo.Motorista;
import co.edu.uniamazonia.logica2.modelo.Pago;
import co.edu.uniamazonia.logica2.modelo.Viaje;
import co.edu.uniamazonia.logica2.servicio.ServicioAutenticacion;
import co.edu.uniamazonia.logica2.servicio.ServicioReportes;

public class Main {

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("  TucanGo - Version 2.4: Entregable 1 (Documento)");
        System.out.println("  Codigo Fuente Base Oficial (APA 7ma / Seccion 8)");
        System.out.println("==================================================");

        // 1. Instanciacion de Actores
        Estudiante estudiante = new Estudiante(
                "1117500001",
                "Juan Perez",
                "3101234567",
                "juan.perez@udla.edu.co",
                "EST-2026-01"
        );

        Motorista motorista = new Motorista(
                "1117500002",
                "Carlos Rodriguez",
                "3209876543",
                "carlos.rodriguez@udla.edu.co"
        );

        // 2. Registro y seleccion de Moto
        Moto moto = new Moto("ABC-12D", "SOAT-2026-999", "2026-12-31");
        motorista.registrarMoto(moto);
        motorista.registrarDisponibilidad(true);

        System.out.println("\n[1] Actores Registrados:");
        System.out.println("  - Estudiante: " + estudiante.getNombre() + " (" + estudiante.getCodigoEstudiantil() + ")");
        System.out.println("  - Motorista : " + motorista.getNombre() + " | Disponible: " + motorista.isDisponible());
        if (motorista.obtenerMotoActiva() != null) {
            System.out.println("  - Moto Activa: " + motorista.obtenerMotoActiva().getPlaca() + " | SOAT Valido: " + motorista.obtenerMotoActiva().validarSoat());
        }

        // 3. Validacion con ServicioAutenticacion
        ServicioAutenticacion auth = new ServicioAutenticacion();
        System.out.println("\n[2] Verificacion de Correo Institucional:");
        System.out.println("  - Estudiante correo valido: " + auth.validarCorreo(estudiante));
        System.out.println("  - Motorista correo valido : " + auth.validarCorreo(motorista));

        // 4. Solicitud y aceptacion de Viaje
        Viaje viaje = estudiante.solicitarViaje("Sede Porvenir", "Sede Centro", 3000.0);
        System.out.println("\n[3] Solicitud de Viaje Creada:");
        System.out.println("  - Codigo: " + viaje.getCodigoViaje() + " | Origen: " + viaje.getOrigen() + " -> " + viaje.getDestino());
        System.out.println("  - Estado Inicial: " + viaje.getEstado());

        boolean aceptado = motorista.aceptarViaje(viaje);
        System.out.println("  - Aceptado por Motorista: " + aceptado);

        // 5. Ciclo de Vida del Viaje
        viaje.iniciarViaje();
        System.out.println("  - Estado en marcha: " + viaje.getEstado());

        viaje.finalizarViaje();
        System.out.println("  - Estado finalizado: " + viaje.getEstado());
        estudiante.marcarLlegadaSegura(viaje);

        // 6. Gestion de Pago
        Pago pago = new Pago(viaje.getTarifa(), "EFECTIVO");
        pago.reportarPagoEstudiante();
        pago.confirmarRecepcionMotorista();
        viaje.setPago(pago);

        System.out.println("\n[4] Liquidacion del Pago:");
        System.out.println("  - Metodo: " + pago.getMetodo() + " | Valor: COP " + pago.getValor());
        System.out.println("  - Pagado por estudiante: " + pago.isPagadoPorEstudiante());
        System.out.println("  - Confirmado por motorista: " + pago.isConfirmadoPorMotorista());

        // 7. Calificaciones Mutuas
        Calificacion califEst = new Calificacion(5, "Excelente viaje, conduccion prudente", "Estudiante", "2026-10-10 18:30");
        Calificacion califMot = new Calificacion(5, "Estudiante puntual en punto de encuentro", "Motorista", "2026-10-10 18:32");
        viaje.agregarCalificacion(califEst);
        viaje.agregarCalificacion(califMot);

        // 8. Reporte Final
        System.out.println("\n[5] Reporte Emitido por ServicioReportes:");
        ServicioReportes reportes = new ServicioReportes();
        reportes.mostrarReporte(viaje);
        System.out.println("==================================================");
    }
}
