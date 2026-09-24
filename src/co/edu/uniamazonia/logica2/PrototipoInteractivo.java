package co.edu.uniamazonia.logica2;

import co.edu.uniamazonia.logica2.modelo.Calificacion;
import co.edu.uniamazonia.logica2.modelo.EstadoPago;
import co.edu.uniamazonia.logica2.modelo.EstadoViaje;
import co.edu.uniamazonia.logica2.modelo.Estudiante;
import co.edu.uniamazonia.logica2.modelo.MetodoPago;
import co.edu.uniamazonia.logica2.modelo.Moto;
import co.edu.uniamazonia.logica2.modelo.Motorista;
import co.edu.uniamazonia.logica2.modelo.Viaje;

import java.util.Scanner;

/**
 * Prototipo INTERACTIVO de TucanGo.
 * <p>
 * Permite al usuario escribir los datos (nombre del estudiante, motorista, viaje,
 * pago, calificación, etc.) y ver cómo responde el modelo de dominio en consola.
 * </p>
 *
 * <p>Ejecutar con: {@code java co.edu.uniamazonia.logica2.PrototipoInteractivo}</p>
 *
 * @author Equipo TucanGo
 * @version 1.0
 */
public class PrototipoInteractivo {

    private static final Scanner sc = new Scanner(System.in);

    // Estado de la sesión
    private static Estudiante estudiante;
    private static Motorista motorista;

    public static void main(String[] args) {
        bienvenida();
        boolean salir = false;
        while (!salir) {
            mostrarMenu();
            int opcion = leerEntero("Opcion", -1);
            switch (opcion) {
                case 1 -> registrarEstudiante();
                case 2 -> registrarMotorista();
                case 3 -> solicitarViaje();
                case 4 -> aceptarViaje();
                case 5 -> iniciarViaje();
                case 6 -> finalizarViaje();
                case 7 -> reportarPago();
                case 8 -> confirmarPago();
                case 9 -> calificar();
                case 10 -> verEstado();
                case 0 -> salir = true;
                default -> System.out.println("\n[!] Opcion no valida.\n");
            }
        }
        System.out.println("\nGracias por usar TucanGo. Hasta pronto!\n");
    }

    // ==================================================================
    //  UI
    // ==================================================================
    private static void bienvenida() {
        System.out.println("#########################################################");
        System.out.println("#                                                       #");
        System.out.println("#   TUCANGO  -  Prototipo Interactivo                   #");
        System.out.println("#   Movilidad estudiantil segura en el campus           #");
        System.out.println("#   Universidad de la Amazonia - Logica II              #");
        System.out.println("#                                                       #");
        System.out.println("#########################################################");
        System.out.println();
    }

    private static void mostrarMenu() {
        System.out.println("=========================================================");
        System.out.println("  MENU PRINCIPAL");
        System.out.println("  Estudiante: " + (estudiante != null ? estudiante.getNombre() : "(sin registrar)")
                + "   |   Motorista: " + (motorista != null ? motorista.getNombre() : "(sin registrar)"));
        System.out.println("=========================================================");
        System.out.println("   1. Registrar estudiante");
        System.out.println("   2. Registrar motorista (+ moto)");
        System.out.println("   3. Solicitar viaje");
        System.out.println("   4. Aceptar viaje (motorista)");
        System.out.println("   5. Iniciar viaje");
        System.out.println("   6. Finalizar viaje");
        System.out.println("   7. Reportar pago (estudiante)");
        System.out.println("   8. Confirmar pago (motorista)");
        System.out.println("   9. Calificar viaje");
        System.out.println("  10. Ver estado del sistema");
        System.out.println("   0. Salir");
        System.out.println("---------------------------------------------------------");
    }

    // ==================================================================
    //  1. Registrar estudiante
    // ==================================================================
    private static void registrarEstudiante() {
        System.out.println("\n--- REGISTRAR ESTUDIANTE ---");
        String nombre = leerTexto("Nombre completo");
        String identificacion = leerTexto("Identificacion (cedula)");
        String telefono = leerTexto("Telefono");
        String correo = leerTexto("Correo institucional");
        String codigo = leerTexto("Codigo estudiantil");

        estudiante = new Estudiante(identificacion, nombre, telefono, correo, codigo);
        System.out.println("\n[OK] Estudiante registrado:");
        System.out.println("     " + estudiante + "\n");
    }

