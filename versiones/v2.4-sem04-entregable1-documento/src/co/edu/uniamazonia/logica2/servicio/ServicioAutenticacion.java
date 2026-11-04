package co.edu.uniamazonia.logica2.servicio;

import co.edu.uniamazonia.logica2.modelo.Persona;

public class ServicioAutenticacion {
    public boolean validarCorreo(Persona persona) {
        return persona.getCorreoInstitucional().contains("@");
    }
}
