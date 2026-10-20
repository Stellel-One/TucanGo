package co.edu.uniamazonia.logica2.modelo;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pruebas Unitarias - Entidad Viaje")
public class ViajeTest {

    @Test
    @DisplayName("Debe crear viaje en estado SOLICITADO y vincular pago con tarifa inicial")
    void testCreacionViajeValido() {
        Viaje viaje = new Viaje("VIA-100", "Campus Porvenir", "Barrio Centro", 6000.0);

        assertEquals("VIA-100", viaje.getCodigoViaje());
        assertEquals("Campus Porvenir", viaje.getOrigen());
        assertEquals("Barrio Centro", viaje.getDestino());
        assertEquals(6000.0, viaje.getTarifa(), 0.001);
        assertEquals(EstadoViaje.SOLICITADO, viaje.getEstado());
        assertNotNull(viaje.getPago());
        assertEquals(6000.0, viaje.getPago().getValor(), 0.001);
        assertNotNull(viaje.getCalificaciones());
        assertTrue(viaje.getCalificaciones().isEmpty());
    }

    @Test
    @DisplayName("Debe lanzar excepción si la tarifa inicial es negativa")
    void testTarifaNegativaLanzaExcepcion() {
        assertThrows(IllegalArgumentException.class, () -> {
            new Viaje("VIA-101", "Campus", "Centro", -500.0);
        });
    }

    @Test
    @DisplayName("Actualizar tarifa actualiza también el valor del objeto Pago asociado")
    void testSetTarifaActualizaPago() {
        Viaje viaje = new Viaje("VIA-102", "Campus", "Terminal", 5000.0);
        viaje.setTarifa(7500.0);

        assertEquals(7500.0, viaje.getTarifa(), 0.001);
        assertEquals(7500.0, viaje.getPago().getValor(), 0.001);

        assertThrows(IllegalArgumentException.class, () -> viaje.setTarifa(-10.0));
    }

    @Test
    @DisplayName("Transiciones de ciclo de vida del viaje (SOLICITADO -> EN_CURSO -> FINALIZADO)")
    void testCicloDeVidaViaje() {
        Viaje viaje = new Viaje("VIA-103", "Campus", "Centro", 6000.0);

        viaje.iniciarViaje();
        assertEquals(EstadoViaje.EN_CURSO, viaje.getEstado());

        viaje.finalizarViaje();
        assertEquals(EstadoViaje.FINALIZADO, viaje.getEstado());
    }

    @Test
    @DisplayName("Debe permitir cancelar un viaje")
    void testCancelarViaje() {
        Viaje viaje = new Viaje("VIA-104", "Campus", "Centro", 6000.0);
        viaje.cancelarViaje();
        assertEquals(EstadoViaje.CANCELADO, viaje.getEstado());
    }

    @Test
    @DisplayName("Debe restringir el límite de calificaciones a máximo 2 (estudiante y motorista)")
    void testLimiteCalificaciones() {
        Viaje viaje = new Viaje("VIA-105", "Campus", "Centro", 6000.0);

        Calificacion c1 = new Calificacion(5.0, "Excelente", "ESTUDIANTE");
        Calificacion c2 = new Calificacion(4.5, "Puntual", "MOTORISTA");
        Calificacion c3 = new Calificacion(3.0, "Extra", "ESTUDIANTE");

        viaje.agregarCalificacion(c1);
        viaje.agregarCalificacion(c2);
        viaje.agregarCalificacion(c3); // No debe agregarse por límite de 2
        viaje.agregarCalificacion(null); // No debe fallar con nulo

        assertEquals(2, viaje.getCalificaciones().size());
        assertEquals(5.0, viaje.getCalificaciones().get(0).getPuntaje(), 0.001);
        assertEquals(4.5, viaje.getCalificaciones().get(1).getPuntaje(), 0.001);
    }
}

