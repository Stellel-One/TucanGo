package co.edu.uniamazonia.logica2;

import co.edu.uniamazonia.logica2.modelo.Administrador;
import co.edu.uniamazonia.logica2.modelo.Calificacion;
import co.edu.uniamazonia.logica2.modelo.EstadoViaje;
import co.edu.uniamazonia.logica2.modelo.Estudiante;
import co.edu.uniamazonia.logica2.modelo.MetodoPago;
import co.edu.uniamazonia.logica2.modelo.Moto;
import co.edu.uniamazonia.logica2.modelo.Motorista;
import co.edu.uniamazonia.logica2.modelo.RolAdmin;
import co.edu.uniamazonia.logica2.modelo.Viaje;
import co.edu.uniamazonia.logica2.servicio.ServicioAutenticacion;
import co.edu.uniamazonia.logica2.servicio.ServicioReportes;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

/**
 * Simulador de Movilidad Estudiantil en Terminal (Estilo Uber / DiDi).
 * <p>
 * Diseñado para visualizarse y ejecutarse interactivamente desde la consola de Apache NetBeans
 * o terminal de comandos. Utiliza el modelo de dominio POO v5.0 de TucanGo.
 * </p>
 *
 * @author Equipo TucanGo · Universidad de la Amazonia
 * @version 5.0
 */
public class SimuladorUberCampus {

    private static final Scanner sc = new Scanner(System.in);

    // Servicios del Ecosistema
    private static final ServicioAutenticacion authService = new ServicioAutenticacion();
    private static final ServicioReportes reportesService = new ServicioReportes();

    // Flota de motoristas verificados y estudiantes del campus
    private static final List<Motorista> flotaMotoristas = new ArrayList<>();
    private static final List<Estudiante> estudiantesRegistrados = new ArrayList<>();
    private static Administrador adminBienestar;

    // Sesión activa actual
    private static Estudiante estudianteActivo;

    // Destinos frecuentes preconfigurados en Florencia, Caquetá
    private static final String[] PUNTOS_CAMPUS = {
            "Campus Porvenir (Entrada Principal)",
            "Campus Porvenir (Edificio de Aulas)",
            "Campus Centro (Sede Antigua)",
            "Barrio Centro (Parque Santander)",
            "Barrio Juan XXIII",
            "Terminal de Transportes de Florencia",
            "Avenida Circunvalar / Zona Rosa",
            "Barrio La Gloria"
    };

    public static void main(String[] args) {
        inicializarEcosistema();
        mostrarBanner();

        boolean salir = false;
        while (!salir) {
            mostrarMenuPrincipal();
            int op = leerEntero(0, 6);
            System.out.println();
            switch (op) {
                case 1 -> pedirViajeEstiloUber();
                case 2 -> panelConductor();
                case 3 -> ejecutarDemoAutomatizadaEnVivo();
                case 4 -> panelBienestarUniversitario();
                case 5 -> gestionarMotosFlota();
                case 6 -> cambiarEstudianteActivo();
                case 0 -> {
                    System.out.println("===============================================================");
                    System.out.println("  Gracias por utilizar TucanGo. ¡Movilidad segura en el campus!");
                    System.out.println("===============================================================\n");
                    salir = true;
                }
            }
        }
    }

