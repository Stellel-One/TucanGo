package co.edu.uniamazonia.logica2.servicio;

import co.edu.uniamazonia.logica2.modelo.Viaje;

public class ServicioReportes {
    public void mostrarReporte(Viaje viaje) {
        System.out.println("REPORTE DEL VIAJE");
        System.out.println("Codigo: " + viaje.getCodigoViaje());
        System.out.println("Origen: " + viaje.getOrigen());
        System.out.println("Destino: " + viaje.getDestino());
        System.out.println("Tarifa: " + viaje.getTarifa());
        System.out.println("Estado: " + viaje.getEstado());
        System.out.println("Calificaciones: "
                + viaje.getCantidadCalificaciones());
    }
}
