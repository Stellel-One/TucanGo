// Estado del cliente
let estadoGlobal = {
  estudiantes: [],
  motoristas: [],
  viajes: [],
  metricas: {}
};

let viajeActivoPasajero = null;
let viajeActivoConductor = null;

// Elementos DOM
const selectEstudiante = document.getElementById("select-estudiante");
const selectMotorista = document.getElementById("select-motorista");
const motoActivaLabel = document.getElementById("moto-activa-label");
const formSolicitar = document.getElementById("form-solicitar");
const inputOrigen = document.getElementById("input-origen");
const inputDestino = document.getElementById("input-destino");
const inputDistancia = document.getElementById("input-distancia");
const selectPago = document.getElementById("select-pago");

const pasajeroBox = document.getElementById("pasajero-viaje-activo");
const badgeEstado = document.getElementById("badge-estado");
const tripCode = document.getElementById("trip-code");
const tripRoute = document.getElementById("trip-route");
const tripFare = document.getElementById("trip-fare");
const tripDriverInfo = document.getElementById("trip-driver-info");

const listaSolicitudes = document.getElementById("lista-solicitudes");
const conductorBox = document.getElementById("conductor-viaje-en-curso");
const driverTripCode = document.getElementById("driver-trip-code");
const driverTripState = document.getElementById("driver-trip-state");
const driverTripPax = document.getElementById("driver-trip-pax");
const driverTripRoute = document.getElementById("driver-trip-route");
const driverTripPrice = document.getElementById("driver-trip-price");
const btnIniciarViaje = document.getElementById("btn-iniciar-viaje");
const btnFinalizarViaje = document.getElementById("btn-finalizar-viaje");

const metricTotal = document.getElementById("metric-total");
const metricCompletados = document.getElementById("metric-completados");
const metricIngresos = document.getElementById("metric-ingresos");

// Modal de Calificación
const modalCalificar = document.getElementById("modal-calificar");
const stars = document.querySelectorAll(".star");
const inputPuntuacion = document.getElementById("puntuacion-seleccionada");
const inputComentario = document.getElementById("comentario-calificacion");
const btnEnviarCalificacion = document.getElementById("btn-enviar-calificacion");
let viajeACalificar = null;

// --- Carga Inicial de Datos ---
async function cargarEstado() {
  try {
    const res = await fetch("/api/estado");
    if (!res.ok) throw new Error("Error consultando API");
    estadoGlobal = await res.json();
    renderizarTodo();
  } catch (err) {
    console.error("Error sincronizando estado:", err);
  }
}

function renderizarTodo() {
  renderizarEstudiantes();
  renderizarMotoristas();
  renderizarMetricas();
  renderizarRadarConductor();
  renderizarEstadoPasajero();
  renderizarEstadoConductor();
}

function renderizarEstudiantes() {
  if (selectEstudiante.options.length === 0) {
    selectEstudiante.innerHTML = estadoGlobal.estudiantes
      .map((e) => `<option value="${e.identificacion}">${e.nombre} (${e.carrera})</option>`)
      .join("");
  }
}

function renderizarMotoristas() {
  if (selectMotorista.options.length === 0) {
    selectMotorista.innerHTML = estadoGlobal.motoristas
      .map((m) => `<option value="${m.identificacion}">${m.nombre}</option>`)
      .join("");
  }
  actualizarMotoConductor();
}

function actualizarMotoConductor() {
  const motId = selectMotorista.value;
  const motorista = estadoGlobal.motoristas.find((m) => m.identificacion === motId);
  if (motorista && motorista.motoActiva) {
    motoActivaLabel.textContent = `${motorista.motoActiva.marca} ${motorista.motoActiva.modelo} [${motorista.motoActiva.placa}]`;
  } else {
    motoActivaLabel.textContent = "Sin moto activa";
  }
}

selectMotorista.addEventListener("change", () => {
  actualizarMotoConductor();
  renderizarRadarConductor();
  renderizarEstadoConductor();
});