    // ==================================================================
    // 1. INICIALIZACIÓN DE DATOS PRECARGADOS (FLOTA Y SERVICIOS)
    // ==================================================================
    private static void inicializarEcosistema() {
        // Motorista 1: Jhonatan Saavedra
        Motorista m1 = new Motorista("1117540101", "Jhonatan Saavedra", "3209876543", "j.saavedra@udla.edu.co");
        Moto moto1 = new Moto("ABC-12D", "Yamaha", "FZ 2.0", 150, true, "SOAT-2026-991");
        Moto moto1b = new Moto("MOT-99A", "Bajaj", "Pulsar NS 200", 200, true, "SOAT-2026-992");
        m1.registrarMoto(moto1);
        m1.registrarMoto(moto1b);
        m1.seleccionarMotoActiva("ABC-12D");
        flotaMotoristas.add(m1);
        authService.registrarse(m1, "moto123");

        // Motorista 2: Carlos Morales
        Motorista m2 = new Motorista("1117540102", "Carlos Morales", "3123456789", "c.morales@udla.edu.co");
        Moto moto2 = new Moto("XYZ-89E", "Suzuki", "GN 125", 125, true, "SOAT-2026-888");
        m2.registrarMoto(moto2);
        m2.seleccionarMotoActiva("XYZ-89E");
        flotaMotoristas.add(m2);
        authService.registrarse(m2, "moto456");

        // Motorista 3: Andrea Gomez
        Motorista m3 = new Motorista("1117540103", "Andrea Gomez", "3158765432", "a.gomez@udla.edu.co");
        Moto moto3 = new Moto("KLS-33F", "Honda", "CB 160F", 160, true, "SOAT-2026-777");
        m3.registrarMoto(moto3);
        m3.seleccionarMotoActiva("KLS-33F");
        flotaMotoristas.add(m3);
        authService.registrarse(m3, "moto789");

        // Estudiantes iniciales
        Estudiante e1 = new Estudiante("1117540201", "Gian Marco Castañeda", "3101234567", "g.castaneda@udla.edu.co", "EST-2026-001");
        Estudiante e2 = new Estudiante("1117540202", "Andrés David Pinilla", "3119876543", "a.pinilla@udla.edu.co", "EST-2026-002");
        Estudiante e3 = new Estudiante("1117540203", "Juan Guillermo Ferrer", "3145556677", "j.ferrer@udla.edu.co", "EST-2026-003");
        estudiantesRegistrados.add(e1);
        estudiantesRegistrados.add(e2);
        estudiantesRegistrados.add(e3);
        for (Estudiante e : estudiantesRegistrados) {
            authService.registrarse(e, "est123");
        }

        estudianteActivo = e1;

        // Administrador de Bienestar Universitario
        adminBienestar = new Administrador("1117540301", "Dra. Maria Elena Perez", "3184445566", "bienestar@udla.edu.co", RolAdmin.BIENESTAR_UNIVERSITARIO);
        authService.registrarse(adminBienestar, "admin123");

        // Precargar viajes históricos para el Servicio de Reportes
        precargarHistoricoViajes();
    }

    private static void precargarHistoricoViajes() {
        Viaje v1 = new Viaje("HIST-01", "Campus Porvenir", "Barrio Centro", 5000.0);
        v1.iniciarViaje();
        v1.finalizarViaje();
        v1.getPago().reportarPagoEstudiante(MetodoPago.NEQUI);
        v1.getPago().confirmarRecepcionMotorista();

        Viaje v2 = new Viaje("HIST-02", "Campus Porvenir", "Barrio Juan XXIII", 4500.0);
        v2.iniciarViaje();
        v2.finalizarViaje();
        v2.getPago().reportarPagoEstudiante(MetodoPago.EFECTIVO);
        v2.getPago().confirmarRecepcionMotorista();

        Viaje v3 = new Viaje("HIST-03", "Campus Centro", "Campus Porvenir", 4000.0);
        v3.iniciarViaje();
        v3.finalizarViaje();

        Viaje v4 = new Viaje("HIST-04", "Campus Porvenir", "Barrio Centro", 5000.0);
        v4.iniciarViaje();
        v4.finalizarViaje();

        reportesService.registrarViaje(v1);
        reportesService.registrarViaje(v2);
        reportesService.registrarViaje(v3);
        reportesService.registrarViaje(v4);
    }

    // ==================================================================
    // 2. INTERFAZ GRÁFICA DE TERMINAL
    // ==================================================================
    private static void mostrarBanner() {
        System.out.println("===============================================================");
        System.out.println("  _____ _   _  ____    _    _   _  ____  ___               ");
        System.out.println(" |_   _| | | |/ ___|  / \\  | \\ | |/ ___|/ _ \\             ");
        System.out.println("   | | | | | | |     / _ \\ |  \\| | |  _| | | |             ");
        System.out.println("   | | | |_| | |___ / ___ \\| |\\  | |_| | |_| |             ");
        System.out.println("   |_|  \\___/ \\____/_/   \\_\\_| \\_|\\____|\\___/              ");
        System.out.println("  MOVILIDAD ESTUDIANTIL SEGURA · UNIVERSIDAD DE LA AMAZONIA   ");
        System.out.println("===============================================================");
    }

