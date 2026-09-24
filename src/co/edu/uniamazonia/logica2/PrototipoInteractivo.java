package co.edu.uniamazonia.logica2;

import co.edu.uniamazonia.logica2.modelo.Calificacion;
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
 * Guía paso a paso: cada vez que el sistema pide un dato, indica un EJEMPLO de
 * lo que hay que escribir. Ideal para la demostración en clase.
 * </p>
 *
 * <p>Ejecutar con: {@code java co.edu.uniamazonia.logica2.PrototipoInteractivo}</p>
 *
 * @author Equipo TucanGo
 * @version 2.0
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
            int opcion = leerOpcion();
            System.out.println();
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
                default -> System.out.println("[!] Escribi un numero del 0 al 10.\n");
            }
        }
        System.out.println("Gracias por usar TucanGo. Hasta pronto!\n");
    }

    // ==================================================================
    //  CABECERA Y MENU
    // ==================================================================
    private static void bienvenida() {
        System.out.println("#########################################################");
        System.out.println("#                                                       #");
        System.out.println("#   TUCANGO  -  Prototipo Interactivo                   #");
        System.out.println("#   Universidad de la Amazonia - Logica II              #");
        System.out.println("#                                                       #");
        System.out.println("#   Escribi el NUMERO de la opcion y presiona ENTER.    #");
        System.out.println("#   Si no sabes que escribir, mira el (ej: ...).        #");
        System.out.println("#                                                       #");
        System.out.println("#########################################################");
        System.out.println();
    }

    private static void mostrarMenu() {
        System.out.println("=========================================================");
        System.out.println("  MENU  (escribi el numero y presiona ENTER)");
        System.out.println("  Estudiante: " + (estudiante != null ? estudiante.getNombre() : "(sin registrar)")
                + "   |   Motorista: " + (motorista != null ? motorista.getNombre() : "(sin registrar)"));
        System.out.println("=========================================================");
        System.out.println("   1. Registrar ESTUDIANTE        (nombre, cedula, tel, correo, codigo)");
        System.out.println("   2. Registrar MOTORISTA + MOTO  (datos + placa, marca, modelo, SOAT)");
        System.out.println("   3. Pedir un VIAJE              (origen, destino, tarifa)");
        System.out.println("   4. Aceptar el viaje            (el motorista lo toma)");
        System.out.println("   5. Iniciar el viaje");
        System.out.println("   6. Finalizar el viaje");
        System.out.println("   7. Reportar PAGO               (1 = Efectivo, 2 = Nequi)");
        System.out.println("   8. Confirmar el pago");
        System.out.println("   9. CALIFICAR                   (puntaje de 1.0 a 5.0)");
        System.out.println("  10. Ver el ESTADO de todo");
        System.out.println("   0. Salir");
        System.out.println("---------------------------------------------------------");
    }

    /** Lee la opción del menú, insistiendo si no es un número válido. */
    private static int leerOpcion() {
        System.out.print("  >>> Escribi el numero y presiona ENTER  (ej: 1): ");
        while (true) {
            String linea = sc.nextLine().trim();
            if (linea.isEmpty()) {
                System.out.print("  >>> Escribi un numero del 0 al 10  (ej: 1): ");
                continue;
            }
            try {
                return Integer.parseInt(linea);
            } catch (NumberFormatException e) {
                System.out.print("  [!] Eso no es un numero. Escribi del 0 al 10  (ej: 1): ");
            }
        }
    }

    // ==================================================================
    //  1. Registrar estudiante
    // ==================================================================
    private static void registrarEstudiante() {
        System.out.println(">>> Elegiste: [1] REGISTRAR ESTUDIANTE");
        System.out.println("    Ahora completa estos datos:\n");

        String nombre = pedirTexto("Nombre completo", "Juan Perez");
        String identificacion = pedirTexto("Numero de cedula", "1001234567");
        String telefono = pedirTexto("Telefono", "3001234567");
        String correo = pedirTexto("Correo institucional", "juan@udla.edu.co");
        String codigo = pedirTexto("Codigo estudiantil", "EST-001");

        estudiante = new Estudiante(identificacion, nombre, telefono, correo, codigo);
        System.out.println("\n[OK] Estudiante registrado correctamente:");
        System.out.println("     " + estudiante + "\n");
    }

    // ==================================================================
    //  2. Registrar motorista (+ moto)
    // ==================================================================
    private static void registrarMotorista() {
        System.out.println(">>> Elegiste: [2] REGISTRAR MOTORISTA + MOTO");
        System.out.println("    Primero, los datos del motorista:\n");

        String nombre = pedirTexto("Nombre completo", "Jhonatan Saavedra");
        String identificacion = pedirTexto("Numero de cedula", "1009876543");
        String telefono = pedirTexto("Telefono", "3209876543");
        String correo = pedirTexto("Correo institucional", "jhonatan@udla.edu.co");

        motorista = new Motorista(identificacion, nombre, telefono, correo);

        System.out.println("\n    Ahora, los datos de la MOTO:\n");
        String placa = pedirTexto("Placa de la moto", "ABC-12D");
        String marca = pedirTexto("Marca", "Yamaha");
        String modelo = pedirTexto("Modelo", "FZ 2.0");
        int cilindraje = pedirEntero("Cilindraje (numero)", 125);
        boolean soat = pedirSiNo("El SOAT esta vigente?  (s = si / n = no)", "s");
        String numeroSoat = pedirTexto("Numero de SOAT", "SOAT-2026-999");

        Moto moto = new Moto(placa, marca, modelo, cilindraje, soat, numeroSoat);
        motorista.registrarMoto(moto);
        motorista.seleccionarMotoActiva(placa);

        System.out.println("\n[OK] Motorista registrado correctamente:");
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

        System.out.println(">>> Elegiste: [3] PEDIR UN VIAJE\n");
        String origen = pedirTexto("Desde donde salis (origen)", "Campus Universidad");
        String destino = pedirTexto("A donde vas (destino)", "Barrio Centro");
        double tarifa = pedirDecimal("Cuanto pagas (tarifa)", 8000);

        boolean ok = estudiante.solicitarViaje(origen, destino, tarifa);
        if (ok) {
            Viaje v = ultimoViaje();
            System.out.println("\n[OK] Viaje pedido: " + v.getCodigoViaje()
                    + "  (" + origen + "  ->  " + destino + ",  $" + tarifa + ")\n");
        } else {
            System.out.println("\n[X] No se pudo pedir el viaje.\n");
        }
    }

    // ==================================================================
    //  4. Aceptar viaje
    // ==================================================================
    private static void aceptarViaje() {
        if (!hayMotorista()) return;
        System.out.println(">>> Elegiste: [4] ACEPTAR EL VIAJE");
        Viaje v = viajePendiente();
        if (v == null) return;

        boolean ok = motorista.aceptarViaje(v);
        System.out.println(ok
                ? "\n[OK] El motorista acepto el viaje " + v.getCodigoViaje() + "  (estado: " + v.getEstado() + ")\n"
                : "\n[X] No se pudo aceptar (revisa que la moto tenga SOAT vigente).\n");
    }

    // ==================================================================
    //  5. Iniciar viaje
    // ==================================================================
    private static void iniciarViaje() {
        System.out.println(">>> Elegiste: [5] INICIAR EL VIAJE");
        Viaje v = viajeActual();
        if (v == null) return;
        v.iniciarViaje();
        System.out.println("\n[OK] Viaje " + v.getCodigoViaje() + " INICIADO  (estado: " + v.getEstado() + ")\n");
    }

    // ==================================================================
    //  6. Finalizar viaje
    // ==================================================================
    private static void finalizarViaje() {
        System.out.println(">>> Elegiste: [6] FINALIZAR EL VIAJE");
        Viaje v = viajeActual();
        if (v == null) return;
        v.finalizarViaje();
        System.out.println("\n[OK] Viaje " + v.getCodigoViaje() + " FINALIZADO  (estado: " + v.getEstado() + ")\n");
    }

    // ==================================================================
    //  7. Reportar pago
    // ==================================================================
    private static void reportarPago() {
        System.out.println(">>> Elegiste: [7] REPORTAR PAGO");
        Viaje v = viajeActual();
        if (v == null) return;

        System.out.println("    Como paga el estudiante?");
        System.out.println("      1 = EFECTIVO");
        System.out.println("      2 = NEQUI");
        int m = pedirOpcionNumerica("   Escribi 1 o 2", 1);
        MetodoPago metodo = (m == 2) ? MetodoPago.NEQUI : MetodoPago.EFECTIVO;

        v.getPago().reportarPagoEstudiante(metodo);
        System.out.println("\n[OK] Pago reportado: $" + v.getPago().getValor()
                + "  (" + metodo + ")   estado: " + v.getPago().getEstado() + "\n");
    }

    // ==================================================================
    //  8. Confirmar pago
    // ==================================================================
    private static void confirmarPago() {
        System.out.println(">>> Elegiste: [8] CONFIRMAR PAGO");
        Viaje v = viajeActual();
        if (v == null) return;

        boolean ok = v.getPago().confirmarRecepcionMotorista();
        System.out.println(ok
                ? "\n[OK] El motorista confirmo que recibio el pago.  Estado: " + v.getPago().getEstado() + "\n"
                : "\n[X] No se pudo confirmar el pago.\n");
    }

    // ==================================================================
    //  9. Calificar
    // ==================================================================
    private static void calificar() {
        System.out.println(">>> Elegiste: [9] CALIFICAR EL VIAJE");
        Viaje v = viajeActual();
        if (v == null) return;

        System.out.println("    Quien califica?");
        System.out.println("      1 = ESTUDIANTE");
        System.out.println("      2 = MOTORISTA");
        int r = pedirOpcionNumerica("   Escribi 1 o 2", 1);
        String emisor = (r == 2) ? "MOTORISTA" : "ESTUDIANTE";

        double puntaje = pedirDecimal("Puntaje del 1.0 al 5.0", 5);
        String comentario = pedirTexto("Comentario", "Excelente servicio");

        try {
            Calificacion c = new Calificacion(puntaje, comentario, emisor);
            boolean agregada = false;
            if (v.getCalificaciones().size() < 2) {
                v.agregarCalificacion(c);
                agregada = true;
            }
            System.out.println(agregada
                    ? "\n[OK] Calificacion guardada: " + c.getPuntaje() + "/5 por " + emisor
                      + "  \"" + comentario + "\"\n"
                    : "\n[X] Este viaje ya tiene 2 calificaciones (el maximo).\n");
        } catch (IllegalArgumentException e) {
            System.out.println("\n[X] " + e.getMessage() + "\n");
        }
    }

    // ==================================================================
    // 10. Ver estado
    // ==================================================================
    private static void verEstado() {
        System.out.println(">>> Elegiste: [10] VER EL ESTADO\n");
        System.out.println("================ ESTADO ACTUAL ================");
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
                        + " | calificaciones=" + v.getCalificaciones().size());
            }
        } else {
            System.out.println("\nVIAJES: (todavia no pediste ninguno)");
        }
        System.out.println("===============================================\n");
    }

    // ==================================================================
    //  Helpers de navegación / estado
    // ==================================================================
    private static boolean hayEstudiante() {
        if (estudiante == null) {
            System.out.println("\n[!] Primero registra un estudiante:  elegi la opcion 1.\n");
            return false;
        }
        return true;
    }

    private static boolean hayMotorista() {
        if (motorista == null) {
            System.out.println("\n[!] Primero registra un motorista:  elegi la opcion 2.\n");
            return false;
        }
        return true;
    }

    private static Viaje ultimoViaje() {
        var lista = estudiante.getViajesSolicitados();
        return lista.isEmpty() ? null : lista.get(lista.size() - 1);
    }

    private static Viaje viajeActual() {
        if (!hayEstudiante()) return null;
        Viaje v = ultimoViaje();
        if (v == null) {
            System.out.println("\n[!] Todavia no pediste un viaje:  elegi la opcion 3.\n");
            return null;
        }
        return v;
    }

    private static Viaje viajePendiente() {
        for (Viaje v : estudiante.getViajesSolicitados()) {
            if (v.getEstado() == EstadoViaje.SOLICITADO) {
                return v;
            }
        }
        System.out.println("\n[!] No hay viajes esperando. Pide uno primero:  elegi la opcion 3.\n");
        return null;
    }

    // ==================================================================
    //  Helpers de entrada (con EJEMPLO)
    // ==================================================================
    private static String pedirTexto(String etiqueta, String ejemplo) {
        while (true) {
            System.out.print("  " + etiqueta + "  (ej: " + ejemplo + "):  ");
            String linea = sc.nextLine().trim();
            if (!linea.isEmpty()) {
                return linea;
            }
            System.out.println("  [!] No puede quedar vacio. Escribi algo, por ejemplo: " + ejemplo);
        }
    }

    private static int pedirEntero(String etiqueta, int porDefecto) {
        while (true) {
            System.out.print("  " + etiqueta + "  (ej: " + porDefecto + ",  si presionas ENTER queda " + porDefecto + "):  ");
            String linea = sc.nextLine().trim();
            if (linea.isEmpty()) {
                return porDefecto;
            }
            try {
                return Integer.parseInt(linea);
            } catch (NumberFormatException e) {
                System.out.println("  [!] Escribi solo numeros, por ejemplo: " + porDefecto);
            }
        }
    }

    private static int pedirOpcionNumerica(String etiqueta, int porDefecto) {
        while (true) {
            System.out.print("  " + etiqueta + "  (si presionas ENTER queda " + porDefecto + "):  ");
            String linea = sc.nextLine().trim();
            if (linea.isEmpty()) {
                return porDefecto;
            }
            try {
                return Integer.parseInt(linea);
            } catch (NumberFormatException e) {
                System.out.println("  [!] Escribi un numero, por ejemplo: " + porDefecto);
            }
        }
    }

    private static double pedirDecimal(String etiqueta, double ejemplo) {
        while (true) {
            System.out.print("  " + etiqueta + "  (ej: " + ejemplo + "):  ");
            String linea = sc.nextLine().trim().replace(",", ".");
            try {
                return Double.parseDouble(linea);
            } catch (NumberFormatException e) {
                System.out.println("  [!] Escribi un numero, por ejemplo: " + ejemplo);
            }
        }
    }

    private static boolean pedirSiNo(String etiqueta, String ejemplo) {
        while (true) {
            System.out.print("  " + etiqueta + "  (ej: " + ejemplo + "):  ");
            String linea = sc.nextLine().trim().toLowerCase();
            if (linea.equals("s") || linea.equals("si") || linea.equals("y")) {
                return true;
            }
            if (linea.equals("n") || linea.equals("no")) {
                return false;
            }
            System.out.println("  [!] Escribi 's' (si) o 'n' (no).");
        }
    }
}