function renderizarMetricas() {
  const m = estadoGlobal.metricas;
  if (!m) return;
  metricTotal.textContent = m.totalViajes || 0;
  metricCompletados.textContent = m.finalizados || 0;
  metricIngresos.textContent = `$${(m.ingresosGenerados || 0).toLocaleString("es-CO")} COP`;
}

// --- Renderizar Radar de Solicitudes (Conductor) ---
function renderizarRadarConductor() {
  const solicitados = estadoGlobal.viajes.filter((v) => v.estado === "SOLICITADO");

  if (solicitados.length === 0) {
    listaSolicitudes.innerHTML = `<p class="empty-state">No hay solicitudes pendientes en este momento.</p>`;
    return;
  }

  listaSolicitudes.innerHTML = solicitados
    .map(
      (v) => `
    <div class="request-item">
      <div class="req-info">
        <h4>${v.codigo} — ${v.estudiante.nombre}</h4>
        <p>${v.origen} ➔ ${v.destino} (${v.distanciaKm} km)</p>
        <p><em>${v.estrategia}</em> • Pago: <strong>${v.pago.metodo}</strong></p>
      </div>
      <div>
        <div class="req-price">$${v.tarifa.toLocaleString("es-CO")}</div>
        <button class="btn btn-primary" onclick="aceptarViaje('${v.codigo}')" style="margin-top: 6px; padding: 6px 14px; font-size: 0.82rem;">
          Aceptar Viaje
        </button>
      </div>
    </div>
  `
    )
    .join("");
}

// --- Renderizar Vista Pasajero ---
function renderizarEstadoPasajero() {
  if (!viajeActivoPasajero) {
    pasajeroBox.classList.add("hidden");
    return;
  }

  // Buscar el viaje actualizado en el backend
  const viaje = estadoGlobal.viajes.find((v) => v.codigo === viajeActivoPasajero.codigo);
  if (!viaje) return;

  pasajeroBox.classList.remove("hidden");
  tripCode.textContent = viaje.codigo;
  tripRoute.textContent = `${viaje.origen} ➔ ${viaje.destino} (${viaje.distanciaKm} km)`;
  tripFare.textContent = `$${viaje.tarifa.toLocaleString("es-CO")} COP (${viaje.estrategia})`;

  badgeEstado.textContent = viaje.estado;
  if (viaje.estado === "SOLICITADO") {
    badgeEstado.style.background = "#f59e0b";
    tripDriverInfo.innerHTML = `<p>⏳ Buscando moto disponible en el campus...</p>`;
  } else if (viaje.estado === "ACEPTADO") {
    badgeEstado.style.background = "#2563eb";
    tripDriverInfo.innerHTML = `
      <p>🏍️ <strong>Conductor asignado:</strong> ${viaje.motorista.nombre}</p>
      <p>Placa: <strong>${viaje.motorista.placaMoto}</strong></p>
      <p style="color: #2563eb; font-weight: 600; margin-top: 4px;">El motorista va en camino a tu punto de recogida.</p>
    `;
  } else if (viaje.estado === "EN_CURSO") {
    badgeEstado.style.background = "#10b981";
    tripDriverInfo.innerHTML = `
      <p>🛵 <strong>Viaje en marcha con ${viaje.motorista.nombre}</strong></p>
      <p style="color: #059669; font-weight: 600;">¡Disfrutá tu recorrido por Florencia!</p>
    `;
  } else if (viaje.estado === "FINALIZADO") {
    badgeEstado.style.background = "#059669";
    tripDriverInfo.innerHTML = `
      <p>✅ <strong>¡Viaje completado exitosamente!</strong></p>
      <p>Pago procesado: $${viaje.tarifa.toLocaleString("es-CO")} COP por ${viaje.pago.metodo}.</p>
    `;
    // Abrir modal de calificación si no ha sido calificado
    if (viaje.calificaciones.length === 0) {
      abrirModalCalificar(viaje);
    }
  }
}