    private static void mostrarMenuPrincipal() {
        System.out.println("\n+-------------------------------------------------------------+");
        System.out.println("| SESION ACTIVA: " + padRight(estudianteActivo.getNombre() + " (" + estudianteActivo.getCodigoEstudiantil() + ")", 44) + "|");
        System.out.println("+-------------------------------------------------------------+");
        System.out.println("|  1. [MODO PASAJERO] Pedir viaje estilo Uber / DiDi          |");
        System.out.println("|  2. [MODO CONDUCTOR] Panel de motorista (Aceptar viajes)    |");
        System.out.println("|  3. [DEMO EN VIVO] Simulación completa automática (1-Clic)  |");
        System.out.println("|  4. [BIENESTAR UNIV.] Métricas y demanda de movilidad       |");
        System.out.println("|  5. [FLOTA & VEHÍCULOS] Ver motos y validación SOAT         |");
        System.out.println("|  6. [CAMBIAR USUARIO] Alternar o registrar estudiante       |");
        System.out.println("|  0. Salir                                                   |");
        System.out.println("+-------------------------------------------------------------+");
        System.out.print(">>> Ingrese una opción [0 - 6]: ");
    }

    // ==================================================================
    // 3. FLUJO PRINCIPAL ESTILO UBER / DIDI
    // ==================================================================
    private static void pedirViajeEstiloUber() {
        System.out.println("\n===============================================================");
        System.out.println("              SOLICITUD DE VIAJE ESTILO UBER/DIDI              ");
        System.out.println("===============================================================");

        // Paso A: Punto de Partida
        System.out.println("\n--- [Paso 1/5] Selecciona tu Punto de Recogida (Origen) ---");
        for (int i = 0; i < PUNTOS_CAMPUS.length; i++) {
            System.out.println("  " + (i + 1) + ". " + PUNTOS_CAMPUS[i]);
        }
        System.out.println("  9. Escribir otro origen personalizado");
        System.out.print(">>> Elige tu origen [1 - 9]: ");
        int opOrigen = leerEntero(1, 9);
        String origen = (opOrigen == 9) ? pedirTexto("Escribe tu ubicación exacta") : PUNTOS_CAMPUS[opOrigen - 1];

        // Paso B: Destino
        System.out.println("\n--- [Paso 2/5] ¿Hacia dónde te diriges? (Destino) ---");
        for (int i = 0; i < PUNTOS_CAMPUS.length; i++) {
            System.out.println("  " + (i + 1) + ". " + PUNTOS_CAMPUS[i]);
        }
        System.out.println("  9. Escribir otro destino personalizado");
        System.out.print(">>> Elige tu destino [1 - 9]: ");
        int opDestino = leerEntero(1, 9);
        String destino = (opDestino == 9) ? pedirTexto("Escribe tu destino exacto") : PUNTOS_CAMPUS[opDestino - 1];

        // Paso C: Cálculo de Tarifa Estimada
        double tarifaBase = calcularTarifaEstimada(origen, destino);
        System.out.println("\n--- [Paso 3/5] Estimación de Tarifa Inteligente ---");
        System.out.println("  Ruta calculada: " + origen + "  -->  " + destino);
        System.out.println("  Tarifa sugerida por TucanGo: $" + String.format("%,.0f", tarifaBase) + " COP");
        System.out.println("  1. Aceptar tarifa sugerida ($" + String.format("%,.0f", tarifaBase) + ")");
        System.out.println("  2. Proponer contraoferta (Estilo DiDi / InDrive)");
        System.out.print(">>> Elige [1 o 2]: ");
        int opTarifa = leerEntero(1, 2);
        double tarifaFinal = tarifaBase;
        if (opTarifa == 2) {
            tarifaFinal = pedirDecimalPositivo("Ingresa tu oferta en COP (ej: 5000): ", 3000);
        }

        // Registrar viaje en estado SOLICITADO
        String codViaje = "TUCAN-" + (estudianteActivo.getViajesSolicitados().size() + 101);
        Viaje viaje = new Viaje(codViaje, origen, destino, tarifaFinal);
        estudianteActivo.getViajesSolicitados().add(viaje);
        reportesService.registrarViaje(viaje);

        // Paso D: Radar de Motoristas Cercanos (Matching)
        System.out.println("\n--- [Paso 4/5] Conectando con Motoristas del Campus ---");
        System.out.println("  [📡] Buscando motoristas activos con SOAT vigente en el perímetro...");
        pausaAnimada(1200);

        List<Motorista> disponibles = obtenerMotoristasDisponibles();
        if (disponibles.isEmpty()) {
            System.out.println("  [!] En este momento no hay motoristas con documentos vigentes disponibles.");
            return;
        }

        System.out.println("\n  ¡" + disponibles.size() + " motoristas encontrados cerca de ti!");
        for (int i = 0; i < disponibles.size(); i++) {
            Motorista m = disponibles.get(i);
            Moto moto = m.obtenerMotoActiva();
            System.out.println("    (" + (i + 1) + ") " + padRight(m.getNombre(), 20)
                    + " | Moto: " + moto.getMarca() + " " + moto.getModelo() + " [" + moto.getPlaca() + "]"
                    + " | SOAT: VIGENTE (✓)");
        }

        // Selección o asignación automática
        Motorista motoristaAsignado = disponibles.get(0);
        motoristaAsignado.aceptarViaje(viaje);
        System.out.println("\n  ✅ ¡Servicio Aceptado por " + motoristaAsignado.getNombre() + "!");
        System.out.println("  Vehículo asignado: " + motoristaAsignado.obtenerMotoActiva().getMarca()
                + " " + motoristaAsignado.obtenerMotoActiva().getModelo()
                + " | Placa: " + motoristaAsignado.obtenerMotoActiva().getPlaca());
        System.out.println("  Estado del Viaje: " + viaje.getEstado());

        // Paso E: Iniciar Ruta y Simular Tracking GPS
        System.out.println("\n--- [Paso 5/5] En Ruta y Seguimiento en Tiempo Real ---");
        viaje.iniciarViaje();
        simularRutaGPS(origen, destino);

        // Llegada segura
        estudianteActivo.marcarLlegadaSegura(viaje.getCodigoViaje());
        System.out.println("\n  [✓] Estudiante confirmó: ¡LLEGADA SEGURA AL DESTINO!");
        System.out.println("  Estado del Viaje: " + viaje.getEstado());

        // Liquidación del Pago
        procesarPagoInteractivo(viaje, motoristaAsignado);

        // Calificación Mutua
        procesarCalificacionMutua(viaje, motoristaAsignado);
    }

