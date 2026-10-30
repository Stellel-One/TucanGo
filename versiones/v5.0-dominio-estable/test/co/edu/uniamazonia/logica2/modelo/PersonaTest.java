package co.edu.uniamazonia.logica2.modelo;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pruebas Unitarias - Jerarquía Persona y Actores")
public class PersonaTest {

    @Test
    @DisplayName("Estudiante: debe solicitar viaje y marcar llegada segura")
    void testEstudianteFlujoViaje() {
        Estudiante est = new Estudiante("111222333", "Laura Gómez", "3101234567", "l.gomez@uniamazonia.edu.co", "EST-2026-01");

        assertEquals("111222333", est.getIdentificacion());
        assertEquals("Laura Gómez", est.getNombre());
        assertEquals("EST-2026-01", est.getCodigoEstudiantil());

        // Solicitud válida
        boolean solicitada = est.solicitarViaje("Campus Porvenir", "Barrio Centro", 5000.0);
        assertTrue(solicitada);
        assertEquals(1, est.getViajesSolicitados().size());

        // Solicitud inválida (origen vacío o tarifa negativa)
        assertFalse(est.solicitarViaje("", "Barrio Centro", 5000.0));
        assertFalse(est.solicitarViaje("Campus", "Barrio Centro", -100.0));

        // Marcar llegada segura: el viaje debe estar en curso
        Viaje viaje = est.getViajesSolicitados().get(0);
        viaje.iniciarViaje();
        boolean llegada = est.marcarLlegadaSegura(viaje.getCodigoViaje());
        assertTrue(llegada);
        assertEquals(EstadoViaje.FINALIZADO, viaje.getEstado());
    }

    @Test
    @DisplayName("Motorista: gestión de múltiples motos y selección de moto activa")
    void testMotoristaMultiMotos() {
        Motorista motoquero = new Motorista("99887766", "Carlos Rojas", "3209876543", "c.rojas@uniamazonia.edu.co");

        assertTrue(motoquero.isDisponible());
        assertNull(motoquero.obtenerMotoActiva());

        Moto moto1 = new Moto("AAA-01A", "Yamaha", "Crypton", 115, true, "SOAT-01");
        Moto moto2 = new Moto("BBB-02B", "Honda", "XR 150", 150, true, "SOAT-02");

        motoquero.registrarMoto(moto1);
        motoquero.registrarMoto(moto2);

        // La primera moto registrada debe quedar activa automáticamente
        assertEquals(2, motoquero.getMotos().size());
        assertNotNull(motoquero.obtenerMotoActiva());
        assertEquals("AAA-01A", motoquero.obtenerMotoActiva().getPlaca());

        // Cambiar moto activa
        boolean cambiada = motoquero.seleccionarMotoActiva("BBB-02B");
        assertTrue(cambiada);
        assertEquals("BBB-02B", motoquero.obtenerMotoActiva().getPlaca());
        assertFalse(moto1.isActiva());
        assertTrue(moto2.isActiva());

        // Placa inexistente
        assertFalse(motoquero.seleccionarMotoActiva("ZZZ-99Z"));
    }

    @Test
    @DisplayName("Administrador: creación y asignación de rol")
    void testAdministradorRol() {
        Administrador admin = new Administrador("445566", "Coordinador Bienestar", "3150001122", "bienestar@uniamazonia.edu.co", RolAdmin.BIENESTAR_UNIVERSITARIO);

        assertEquals(RolAdmin.BIENESTAR_UNIVERSITARIO, admin.getRol());
        assertEquals("bienestar@uniamazonia.edu.co", admin.getCorreoInstitucional());
    }
}