// --- Renderizar Vista Conductor ---
function renderizarEstadoConductor() {
  const motId = selectMotorista.value;
  const viajeEnAtencion = estadoGlobal.viajes.find(
    (v) =>
      v.motorista &&
      v.motorista.id === motId &&
      (v.estado === "ACEPTADO" || v.estado === "EN_CURSO")
  );

  if (!viajeEnAtencion) {
    conductorBox.classList.add("hidden");
    return;
  }

  viajeActivoConductor = viajeEnAtencion;
  conductorBox.classList.remove("hidden");

  driverTripCode.textContent = viajeEnAtencion.codigo;
  driverTripState.textContent = viajeEnAtencion.estado;
  driverTripPax.innerHTML = `<strong>Pasajero:</strong> ${viajeEnAtencion.estudiante.nombre}`;
  driverTripRoute.innerHTML = `<strong>Ruta:</strong> ${viajeEnAtencion.origen} ➔ ${viajeEnAtencion.destino} (${viajeEnAtencion.distanciaKm} km)`;
  driverTripPrice.innerHTML = `<strong>Tarifa a cobrar:</strong> $${viajeEnAtencion.tarifa.toLocaleString("es-CO")} COP (${viajeEnAtencion.pago.metodo})`;

  if (viajeEnAtencion.estado === "ACEPTADO") {
    btnIniciarViaje.disabled = false;
    btnFinalizarViaje.disabled = true;
  } else if (viajeEnAtencion.estado === "EN_CURSO") {
    btnIniciarViaje.disabled = true;
    btnFinalizarViaje.disabled = false;
  }
}

// --- Eventos y Solicitudes API ---
formSolicitar.addEventListener("submit", async (e) => {
  e.preventDefault();

  const estudianteId = selectEstudiante.value;
  const origen = inputOrigen.value;
  const destino = inputDestino.value;
  const distanciaKm = parseFloat(inputDistancia.value);
  const metodoPago = selectPago.value;
  const tipoTarifa = document.querySelector('input[name="tarifa"]:checked').value;

  try {
    const res = await fetch("/api/viajes/solicitar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estudianteId,
        origen,
        destino,
        distanciaKm,
        tipoTarifa,
        metodoPago
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "No se pudo solicitar");

    viajeActivoPasajero = { codigo: data.codigo };
    await cargarEstado();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});

window.aceptarViaje = async function (codigoViaje) {
  const motoristaId = selectMotorista.value;
  try {
    const res = await fetch("/api/viajes/aceptar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigoViaje, motoristaId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "No se pudo aceptar el viaje");

    await cargarEstado();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
};

btnIniciarViaje.addEventListener("click", async () => {
  if (!viajeActivoConductor) return;
  try {
    const res = await fetch("/api/viajes/iniciar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigoViaje: viajeActivoConductor.codigo })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await cargarEstado();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});

btnFinalizarViaje.addEventListener("click", async () => {
  if (!viajeActivoConductor) return;
  try {
    const res = await fetch("/api/viajes/finalizar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigoViaje: viajeActivoConductor.codigo })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await cargarEstado();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});

// --- Modal de Calificación ---
function abrirModalCalificar(viaje) {
  viajeACalificar = viaje;
  modalCalificar.classList.remove("hidden");
}

stars.forEach((star) => {
  star.addEventListener("click", () => {
    const val = parseInt(star.dataset.value, 10);
    inputPuntuacion.value = val;
    stars.forEach((s) => {
      const sVal = parseInt(s.dataset.value, 10);
      s.classList.toggle("active", sVal <= val);
    });
  });
});

btnEnviarCalificacion.addEventListener("click", async () => {
  if (!viajeACalificar) return;
  const puntuacion = parseFloat(inputPuntuacion.value);
  const comentario = inputComentario.value;
  const autorId = viajeACalificar.estudiante.id;

  try {
    const res = await fetch("/api/viajes/calificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigoViaje: viajeACalificar.codigo,
        puntuacion,
        comentario,
        autorId
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    modalCalificar.classList.add("hidden");
    viajeACalificar = null;
    inputComentario.value = "";
    await cargarEstado();
  } catch (err) {
    alert(`Error al calificar: ${err.message}`);
  }
});

// Polling suave cada 2.5s para emular tiempo real entre pasajero y conductor
setInterval(cargarEstado, 2500);
cargarEstado();
