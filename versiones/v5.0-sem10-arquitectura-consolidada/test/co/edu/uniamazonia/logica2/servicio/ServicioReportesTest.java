package co.edu.uniamazonia.logica2.servicio;

import co.edu.uniamazonia.logica2.modelo.Viaje;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pruebas Unitarias - ServicioReportes")
public class ServicioReportesTest {

    private ServicioReportes reportes;

    @BeforeEach
    void setUp() {
        reportes = new ServicioReportes();
        reportes.registrarViaje(new Viaje("V-1", "Campus Porvenir", "Barrio Centro", 5000.0));
        reportes.registrarViaje(new Viaje("V-2", "Campus Porvenir", "Barrio Centro", 5000.0));
        reportes.registrarViaje(new Viaje("V-3", "Campus Porvenir", "Barrio Juan XXIII", 6000.0));
        reportes.registrarViaje(new Viaje("V-4", "Barrio Centro", "Campus Porvenir", 5000.0));
    }

    @Test
    @DisplayName("Debe listar destinos mas frecuentes ordenados por concurrencia")
    void testDestinosMasFrecuentes() {
        List<String> topDestinos = reportes.obtenerDestinosMasFrecuentes(2);

        assertNotNull(topDestinos);
        assertEquals(2, topDestinos.size());
        assertTrue(topDestinos.get(0).contains("Barrio Centro"));
        assertTrue(topDestinos.get(0).contains("2 viajes"));
    }

    @Test
    @DisplayName("Debe filtrar viajes por termino en el destino de forma insensible a mayusculas")
    void testConsultarViajesPorDestino() {
        List<Viaje> centro = reportes.consultarViajesPorDestino("centro");
        assertEquals(2, centro.size());

        List<Viaje> campus = reportes.consultarViajesPorDestino("PORVENIR");
        assertEquals(1, campus.size());

        List<Viaje> inexistente = reportes.consultarViajesPorDestino("Inexistente");
        assertTrue(inexistente.isEmpty());
    }

    @Test
    @DisplayName("Debe calcular correctamente el porcentaje de viajes hacia un sector especifico")
    void testCalcularPorcentajePorSector() {
        // Total 4 viajes: 2 con destino Centro y 1 con origen Centro -> 3/4 = 75%
        double porcentajeCentro = reportes.calcularPorcentajePorSector("Centro");
        assertEquals(75.0, porcentajeCentro, 0.01);

        // 1 hacia "Juan XXIII" -> 1/4 = 25%
        double porcentajeJuan = reportes.calcularPorcentajePorSector("Juan XXIII");
        assertEquals(25.0, porcentajeJuan, 0.01);
    }
}
