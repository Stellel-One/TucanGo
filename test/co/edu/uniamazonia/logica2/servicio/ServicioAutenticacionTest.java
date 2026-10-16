package co.edu.uniamazonia.logica2.servicio;

import co.edu.uniamazonia.logica2.modelo.Estudiante;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pruebas Unitarias - ServicioAutenticacion")
public class ServicioAutenticacionTest {

    private ServicioAutenticacion auth;
    private Estudiante estudiante;

    @BeforeEach
    void setUp() {
        auth = new ServicioAutenticacion();
        estudiante = new Estudiante("100200300", "Ana Pérez", "3112223344", "a.perez@uniamazonia.edu.co", "EST-2026-99");
    }

    @Test
    @DisplayName("Debe registrar usuario correctamente e impedir duplicados")
    void testRegistroUsuario() {
        boolean registrado = auth.registrarse(estudiante, "claveSegura123");
        assertTrue(registrado);

        // Intento de registrar de nuevo el mismo correo
        boolean duplicado = auth.registrarse(estudiante, "otraClave");
        assertFalse(duplicado);
    }

    @Test
    @DisplayName("Debe rechazar registros con datos nulos o vacíos")
    void testRegistroInvalido() {
        assertFalse(auth.registrarse(null, "clave123"));
        assertFalse(auth.registrarse(estudiante, "   "));

        Estudiante sinCorreo = new Estudiante("555", "Sin Correo", "300", null, "EST-0");
        assertFalse(auth.registrarse(sinCorreo, "clave123"));
    }

    @Test
    @DisplayName("Flujo de login, verificación de sesión y cierre de sesión")
    void testFlujoSesion() {
        auth.registrarse(estudiante, "secreto");

        // Credenciales incorrectas
        assertFalse(auth.iniciarSesion("a.perez@uniamazonia.edu.co", "claveErronea"));
        assertFalse(auth.estaAutenticado(estudiante.getIdentificacion()));

        // Credenciales correctas (case insensitive para el correo)
        assertTrue(auth.iniciarSesion("A.PEREZ@UNIAMAZONIA.EDU.CO", "secreto"));
        assertTrue(auth.estaAutenticado(estudiante.getIdentificacion()));

        // Cierre de sesión
        auth.cerrarSesion(estudiante.getIdentificacion());
        assertFalse(auth.estaAutenticado(estudiante.getIdentificacion()));
    }
}
