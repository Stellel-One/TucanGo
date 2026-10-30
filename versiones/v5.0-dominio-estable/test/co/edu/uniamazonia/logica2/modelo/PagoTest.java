package co.edu.uniamazonia.logica2.modelo;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pruebas Unitarias - Entidad Pago")
public class PagoTest {

    @Test
    @DisplayName("Debe inicializar pago con estado PENDIENTE y valor correcto")
    void testInicializacionPago() {
        Pago pago = new Pago(7000.0, MetodoPago.EFECTIVO);

        assertEquals(7000.0, pago.getValor(), 0.001);
        assertEquals(MetodoPago.EFECTIVO, pago.getMetodo());
        assertEquals(EstadoPago.PENDIENTE, pago.getEstado());
        assertFalse(pago.isPagadoPorEstudiante());
        assertFalse(pago.isConfirmadoPorMotorista());
        assertNotNull(pago.getFechaHora());
    }

    @Test
    @DisplayName("Debe lanzar excepción si el valor inicial del pago es negativo")
    void testValorNegativoLanzaExcepcion() {
        assertThrows(IllegalArgumentException.class, () -> new Pago(-100.0, MetodoPago.NEQUI));
    }

    @Test
    @DisplayName("Debe lanzar excepción si se intenta asignar valor negativo mediante setter")
    void testSetValorNegativoLanzaExcepcion() {
        Pago pago = new Pago(5000.0, MetodoPago.NEQUI);
        assertThrows(IllegalArgumentException.class, () -> pago.setValor(-50.0));
    }

    @Test
    @DisplayName("Flujo de reporte por estudiante y confirmación por motorista")
    void testFlujoPagoCompleto() {
        Pago pago = new Pago(8000.0, MetodoPago.EFECTIVO);

        // Estudiante reporta pago por Nequi
        pago.reportarPagoEstudiante(MetodoPago.NEQUI);
        assertEquals(MetodoPago.NEQUI, pago.getMetodo());
        assertTrue(pago.isPagadoPorEstudiante());
        assertEquals(EstadoPago.PAGADO_REPORTADO, pago.getEstado());

        // Motorista confirma recepción
        boolean confirmado = pago.confirmarRecepcionMotorista();
        assertTrue(confirmado);
        assertTrue(pago.isConfirmadoPorMotorista());
        assertEquals(EstadoPago.CONFIRMADO_RECIBIDO, pago.getEstado());
    }
}
