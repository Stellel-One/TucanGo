import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TucanGoFacade } from "./application/TucanGoFacade.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "..", "public");

const facade = new TucanGoFacade();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

function parseJsonBody<T>(req: http.IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown): void {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(data));
}

function serveStatic(res: http.ServerResponse, filePath: string, contentType: string): void {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found");
      return;
    }
    res.writeHead(200, { "Content-Type": `${contentType}; charset=utf-8` });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  // --- API Endpoints ---
  try {
    if (pathname === "/api/estado" && req.method === "GET") {
      const estudiantes = facade.obtenerEstudiantes().map((e) => ({
        identificacion: e.identificacion,
        nombre: e.nombre,
        telefono: e.telefono,
        correo: e.correoInstitucional,
        codigo: e.codigoEstudiantil,
        carrera: e.carrera
      }));

      const motoristas = facade.obtenerMotoristas().map((m) => ({
        identificacion: m.identificacion,
        nombre: m.nombre,
        telefono: m.telefono,
        correo: m.correoInstitucional,
        disponible: m.disponible,
        motoActiva: m.obtenerMotoActiva()
          ? {
              placa: m.obtenerMotoActiva()!.placa,
              marca: m.obtenerMotoActiva()!.marca,
              modelo: m.obtenerMotoActiva()!.modelo,
              cilindraje: m.obtenerMotoActiva()!.cilindraje
            }
          : null,
        motos: m.motos.map((moto) => ({
          placa: moto.placa,
          descripcion: moto.descripcionCorta,
          activa: moto.activa
        }))
      }));

      const viajes = facade.obtenerTodosLosViajes().map((v) => ({
        codigo: v.codigoViaje,
        origen: v.origen,
        destino: v.destino,
        distanciaKm: v.distanciaKm,
        tarifa: v.tarifa,
        estrategia: v.estrategiaTarifa.nombre,
        estado: v.estado.nombre,
        estudiante: {
          id: v.estudiante.identificacion,
          nombre: v.estudiante.nombre
        },
        motorista: v.motorista
          ? {
              id: v.motorista.identificacion,
              nombre: v.motorista.nombre,
              placaMoto: v.motorista.obtenerMotoActiva()?.placa || "Sin moto"
            }
          : null,
        pago: {
          monto: v.pago.monto,
          metodo: v.pago.metodo,
          estado: v.pago.estado
        },
        calificaciones: v.calificaciones.map((c) => ({
          puntuacion: c.puntuacion,
          comentario: c.comentario,
          autor: c.autorIdentificacion
        })),
        fecha: v.fechaCreacion.toISOString()
      }));

      sendJson(res, 200, {
        metricas: facade.obtenerMetricas(),
        estudiantes,
        motoristas,
        viajes
      });
      return;
    }

    if (pathname === "/api/viajes/solicitar" && req.method === "POST") {
      const body = await parseJsonBody<{
        estudianteId: string;
        origen: string;
        destino: string;
        distanciaKm: number;
        tipoTarifa: string;
        metodoPago: string;
      }>(req);

      const viaje = facade.solicitarViaje(
        body.estudianteId,
        body.origen,
        body.destino,
        body.distanciaKm,
        body.tipoTarifa,
        body.metodoPago as any
      );

      sendJson(res, 201, {
        mensaje: "Viaje solicitado con éxito",
        codigo: viaje.codigoViaje,
        tarifa: viaje.tarifa,
        estado: viaje.estado.nombre
      });
      return;
    }

    if (pathname === "/api/viajes/aceptar" && req.method === "POST") {
      const body = await parseJsonBody<{ codigoViaje: string; motoristaId: string }>(req);
      const viaje = facade.aceptarViaje(body.codigoViaje, body.motoristaId);
      sendJson(res, 200, {
        mensaje: "Viaje aceptado por el motorista",
        codigo: viaje.codigoViaje,
        estado: viaje.estado.nombre,
        motorista: viaje.motorista?.nombre
      });
      return;
    }

    if (pathname === "/api/viajes/iniciar" && req.method === "POST") {
      const body = await parseJsonBody<{ codigoViaje: string }>(req);
      const viaje = facade.iniciarViaje(body.codigoViaje);
      sendJson(res, 200, {
        mensaje: "Viaje en marcha",
        codigo: viaje.codigoViaje,
        estado: viaje.estado.nombre
      });
      return;
    }

    if (pathname === "/api/viajes/finalizar" && req.method === "POST") {
      const body = await parseJsonBody<{ codigoViaje: string }>(req);
      const viaje = facade.finalizarViaje(body.codigoViaje);
      sendJson(res, 200, {
        mensaje: "Viaje finalizado y pago procesado",
        codigo: viaje.codigoViaje,
        estado: viaje.estado.nombre,
        pago: viaje.pago.estado
      });
      return;
    }

    if (pathname === "/api/viajes/cancelar" && req.method === "POST") {
      const body = await parseJsonBody<{ codigoViaje: string; motivo: string }>(req);
      const viaje = facade.cancelarViaje(body.codigoViaje, body.motivo || "Cancelado por usuario");
      sendJson(res, 200, {
        mensaje: "Viaje cancelado",
        codigo: viaje.codigoViaje,
        estado: viaje.estado.nombre
      });
      return;
    }

    if (pathname === "/api/viajes/calificar" && req.method === "POST") {
      const body = await parseJsonBody<{
        codigoViaje: string;
        puntuacion: number;
        comentario: string;
        autorId: string;
      }>(req);
      const viaje = facade.calificarViaje(
        body.codigoViaje,
        body.puntuacion,
        body.comentario,
        body.autorId
      );
      sendJson(res, 200, {
        mensaje: "Calificación registrada con éxito",
        codigo: viaje.codigoViaje,
        totalCalificaciones: viaje.calificaciones.length
      });
      return;
    }
  } catch (err: any) {
    sendJson(res, 400, { error: err.message || "Error procesando solicitud" });
    return;
  }

  // --- Static Files ---
  let targetFile = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
  let filePath = path.join(PUBLIC_DIR, targetFile);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml"
    };
    serveStatic(res, filePath, mimeTypes[ext] || "text/plain");
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Ruta no encontrada");
});

server.listen(PORT, () => {
  console.log(`[TucanGo Web] Servidor activo en http://localhost:${PORT}`);
  console.log(`[TucanGo Web] Arquitectura POO en TypeScript con State & Strategy Patterns.`);
});