    // ==================================================================
    // 4. ANIMACIÓN DE RUTA EN CONSOLA (TRACKING GPS)
    // ==================================================================
    private static void simularRutaGPS(String origen, String destino) {
        System.out.println("\n  ================ SEGUIMIENTO EN VIVO ================");
        String[] etapas = {
                "[Campus]   >---o-------------------< [Destino]  (Iniciando recorrido)",
                "[Campus]   >-------o---------------< [Destino]  (En ruta - velocidad moderada)",
                "[Campus]   >---------------o-------< [Destino]  (Próximo al punto de llegada)",
                "[Campus]   >-----------------------o [Destino]  (¡Has llegado a tu destino!)"
        };

        for (String etapa : etapas) {
            System.out.println("   " + etapa);
            pausaAnimada(700);
        }
        System.out.println("  =====================================================");
    }

    // ==================================================================
    // 5. PROCESAMIENTO DE PAGO
    // ==================================================================
    private static void procesarPagoInteractivo(Viaje viaje, Motorista motorista) {
        System.out.println("\n---------------------------------------------------------------");
        System.out.println("                       PASARELA DE PAGO                        ");
        System.out.println("---------------------------------------------------------------");
        System.out.println("  Total a liquidar: $" + String.format("%,.0f", viaje.getTarifa()) + " COP");
        System.out.println("  1. Pago en EFECTIVO (Contraentrega)");
        System.out.println("  2. Transferencia NEQUI (Transacción Digital Inmediata)");
        System.out.print(">>> Seleccione el método de pago [1 o 2]: ");
        int metodoOp = leerEntero(1, 2);

        MetodoPago metodo = (metodoOp == 2) ? MetodoPago.NEQUI : MetodoPago.EFECTIVO;
        viaje.getPago().reportarPagoEstudiante(metodo);

        if (metodo == MetodoPago.NEQUI) {
            System.out.println("\n  [NEQUI] Enviar $" + String.format("%,.0f", viaje.getTarifa()) + " al número: " + motorista.getTelefono());
            System.out.println("  Generando comprobante digital...");
            pausaAnimada(600);
            System.out.println("  Transacción NEQ-2026-" + ((int) (Math.random() * 9000) + 1000) + " enviada exitosamente.");
        } else {
            System.out.println("\n  [EFECTIVO] Entrega el importe exacto al motorista verificado.");
        }

        System.out.println("  Estado actual del pago: " + viaje.getPago().getEstado());
        pausaAnimada(600);

        // El conductor confirma la recepción
        boolean confirmado = viaje.getPago().confirmarRecepcionMotorista();
        if (confirmado) {
            System.out.println("  [✓] Motorista " + motorista.getNombre() + " confirmó la recepción del dinero.");
            System.out.println("  Estado final del pago: " + viaje.getPago().getEstado());
        }
    }