    // ==================================================================
    //  2. Registrar motorista
    // ==================================================================
    private static void registrarMotorista() {
        System.out.println("\n--- REGISTRAR MOTORISTA ---");
        String nombre = leerTexto("Nombre completo");
        String identificacion = leerTexto("Identificacion (cedula)");
        String telefono = leerTexto("Telefono");
        String correo = leerTexto("Correo institucional");

        motorista = new Motorista(identificacion, nombre, telefono, correo);

        System.out.println("\n--- MOTO DEL MOTORISTA ---");
        String placa = leerTexto("Placa");
        String marca = leerTexto("Marca");
        String modelo = leerTexto("Modelo");
        int cilindraje = leerEntero("Cilindraje", 125);
        boolean soat = leerSiNo("SOAT vigente? (s/n)");
        String numeroSoat = leerTexto("Numero de SOAT");

        Moto moto = new Moto(placa, marca, modelo, cilindraje, soat, numeroSoat);
        motorista.registrarMoto(moto);
        motorista.seleccionarMotoActiva(placa);

        System.out.println("\n[OK] Motorista registrado:");
        System.out.println("     " + motorista);
        System.out.println("     Motos: " + motorista.getMotos().size()
                + " | Moto activa: " + placa
                + " | Documentos validos: " + motorista.verificarDocumentos() + "\n");
    }

    // ==================================================================
    //  3. Solicitar viaje
    // ==================================================================
    private static void solicitarViaje() {
        if (!hayEstudiante()) return;

        System.out.println("\n--- SOLICITAR VIAJE ---");
        String origen = leerTexto("Origen");
        String destino = leerTexto("Destino");
        double tarifa = leerDecimal("Tarifa acordada");

        boolean ok = estudiante.solicitarViaje(origen, destino, tarifa);
        if (ok) {
            Viaje v = ultimoViaje();
            System.out.println("\n[OK] Viaje solicitado: " + v.getCodigoViaje()
                    + " (" + origen + " -> " + destino + ", $" + tarifa + ")\n");
        } else {
            System.out.println("\n[X] No se pudo solicitar el viaje (revisa los datos).\n");
        }
    }

    // ==================================================================
    //  4. Aceptar viaje
    // ==================================================================
    private static void aceptarViaje() {
        if (!hayMotorista()) return;
        Viaje v = viajePendiente();
        if (v == null) return;

        boolean ok = motorista.aceptarViaje(v);
        System.out.println(ok
                ? "\n[OK] El motorista acepto el viaje " + v.getCodigoViaje() + " (estado: " + v.getEstado() + ")\n"
                : "\n[X] No se pudo aceptar (moto sin SOAT o motorista no disponible).\n");
    }

    // ==================================================================
    //  5. Iniciar viaje
    // ==================================================================
    private static void iniciarViaje() {
        Viaje v = viajeActual();
        if (v == null) return;
        v.iniciarViaje();
        System.out.println("\n[OK] Viaje " + v.getCodigoViaje() + " INICIADO (estado: " + v.getEstado() + ")\n");
    }

    // ==================================================================
    //  6. Finalizar viaje
    // ==================================================================
    private static void finalizarViaje() {
        Viaje v = viajeActual();
        if (v == null) return;
        v.finalizarViaje();
        System.out.println("\n[OK] Viaje " + v.getCodigoViaje() + " FINALIZADO (estado: " + v.getEstado() + ")\n");
    }

    // ==================================================================
    //  7. Reportar pago
    // ==================================================================
    private static void reportarPago() {
        Viaje v = viajeActual();
        if (v == null) return;

        System.out.println("\n--- REPORTAR PAGO (estudiante) ---");
        System.out.println("   Metodo de pago:");
        System.out.println("   1. EFECTIVO");
        System.out.println("   2. NEQUI");
        int m = leerEntero("Opcion", 1);
        MetodoPago metodo = (m == 2) ? MetodoPago.NEQUI : MetodoPago.EFECTIVO;

        v.getPago().reportarPagoEstudiante(metodo);
        System.out.println("\n[OK] Pago reportado por el estudiante: $" + v.getPago().getValor()
                + " (" + metodo + ") estado: " + v.getPago().getEstado() + "\n");
    }

    // ==================================================================
    //  8. Confirmar pago
    // ==================================================================
    private static void confirmarPago() {
        Viaje v = viajeActual();
        if (v == null) return;

        boolean ok = v.getPago().confirmarRecepcionMotorista();
        System.out.println(ok
                ? "\n[OK] El motorista confirmo la recepcion. Estado: " + v.getPago().getEstado() + "\n"
                : "\n[X] No se pudo confirmar el pago.\n");
    }

