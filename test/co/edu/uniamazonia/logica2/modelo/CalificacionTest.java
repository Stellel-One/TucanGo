package co.edu.uniamazonia.logica2.modelo;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pruebas Unitarias - Entidad Calificacion")
public class CalificacionTest {

    @Test
    @DisplayName("Debe instanciar correctamente con valores válidos dentro del rango [1.0, 5.0]")
    void testCrearCalificacionValida() {
        Calificacion c = new Calificacion(4.5, "Excelente servicio", "ESTUDIANTE");

        assertEquals(4.5, c.getPuntaje(), 0.001);
        assertEquals("Excelente servicio", c.getComentario());
        assertEquals("ESTUDIANTE", c.getRolEmisor());
        assertNotNull(c.getFechaHora());
    }

    @Test
    @DisplayName("Debe aceptar límites exactos 1.0 y 5.0")
    void testLimitesExactos() {
        Calificacion cMin = new Calificacion(1.0, "Servicio deficiente", "ESTUDIANTE");
        Calificacion cMax = new Calificacion(5.0, "Servicio perfecto", "MOTORISTA");

        assertEquals(1.0, cMin.obtenerPuntaje(), 0.001);
        assertEquals(5.0, cMax.obtenerPuntaje(), 0.001);
    }

    @ParameterizedTest
    @ValueSource(doubles = {0.99, 0.0, -1.0, -5.0, 5.01, 6.0, 10.0})
    @DisplayName("Debe lanzar IllegalArgumentException al intentar asignar puntaje fuera de [1.0, 5.0]")
    void testPuntajesInvalidosLanzanExcepcion(double puntajeInvalido) {
        assertThrows(IllegalArgumentException.class, () -> {
            new Calificacion(puntajeInvalido, "Comentario de prueba", "ESTUDIANTE");
        });
    }

    @Test
    @DisplayName("Debe lanzar excepción al actualizar puntaje con valor inválido vía setter")
    void testSetPuntajeInvalido() {
        Calificacion c = new Calificacion(3.0, "Regular", "MOTORISTA");
        assertThrows(IllegalArgumentException.class, () -> c.setPuntaje(5.5));
        assertEquals(3.0, c.getPuntaje(), 0.001);
    }

    @Test
    @DisplayName("Debe permitir registrar nueva calificación actualizando sus datos")
    void testRegistrarCalificacion() {
        Calificacion c = new Calificacion(3.0, "Inicial", "ESTUDIANTE");
        c.registrarCalificacion(4.8, "Mejorado", "ESTUDIANTE");

        assertEquals(4.8, c.getPuntaje(), 0.001);
        assertEquals("Mejorado", c.getComentario());
    }
}