    // ==================================================================
    // 6. CALIFICACIÓN BIDIRECCIONAL
    // ==================================================================
    private static void procesarCalificacionMutua(Viaje viaje, Motorista motorista) {
        System.out.println("\n---------------------------------------------------------------");
        System.out.println("              SISTEMA DE CALIFICACIÓN Y REPUTACIÓN             ");
        System.out.println("---------------------------------------------------------------");

        // 1. Estudiante califica a Motorista
        System.out.println("\n  [Estudiante -> Motorista]");
        System.out.print("  Califica el servicio de " + motorista.getNombre() + " (1.0 a 5.0 estrellas): ");
        double puntajeEst = leerDoubleRango(1.0, 5.0);
        String comentarioEst = pedirTexto("Comentario sobre seguridad y experiencia");
        Calificacion calEst = new Calificacion(puntajeEst, comentarioEst, "ESTUDIANTE");
        viaje.agregarCalificacion(calEst);

        // 2. Motorista califica a Estudiante (Simulación automática o personalizada)
        System.out.println("\n  [Motorista -> Estudiante]");
        System.out.println("  El motorista " + motorista.getNombre() + " te ha calificado con 5.0 ★");
        Calificacion calMot = new Calificacion(5.0, "Excelente pasajero, puntual y respetuoso.", "MOTORISTA");
        viaje.agregarCalificacion(calMot);

        System.out.println("\n  [✓] Calificaciones registradas en el historial del viaje (" + viaje.getCalificaciones().size() + "/2).");
    }