    // ==================================================================
    //  9. Calificar
    // ==================================================================
    private static void calificar() {
        Viaje v = viajeActual();
        if (v == null) return;

        System.out.println("\n--- CALIFICAR VIAJE ---");
        System.out.println("   Quien califica:");
        System.out.println("   1. ESTUDIANTE");
        System.out.println("   2. MOTORISTA");
        int r = leerEntero("Opcion", 1);
        String emisor = (r == 2) ? "MOTORISTA" : "ESTUDIANTE";

        double puntaje = leerDecimal("Puntaje (1.0 a 5.0)");
        String comentario = leerTexto("Comentario");

        try {
            Calificacion c = new Calificacion(puntaje, comentario, emisor);
            boolean agregada = false;
            if (v.getCalificaciones().size() < 2) {
                v.agregarCalificacion(c);
                agregada = true;
            }
            System.out.println(agregada
                    ? "\n[OK] Calificacion registrada: " + c.getPuntaje() + "/5 por " + emisor
                      + " \"" + comentario + "\"\n"
                    : "\n[X] El viaje ya tiene el maximo de 2 calificaciones.\n");
        } catch (IllegalArgumentException e) {
            System.out.println("\n[X] " + e.getMessage() + "\n");
        }
    }

    // ==================================================================
    // 10. Ver estado
    // ==================================================================
    private static void verEstado() {
        System.out.println("\n================ ESTADO DEL SISTEMA ================");
        System.out.println("ESTUDIANTE : " + (estudiante != null ? estudiante : "(sin registrar)"));
        System.out.println("MOTORISTA  : " + (motorista != null ? motorista : "(sin registrar)"));

        if (estudiante != null && !estudiante.getViajesSolicitados().isEmpty()) {
            System.out.println("\nVIAJES:");
            for (Viaje v : estudiante.getViajesSolicitados()) {
                System.out.println("  - " + v.getCodigoViaje()
                        + " | " + v.getOrigen() + " -> " + v.getDestino()
                        + " | $" + v.getTarifa()
                        + " | estado=" + v.getEstado()
                        + " | pago=" + v.getPago().getEstado()
                        + " | califs=" + v.getCalificaciones().size());
            }
        } else {
            System.out.println("\nVIAJES: (ninguno)");
        }
        System.out.println("===================================================\n");
    }

    // ==================================================================
    //  Helpers de navegación / estado
    // ==================================================================
    private static boolean hayEstudiante() {
        if (estudiante == null) {
            System.out.println("\n[!] Primero registra un estudiante (opcion 1).\n");
            return false;
        }
        return true;
    }

    private static boolean hayMotorista() {
        if (motorista == null) {
            System.out.println("\n[!] Primero registra un motorista (opcion 2).\n");
            return false;
        }
        return true;
    }

    private static Viaje ultimoViaje() {
        var lista = estudiante.getViajesSolicitados();
        return lista.isEmpty() ? null : lista.get(lista.size() - 1);
    }

    /** Devuelve el primer viaje no cancelado, o el último. */
    private static Viaje viajeActual() {
        if (!hayEstudiante()) return null;
        Viaje v = ultimoViaje();
        if (v == null) {
            System.out.println("\n[!] No hay viajes. Solicita uno primero (opcion 3).\n");
            return null;
        }
        return v;
    }

    /** Devuelve un viaje en estado SOLICITADO (para aceptar). */
    private static Viaje viajePendiente() {
        for (Viaje v : estudiante.getViajesSolicitados()) {
            if (v.getEstado() == EstadoViaje.SOLICITADO) {
                return v;
            }
        }
        System.out.println("\n[!] No hay viajes en estado SOLICITADO. Solicita uno primero (opcion 3).\n");
        return null;
    }

    // ==================================================================
    //  Helpers de entrada (Scanner)
    // ==================================================================
    private static String leerTexto(String etiqueta) {
        while (true) {
            System.out.print("  " + etiqueta + ": ");
            String linea = sc.nextLine().trim();
            if (!linea.isEmpty()) {
                return linea;
            }
            System.out.println("  [!] No puede estar vacio.");
        }
    }

    private static int leerEntero(String etiqueta, int porDefecto) {
        while (true) {
            System.out.print("  " + etiqueta + " [" + porDefecto + "]: ");
            String linea = sc.nextLine().trim();
            if (linea.isEmpty()) {
                return porDefecto;
            }
            try {
                return Integer.parseInt(linea);
            } catch (NumberFormatException e) {
                System.out.println("  [!] Numero invalido.");
            }
        }
    }

    private static double leerDecimal(String etiqueta) {
        while (true) {
            System.out.print("  " + etiqueta + ": ");
            String linea = sc.nextLine().trim().replace(",", ".");
            try {
                return Double.parseDouble(linea);
            } catch (NumberFormatException e) {
                System.out.println("  [!] Numero invalido (usa punto o coma decimal).");
            }
        }
    }

    private static boolean leerSiNo(String etiqueta) {
        while (true) {
            System.out.print("  " + etiqueta + ": ");
            String linea = sc.nextLine().trim().toLowerCase();
            if (linea.equals("s") || linea.equals("si") || linea.equals("y")) {
                return true;
            }
            if (linea.equals("n") || linea.equals("no")) {
                return false;
            }
            System.out.println("  [!] Responde 's' o 'n'.");
        }
    }
}
