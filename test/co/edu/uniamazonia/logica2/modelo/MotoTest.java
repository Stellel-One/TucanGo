package co.edu.uniamazonia.logica2.modelo;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pruebas Unitarias - Entidad Moto")
public class MotoTest {

    @Test
    @DisplayName("Debe inicializar moto con atributos correctos")
    void testCrearMotoValida() {
        Moto moto = new Moto("XYZ-12C", "Yamaha", "FZ 2.0", 150, true, "SOAT-998877");

        assertEquals("XYZ-12C", moto.getPlaca());
        assertEquals("Yamaha", moto.getMarca());
        assertEquals("FZ 2.0", moto.getModelo());
        assertEquals(150, moto.getCilindraje());
        assertTrue(moto.isSoatVigente());
        assertEquals("SOAT-998877", moto.getNumeroSoat());
        assertFalse(moto.isActiva());
        assertTrue(moto.validarSoat());
    }

    @ParameterizedTest
    @ValueSource(ints = {0, -1, -125})
    @DisplayName("Debe lanzar excepción si el cilindraje es menor o igual a cero")
    void testCilindrajeInvalidoLanzaExcepcion(int cilindrajeInvalido) {
        assertThrows(IllegalArgumentException.class, () -> {
            new Moto("XYZ-12C", "Yamaha", "FZ", cilindrajeInvalido, true, "SOAT-123");
        });
    }

    @Test
    @DisplayName("Debe invalidar SOAT si soatVigente es false o número está vacío/nulo")
    void testValidacionSoatInvalido() {
        Moto motoSoatVencido = new Moto("ABC-01A", "Bajaj", "Pulsar", 180, false, "SOAT-111");
        assertFalse(motoSoatVencido.validarSoat());

        Moto motoSinNumero = new Moto("ABC-02B", "Bajaj", "Boxer", 100, true, "   ");
        assertFalse(motoSinNumero.validarSoat());

        Moto motoNumeroNulo = new Moto("ABC-03C", "Honda", "CB125", 125, true, null);
        assertFalse(motoNumeroNulo.validarSoat());
    }
}