    // ==================================================================
    // 7. DEMOSTRACIÓN AUTOMÁTICA EN VIVO (1-CLIC)
    // ==================================================================
    private static void ejecutarDemoAutomatizadaEnVivo() {
        System.out.println("\n===============================================================");
        System.out.println("         DEMO AUTOMÁTICA EN VIVO - RECORRIDO TUCANGO           ");
        System.out.println("===============================================================");
        System.out.println("  Iniciando simulación interactiva completa...");
        pausaAnimada(800);

        Estudiante estudiante = estudiantesRegistrados.get(0);
        Motorista motorista = flotaMotoristas.get(0);
        String origen = "Campus Porvenir (Entrada Principal)";
        String destino = "Barrio Centro (Parque Santander)";
        double tarifa = 5000.0;

        System.out.println("  1. Estudiante: " + estudiante.getNombre() + " solicita moto.");
        System.out.println("     Ruta: " + origen + " --> " + destino + " | Tarifa: $" + tarifa);
        Viaje viaje = new Viaje("DEMO-LIVE-99", origen, destino, tarifa);
        estudiante.getViajesSolicitados().add(viaje);
        reportesService.registrarViaje(viaje);

        pausaAnimada(600);
        System.out.println("  2. Motorista: " + motorista.getNombre() + " acepta la solicitud.");
        System.out.println("     Moto: " + motorista.obtenerMotoActiva().getMarca() + " | Placa: " + motorista.obtenerMotoActiva().getPlaca());
        motorista.aceptarViaje(viaje);

        pausaAnimada(600);
        System.out.println("  3. Viaje en curso con seguimiento en tiempo real:");
        simularRutaGPS(origen, destino);

        pausaAnimada(500);
        estudiante.marcarLlegadaSegura(viaje.getCodigoViaje());
        System.out.println("  4. Estudiante confirma llegada segura -> Estado: " + viaje.getEstado());

        pausaAnimada(500);
        viaje.getPago().reportarPagoEstudiante(MetodoPago.NEQUI);
        viaje.getPago().confirmarRecepcionMotorista();
        System.out.println("  5. Pago confirmado vía Nequi -> Estado: " + viaje.getPago().getEstado());

        pausaAnimada(500);
        viaje.agregarCalificacion(new Calificacion(5.0, "Manejo impecable y casco reglamentario.", "ESTUDIANTE"));
        viaje.agregarCalificacion(new Calificacion(5.0, "Pasajero puntual.", "MOTORISTA"));
        System.out.println("  6. Reputación mutua consolidada: 5.0 ★");

        System.out.println("\n  ===========================================================");
        System.out.println("   ¡DEMOSTRACIÓN FINALIZADA CON ÉXITO! Todos los objetos POO ");
        System.out.println("   colaboraron según el diseño arquitectónico de TucanGo.    ");
        System.out.println("  ===========================================================");
    }

    // ==================================================================
    // 8. PANEL DE BIENESTAR UNIVERSITARIO (REPORTES Y DEMANDA)
    // ==================================================================
    private static void panelBienestarUniversitario() {
        System.out.println("\n===============================================================");
        System.out.println("          PANEL DE BIENESTAR UNIVERSITARIO Y REPORTES          ");
        System.out.println("          Auditoría de Demanda y Trazabilidad del Campus       ");
        System.out.println("===============================================================");
        adminBienestar.consultarReportesDemanda();

        List<String> destinosFrecuentes = reportesService.obtenerDestinosMasFrecuentes(5);
        System.out.println("\n  [Top Destinos Más Concurridos desde el Campus]");
        if (destinosFrecuentes.isEmpty()) {
            System.out.println("    No hay registros de viajes aún.");
        } else {
            for (int i = 0; i < destinosFrecuentes.size(); i++) {
                System.out.println("    " + (i + 1) + ". " + destinosFrecuentes.get(i));
            }
        }

        System.out.println("\n  [Distribución Porcentual por Zonas del Municipio]");
        mostrarBarraPorcentual("Centro", reportesService.calcularPorcentajePorSector("Centro"));
        mostrarBarraPorcentual("Juan XXIII", reportesService.calcularPorcentajePorSector("Juan XXIII"));
        mostrarBarraPorcentual("Porvenir", reportesService.calcularPorcentajePorSector("Porvenir"));

        System.out.println("\n  Total de viajes registrados en el sistema: " + reportesService.getHistoricoViajes().size());
    }

    private static void mostrarBarraPorcentual(String sector, double porcentaje) {
        int bloques = (int) Math.round(porcentaje / 5.0);
        StringBuilder barra = new StringBuilder();
        for (int i = 0; i < 20; i++) {
            barra.append(i < bloques ? "#" : "-");
        }
        System.out.println("    " + padRight(sector, 14) + " [" + barra + "] " + String.format("%.1f", porcentaje) + "%");
    }

    // ==================================================================
    // 9. PANEL DE CONDUCTOR Y GESTIÓN DE FLOTA
    // ==================================================================
    private static void panelConductor() {
        System.out.println("\n===============================================================");
        System.out.println("                      PANEL DE MOTORISTA                       ");
        System.out.println("===============================================================");
        for (int i = 0; i < flotaMotoristas.size(); i++) {
            System.out.println("  " + (i + 1) + ". " + flotaMotoristas.get(i).getNombre()
                    + " (" + (flotaMotoristas.get(i).isDisponible() ? "DISPONIBLE" : "OCUPADO") + ")");
        }
        System.out.print(">>> Seleccione el motorista a gestionar [1 - " + flotaMotoristas.size() + "]: ");
        int op = leerEntero(1, flotaMotoristas.size());
        Motorista m = flotaMotoristas.get(op - 1);

        System.out.println("\n  Motorista: " + m.getNombre());
        System.out.println("  Teléfono: " + m.getTelefono());
        System.out.println("  Moto activa: " + (m.obtenerMotoActiva() != null ? m.obtenerMotoActiva().getPlaca() : "Ninguna"));
        System.out.println("  Documentos verificados (SOAT): " + (m.verificarDocumentos() ? "VÁLIDOS (✓)" : "INVÁLIDOS (X)"));

        System.out.println("\n  1. Cambiar estado de disponibilidad");
        System.out.println("  2. Seleccionar otra moto de su flota");
        System.out.println("  3. Volver al menú principal");
        System.out.print(">>> Ingrese opción [1 - 3]: ");
        int accion = leerEntero(1, 3);
        if (accion == 1) {
            m.registrarDisponibilidad(!m.isDisponible());
            System.out.println("  [OK] Nueva disponibilidad: " + (m.isDisponible() ? "DISPONIBLE" : "NO DISPONIBLE"));
        } else if (accion == 2) {
            if (m.getMotos().size() <= 1) {
                System.out.println("  Este motorista solo tiene 1 moto registrada.");
            } else {
                for (Moto moto : m.getMotos()) {
                    System.out.println("   - Placa: " + moto.getPlaca() + " | " + moto.getMarca() + " | Activa: " + moto.isActiva());
                }
                String placaSel = pedirTexto("Ingrese la placa a activar");
                boolean selOk = m.seleccionarMotoActiva(placaSel);
                System.out.println(selOk ? "  [OK] Moto activa actualizada." : "  [!] Placa no encontrada.");
            }
        }
    }

    private static void gestionarMotosFlota() {
        System.out.println("\n===============================================================");
        System.out.println("             INSPECCIÓN DE FLOTA Y SEGUROS SOAT               ");
        System.out.println("===============================================================");
        for (Motorista m : flotaMotoristas) {
            System.out.println("\n  Conductor: " + m.getNombre());
            for (Moto moto : m.getMotos()) {
                System.out.println("    * Placa: " + padRight(moto.getPlaca(), 9)
                        + " | Marca: " + padRight(moto.getMarca() + " " + moto.getModelo(), 18)
                        + " | Cilindraje: " + moto.getCilindraje() + "cc"
                        + " | SOAT: " + (moto.validarSoat() ? "VIGENTE (" + moto.getNumeroSoat() + ")" : "VENCIDO/INVÁLIDO")
                        + " | Activa: " + (moto.isActiva() ? "SI" : "NO"));
            }
        }
    }

    private static void cambiarEstudianteActivo() {
        System.out.println("\n===============================================================");
        System.out.println("                 SELECCIONAR / REGISTRAR ESTUDIANTE             ");
        System.out.println("===============================================================");
        for (int i = 0; i < estudiantesRegistrados.size(); i++) {
            Estudiante e = estudiantesRegistrados.get(i);
            System.out.println("  " + (i + 1) + ". " + e.getNombre() + " (" + e.getCodigoEstudiantil() + ")");
        }
        System.out.println("  " + (estudiantesRegistrados.size() + 1) + ". Registrar nuevo estudiante");
        System.out.print(">>> Seleccione [1 - " + (estudiantesRegistrados.size() + 1) + "]: ");
        int op = leerEntero(1, estudiantesRegistrados.size() + 1);

        if (op <= estudiantesRegistrados.size()) {
            estudianteActivo = estudiantesRegistrados.get(op - 1);
            System.out.println("  [OK] Sesión cambiada a: " + estudianteActivo.getNombre());
        } else {
            String nombre = pedirTexto("Nombre completo del estudiante");
            String cedula = pedirTexto("Cédula de ciudadanía");
            String telefono = pedirTexto("Teléfono móvil");
            String correo = pedirTexto("Correo institucional (@udla.edu.co)");
            String codigo = pedirTexto("Código estudiantil");

            Estudiante nuevo = new Estudiante(cedula, nombre, telefono, correo, codigo);
            estudiantesRegistrados.add(nuevo);
            authService.registrarse(nuevo, "pass123");
            estudianteActivo = nuevo;
            System.out.println("  [OK] Estudiante registrado e ingresado como sesión activa.");
        }
    }

    // ==================================================================
    // 10. MÉTODOS AUXILIARES Y VALIDACIONES
    // ==================================================================
    private static double calcularTarifaEstimada(String origen, String destino) {
        if (origen.equalsIgnoreCase(destino)) {
            return 3000.0;
        }
        if ((origen.contains("Campus Porvenir") && destino.contains("Centro")) ||
            (origen.contains("Centro") && destino.contains("Campus Porvenir"))) {
            return 5000.0;
        }
        if (destino.contains("Terminal") || origen.contains("Terminal")) {
            return 6000.0;
        }
        if (destino.contains("Juan XXIII") || origen.contains("Juan XXIII")) {
            return 4500.0;
        }
        return 4000.0;
    }

    private static List<Motorista> obtenerMotoristasDisponibles() {
        List<Motorista> disponibles = new ArrayList<>();
        for (Motorista m : flotaMotoristas) {
            if (m.isDisponible() && m.verificarDocumentos()) {
                disponibles.add(m);
            }
        }
        return disponibles;
    }

    private static void pausaAnimada(int ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ignored) {
            Thread.currentThread().interrupt();
        }
    }

    private static String padRight(String s, int n) {
        return String.format("%-" + n + "s", s);
    }

    private static int leerEntero(int min, int max) {
        while (true) {
            String line = sc.nextLine().trim();
            try {
                int val = Integer.parseInt(line);
                if (val >= min && val <= max) {
                    return val;
                }
            } catch (NumberFormatException ignored) {}
            System.out.print("  [!] Ingrese un valor válido entre " + min + " y " + max + ": ");
        }
    }

    private static double leerDoubleRango(double min, double max) {
        while (true) {
            String line = sc.nextLine().trim().replace(",", ".");
            try {
                double val = Double.parseDouble(line);
                if (val >= min && val <= max) {
                    return val;
                }
            } catch (NumberFormatException ignored) {}
            System.out.print("  [!] Ingrese un número entre " + min + " y " + max + ": ");
        }
    }

    private static double pedirDecimalPositivo(String mensaje, double porDefecto) {
        System.out.print("  " + mensaje);
        while (true) {
            String line = sc.nextLine().trim().replace(",", ".");
            if (line.isEmpty()) {
                return porDefecto;
            }
            try {
                double val = Double.parseDouble(line);
                if (val > 0) return val;
            } catch (NumberFormatException ignored) {}
            System.out.print("  [!] Ingrese un monto positivo: ");
        }
    }

    private static String pedirTexto(String etiqueta) {
        System.out.print("  " + etiqueta + ": ");
        while (true) {
            String line = sc.nextLine().trim();
            if (!line.isEmpty()) {
                return line;
            }
            System.out.print("  [!] No puede ser vacío. " + etiqueta + ": ");
        }
    }
}
