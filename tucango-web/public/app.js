const state = {
  data: null,
  role: "pasajero",
  calificandoCodigo: null,
  routeKm: 1.15,
  routeMin: 3,
  tarifas: {
    estudiantil: 2500,
    distancia: 3500,
    lluvia: 4500,
    nocturna: 4000
  },
  map: null,
  markers: new Map(),
  routeLine: null,
  nextPinTarget: "destino"
};

const els = {
  ssePill: document.getElementById("sse-pill"),
  sseLabel: document.getElementById("sse-label"),
  btnPasajero: document.getElementById("btn-vista-pasajero"),
  btnMotorista: document.getElementById("btn-vista-motorista"),
  panelPasajero: document.getElementById("panel-pasajero"),
  panelMotorista: document.getElementById("panel-motorista"),
  selectEstudiante: document.getElementById("select-estudiante"),
  selectMotorista: document.getElementById("select-motorista"),
  selectOrigen: document.getElementById("select-origen"),
  selectDestino: document.getElementById("select-destino"),
  btnIntercambiar: document.getElementById("btn-intercambiar-ruta"),
  btnCentrarMapa: document.getElementById("btn-centrar-mapa"),
  previewRutaKm: document.getElementById("preview-ruta-km"),
  previewTarifaCop: document.getElementById("preview-tarifa-cop"),
  overlayDist: document.getElementById("overlay-dist"),
  overlayEta: document.getElementById("overlay-eta"),
  overlayCorridor: document.getElementById("overlay-corridor"),
  coordsReadout: document.getElementById("map-coords-readout"),
  metricTotal: document.getElementById("metric-total"),
  metricFinalizados: document.getElementById("metric-finalizados"),
  metricSolicitados: document.getElementById("metric-solicitados"),
  metricIngresos: document.getElementById("metric-ingresos"),
  formSolicitar: document.getElementById("form-solicitar"),
  viajesFeed: document.getElementById("viajes-feed"),
  feedCount: document.getElementById("feed-count"),
  driverMotoInfo: document.getElementById("driver-moto-info"),
  driverSoatBadge: document.getElementById("driver-soat-badge"),
  driverActiveBox: document.getElementById("driver-active-box"),
  driverTripCode: document.getElementById("driver-trip-code"),
  driverTripState: document.getElementById("driver-trip-state"),
  driverTripPax: document.getElementById("driver-trip-pax"),
  driverTripRoute: document.getElementById("driver-trip-route"),
  driverTripPrice: document.getElementById("driver-trip-price"),
  btnIniciarViaje: document.getElementById("btn-iniciar-viaje"),
  btnFinalizarViaje: document.getElementById("btn-finalizar-viaje"),
  radarCount: document.getElementById("radar-count"),
  radarList: document.getElementById("radar-solicitudes-list"),
  modalRegistro: document.getElementById("modal-registro"),
  btnAbrirRegistro: document.getElementById("btn-abrir-registro"),
  btnCerrarRegistro: document.getElementById("btn-cerrar-registro"),
  formRegEst: document.getElementById("form-registro-estudiante"),
  formRegMot: document.getElementById("form-registro-motorista"),
  modalCalificar: document.getElementById("modal-calificar"),
  btnCerrarCalificar: document.getElementById("btn-cerrar-calificar"),
  formCalificar: document.getElementById("form-calificar"),
  calificarCodigo: document.getElementById("calificar-codigo"),
  inputPuntuacion: document.getElementById("input-puntuacion"),
  inputComentario: document.getElementById("input-comentario"),
  stars: document.querySelectorAll("#stars-container .star-btn"),
  toasts: document.getElementById("toast-container")
};

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatoCop(valor) {
  return `$${Number(valor || 0).toLocaleString("es-CO")} COP`;
}

function showToast(mensaje, tipo = "info") {
  const div = document.createElement("div");
  div.className = `toast ${tipo}`;
  div.textContent = mensaje;
  els.toasts.appendChild(div);
  setTimeout(() => div.remove(), 3800);
}

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Error ejecutando operación");
  }
  return data;
}

function setRole(role) {
  state.role = role;
  const esPasajero = role === "pasajero";
  els.btnPasajero.classList.toggle("active", esPasajero);
  els.btnMotorista.classList.toggle("active", !esPasajero);
  els.btnPasajero.setAttribute("aria-selected", String(esPasajero));
  els.btnMotorista.setAttribute("aria-selected", String(!esPasajero));
  els.panelPasajero.classList.toggle("hidden", !esPasajero);
  els.panelMotorista.classList.toggle("hidden", esPasajero);
}

function initMap(sectores) {
  if (typeof window.L === "undefined" || state.map) return;

  const map = window.L.map("campus-map", { zoomControl: true }).setView([1.617, -75.609], 14);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  for (const sec of sectores) {
    const icon = window.L.divIcon({
      className: "",
      html: `<div class="tucan-pin ${sec.esCampusUniamazonia ? "" : "external"}" data-pin="${esc(sec.id)}">${esc(sec.id)}</div>`,
      iconSize: [null, 26],
      iconAnchor: [30, 13]
    });
    const marker = window.L.marker([sec.latitud, sec.longitud], { icon }).addTo(map);
    marker.bindTooltip(`${sec.nombre}`, { direction: "top" });
    marker.on("click", () => seleccionarSectorEnMapa(sec.id));
    state.markers.set(sec.id, marker);
  }

  state.map = map;
}

function seleccionarSectorEnMapa(sectorId) {
  if (state.nextPinTarget === "origen" && sectorId !== els.selectDestino.value) {
    els.selectOrigen.value = sectorId;
    state.nextPinTarget = "destino";
  } else {
    if (sectorId !== els.selectOrigen.value) {
      els.selectDestino.value = sectorId;
      state.nextPinTarget = "origen";
    }
  }
  actualizarRutaDesdeSectores();
}

function pintarRutaEnMapa() {
  if (!state.data || !state.map) return;
  const sectores = state.data.sectores || [];
  const origen = sectores.find((s) => s.id === els.selectOrigen.value);
  const destino = sectores.find((s) => s.id === els.selectDestino.value);

  document.querySelectorAll(".tucan-pin").forEach((el) => {
    el.classList.remove("selected-origin", "selected-dest");
    const pid = el.getAttribute("data-pin");
    if (origen && pid === origen.id) el.classList.add("selected-origin");
    if (destino && pid === destino.id) el.classList.add("selected-dest");
  });

  if (state.routeLine) {
    state.routeLine.remove();
    state.routeLine = null;
  }

  if (origen && destino) {
    const puntos = [
      [origen.latitud, origen.longitud],
      [destino.latitud, destino.longitud]
    ];
    state.routeLine = window.L.polyline(puntos, {
      color: "#0F6B36",
      weight: 4,
      dashArray: "7 6",
      opacity: 0.9
    }).addTo(state.map);

    if (origen.id !== destino.id) {
      state.map.fitBounds(state.routeLine.getBounds(), { padding: [48, 48], maxZoom: 15 });
    } else {
      state.map.setView([origen.latitud, origen.longitud], 15);
    }
    els.coordsReadout.textContent = `Lat ${origen.latitud.toFixed(4)} N · Lon ${origen.longitud.toFixed(4)} W`;
  }
}

async function actualizarRutaDesdeSectores() {
  const origenId = els.selectOrigen.value;
  const destinoId = els.selectDestino.value;
  if (!origenId || !destinoId) return;

  try {
    const res = await fetch(
      `/api/ruta?origenId=${encodeURIComponent(origenId)}&destinoId=${encodeURIComponent(destinoId)}`
    );
    if (res.ok) {
      const ruta = await res.json();
      state.routeKm = Math.max(0.5, Number(ruta.distanciaKm || 0.5));
      state.routeMin = Number(ruta.tiempoEstimadoMin || 3);
      if (ruta.tarifas) state.tarifas = ruta.tarifas;
      els.overlayDist.textContent = `${state.routeKm.toFixed(2)} km`;
      els.overlayEta.textContent = `${state.routeMin} min estimados`;
      els.overlayCorridor.textContent = `${ruta.origen.nombre} → ${ruta.destino.nombre}`;
      els.previewRutaKm.textContent = `${state.routeKm.toFixed(2)} km · ${state.routeMin} min`;
      actualizarPreviewTarifa();
    }
  } catch (err) {
    console.warn("Error cotizando ruta:", err);
  }
  pintarRutaEnMapa();
}

function actualizarPreviewTarifa() {
  const checked = document.querySelector('input[name="tarifa"]:checked');
  const tipo = checked ? checked.value : "estudiantil";
  const valor = state.tarifas[tipo] ?? 2500;
  els.previewTarifaCop.textContent = formatoCop(valor);

  document.querySelectorAll(".strategy-option").forEach((opt) => {
    const inp = opt.querySelector("input");
    const small = opt.querySelector("small");
    if (inp && small && state.tarifas[inp.value] !== undefined) {
      small.textContent = formatoCop(state.tarifas[inp.value]);
    }
  });
}

function renderSelectores(data) {
  const prevEst = els.selectEstudiante.value;
  const prevMot = els.selectMotorista.value;
  const prevOrig = els.selectOrigen.value;
  const prevDest = els.selectDestino.value;

  els.selectEstudiante.innerHTML = data.estudiantes
    .map((e) => `<option value="${esc(e.identificacion)}">${esc(e.nombre)} · ${esc(e.carrera)}</option>`)
    .join("");
  if (prevEst && data.estudiantes.some((e) => e.identificacion === prevEst)) {
    els.selectEstudiante.value = prevEst;
  }

  els.selectMotorista.innerHTML = data.motoristas
    .map((m) => {
      const placa = m.motoActiva ? m.motoActiva.placa : "SIN-MOTO";
      return `<option value="${esc(m.identificacion)}">${esc(m.nombre)} (${esc(placa)})</option>`;
    })
    .join("");
  if (prevMot && data.motoristas.some((m) => m.identificacion === prevMot)) {
    els.selectMotorista.value = prevMot;
  }

  const opcionesSectores = (data.sectores || [])
    .map((s) => `<option value="${esc(s.id)}">${esc(s.nombre)}</option>`)
    .join("");
  if (!els.selectOrigen.innerHTML) {
    els.selectOrigen.innerHTML = opcionesSectores;
    els.selectDestino.innerHTML = opcionesSectores;
    els.selectOrigen.value = prevOrig || "PORVENIR";
    els.selectDestino.value = prevDest || "CENTRO";
  }
}

function badgeEstadoClase(estado) {
  switch (estado) {
    case "FINALIZADO":
      return "chip-verified";
    case "SOLICITADO":
      return "chip-ochre-soft";
    case "CANCELADO":
      return "chip-crimson-soft";
    default:
      return "chip-neutral";
  }
}

function renderMotorista(data) {
  const mot = data.motoristas.find((m) => m.identificacion === els.selectMotorista.value);
  if (mot && mot.motoActiva) {
    els.driverMotoInfo.textContent = `${mot.motoActiva.marca} ${mot.motoActiva.modelo} ${mot.motoActiva.cilindraje}cc · Placa ${mot.motoActiva.placa} · ${mot.motoActiva.numeroSoat}`;
    els.driverSoatBadge.textContent = mot.motoActiva.soatVigente ? "SOAT VIGENTE" : "SOAT INACTIVO";
  }

  const activo = data.viajes.find(
    (v) => v.motorista && v.motorista.id === els.selectMotorista.value && (v.estado === "ACEPTADO" || v.estado === "EN_CURSO")
  );
  if (activo) {
    els.driverActiveBox.classList.remove("hidden");
    els.driverActiveBox.dataset.codigo = activo.codigo;
    els.driverTripCode.textContent = activo.codigo;
    els.driverTripState.textContent = activo.estado;
    els.driverTripPax.textContent = `Pasajero: ${activo.estudiante.nombre}`;
    els.driverTripRoute.textContent = `${activo.origen} → ${activo.destino} (${activo.distanciaKm} km)`;
    els.driverTripPrice.textContent = `Tarifa: ${formatoCop(activo.tarifa)} (${activo.pago.metodo})`;
    els.btnIniciarViaje.disabled = activo.estado !== "ACEPTADO";
    els.btnFinalizarViaje.disabled = activo.estado !== "EN_CURSO";
  } else {
    els.driverActiveBox.classList.add("hidden");
    els.driverActiveBox.dataset.codigo = "";
  }

  const solicitados = data.viajes.filter((v) => v.estado === "SOLICITADO");
  els.radarCount.textContent = `${solicitados.length} pendientes`;
  if (solicitados.length === 0) {
    els.radarList.innerHTML = renderEmptyState("Sin solicitudes pendientes en campus", "Cuando un estudiante solicite un viaje aparecerá aquí al instante.");
    return;
  }

  els.radarList.innerHTML = solicitados
    .map(
      (v) => `
      <article class="ride-item">
        <div class="ride-item-top">
          <div class="ride-item-badges">
            <span class="chip-mono chip-neutral">${esc(v.codigo)}</span>
            <span class="chip-mono chip-ochre-soft">SOLICITADO</span>
          </div>
          <strong class="mono-text">${formatoCop(v.tarifa)}</strong>
        </div>
        <div class="ride-route">${esc(v.origen)} → ${esc(v.destino)}</div>
        <div class="ride-meta">${esc(v.estudiante.nombre)} · ${esc(v.distanciaKm)} km · ${esc(v.estrategia)} · Pago ${esc(v.pago.metodo)}</div>
        <div class="ride-actions">
          <span class="chip-mono chip-verified">RUTA VERIFICADA</span>
          <button type="button" class="btn-primary btn-sm" data-aceptar-viaje="${esc(v.codigo)}">Aceptar Viaje</button>
        </div>
      </article>`
    )
    .join("");
}

function renderEmptyState(titulo, subtitulo) {
  return `
    <div class="empty-state">
      <svg viewBox="0 0 320 56" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M0 32 Q 60 8, 120 28 T 240 24 T 320 32" />
        <path d="M0 44 Q 80 20, 160 38 T 320 40" />
      </svg>
      <strong>${esc(titulo)}</strong>
      <p class="muted-sub">${esc(subtitulo)}</p>
    </div>`;
}

function renderFeed(data) {
  const viajes = [...data.viajes].reverse();
  els.feedCount.textContent = `${viajes.length} REGISTROS`;

  if (viajes.length === 0) {
    els.viajesFeed.innerHTML = renderEmptyState("Sin trayectos registrados aún", "Selecciona origen y destino en el mapa para solicitar el primer viaje.");
    return;
  }

  els.viajesFeed.innerHTML = viajes
    .map((v) => {
      const driverHtml = v.motorista
        ? `${esc(v.motorista.nombre)} · Placa <span class="mono-text">${esc(v.motorista.placaMoto)}</span>`
        : "Pendiente por asignación";
      const soatChip = v.motorista && v.motorista.soatVigente ? `<span class="chip-mono chip-verified">SOAT VIGENTE</span>` : "";
      const llegadaChip = v.llegadaSeguraConfirmada
        ? `<span class="chip-mono chip-verified">LLEGADA SEGURA VERIFICADA</span>`
        : "";
      const ratingChip =
        v.calificaciones.length > 0
          ? `<span class="chip-mono chip-ochre-soft">${esc(v.calificaciones[0].puntuacion.toFixed(1))} / 5.0</span>`
          : "";

      const botones = [];
      if (v.estado === "SOLICITADO") {
        botones.push(`<button type="button" class="btn-primary btn-sm" data-aceptar-viaje="${esc(v.codigo)}">Aceptar</button>`);
        botones.push(`<button type="button" class="btn-danger-outline" data-cancelar-viaje="${esc(v.codigo)}">Cancelar</button>`);
      } else if (v.estado === "ACEPTADO") {
        botones.push(`<button type="button" class="btn-primary btn-sm" data-iniciar-viaje="${esc(v.codigo)}">Iniciar</button>`);
        botones.push(`<button type="button" class="btn-danger-outline" data-cancelar-viaje="${esc(v.codigo)}">Cancelar</button>`);
      } else if (v.estado === "EN_CURSO") {
        botones.push(`<button type="button" class="btn-leaf btn-sm" data-finalizar-viaje="${esc(v.codigo)}">Finalizar</button>`);
      } else if (v.estado === "FINALIZADO") {
        if (!v.llegadaSeguraConfirmada) {
          botones.push(`<button type="button" class="btn-primary btn-sm" data-llegada-segura="${esc(v.codigo)}">Confirmar Llegada Segura</button>`);
        }
        if (v.calificaciones.length === 0) {
          botones.push(`<button type="button" class="btn-chip" data-calificar-viaje="${esc(v.codigo)}">Calificar</button>`);
        }
      }

      return `
        <article class="ride-item">
          <div class="ride-item-top">
            <div class="ride-item-badges">
              <span class="chip-mono chip-neutral">${esc(v.codigo)}</span>
              <span class="chip-mono ${badgeEstadoClase(v.estado)}">${esc(v.estado)}</span>
              ${soatChip}
              ${llegadaChip}
              ${ratingChip}
            </div>
            <strong class="mono-text">${formatoCop(v.tarifa)}</strong>
          </div>
          <div class="ride-route">${esc(v.origen)} → ${esc(v.destino)}</div>
          <div class="ride-meta">Pasajero: ${esc(v.estudiante.nombre)} · Conductor: ${driverHtml} · ${esc(v.distanciaKm)} km · ${esc(v.pago.metodo)} (${esc(v.pago.estado)})</div>
          ${botones.length > 0 ? `<div class="ride-actions">${botones.join("")}</div>` : ""}
        </article>`;
    })
    .join("");
}

function renderAll(data) {
  state.data = data;
  els.metricTotal.textContent = String(data.metricas.totalViajes);
  els.metricFinalizados.textContent = String(data.metricas.finalizados);
  els.metricSolicitados.textContent = String(data.metricas.solicitados);
  els.metricIngresos.textContent = `$${Number(data.metricas.ingresosGenerados || 0).toLocaleString("es-CO")}`;

  initMap(data.sectores || []);
  renderSelectores(data);
  renderMotorista(data);
  renderFeed(data);
}

async function cargarEstado(actualizarRutaInicial = false) {
  try {
    const res = await fetch("/api/estado");
    const data = await res.json();
    renderAll(data);
    if (actualizarRutaInicial) {
      await actualizarRutaDesdeSectores();
    }
  } catch (err) {
    console.error("Error cargando estado:", err);
  }
}

function conectarSse() {
  if (typeof window.EventSource === "undefined") return;
  const es = new window.EventSource("/api/eventos");
  es.addEventListener("conectado", () => {
    els.ssePill.classList.remove("offline");
    els.sseLabel.textContent = "En vivo · SSE";
  });
  es.addEventListener("dominio", () => {
    cargarEstado();
  });
  es.onerror = () => {
    els.ssePill.classList.add("offline");
    els.sseLabel.textContent = "Reconectando SSE";
  };
}

// --- EVENTOS UI ---
els.btnPasajero.addEventListener("click", () => setRole("pasajero"));
els.btnMotorista.addEventListener("click", () => setRole("motorista"));
els.selectMotorista.addEventListener("change", () => state.data && renderMotorista(state.data));
els.selectOrigen.addEventListener("change", actualizarRutaDesdeSectores);
els.selectDestino.addEventListener("change", actualizarRutaDesdeSectores);

els.btnIntercambiar.addEventListener("click", () => {
  const temp = els.selectOrigen.value;
  els.selectOrigen.value = els.selectDestino.value;
  els.selectDestino.value = temp;
  actualizarRutaDesdeSectores();
});

els.btnCentrarMapa.addEventListener("click", () => pintarRutaEnMapa());

document.querySelectorAll("[data-pan-sector]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-pan-sector]").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const sector = (state.data?.sectores || []).find((s) => s.id === btn.dataset.panSector);
    if (sector && state.map) {
      state.map.setView([sector.latitud, sector.longitud], 15);
      els.coordsReadout.textContent = `Lat ${sector.latitud.toFixed(4)} N · Lon ${sector.longitud.toFixed(4)} W`;
    }
  });
});

document.querySelectorAll('input[name="tarifa"]').forEach((radio) => {
  radio.addEventListener("change", actualizarPreviewTarifa);
});

els.formSolicitar.addEventListener("submit", async (e) => {
  e.preventDefault();
  const origenText = els.selectOrigen.options[els.selectOrigen.selectedIndex]?.text || els.selectOrigen.value;
  const destinoText = els.selectDestino.options[els.selectDestino.selectedIndex]?.text || els.selectDestino.value;
  if (origenText === destinoText) {
    showToast("Selecciona un destino diferente al punto de origen.", "error");
    return;
  }

  try {
    const tipoTarifa = document.querySelector('input[name="tarifa"]:checked')?.value || "estudiantil";
    const metodoPago = document.querySelector('input[name="metodoPago"]:checked')?.value || "EFECTIVO";
    const res = await postJson("/api/viajes/solicitar", {
      estudianteId: els.selectEstudiante.value,
      origen: origenText,
      destino: destinoText,
      distanciaKm: state.routeKm,
      tipoTarifa,
      metodoPago
    });
    showToast(`Viaje ${res.codigo} solicitado (${formatoCop(res.tarifa)})`, "success");
    await cargarEstado();
  } catch (err) {
    showToast(err.message, "error");
  }
});

document.addEventListener("click", async (e) => {
  const target = e.target.closest("button");
  if (!target) return;

  try {
    if (target.dataset.aceptarViaje) {
      await postJson("/api/viajes/aceptar", {
        codigoViaje: target.dataset.aceptarViaje,
        motoristaId: els.selectMotorista.value
      });
      showToast(`Viaje ${target.dataset.aceptarViaje} aceptado`, "success");
      await cargarEstado();
    } else if (target.dataset.iniciarViaje) {
      await postJson("/api/viajes/iniciar", { codigoViaje: target.dataset.iniciarViaje });
      showToast(`Viaje ${target.dataset.iniciarViaje} iniciado`, "success");
      await cargarEstado();
    } else if (target.dataset.finalizarViaje) {
      await postJson("/api/viajes/finalizar", { codigoViaje: target.dataset.finalizarViaje });
      showToast(`Viaje ${target.dataset.finalizarViaje} finalizado`, "success");
      await cargarEstado();
    } else if (target.dataset.llegadaSegura) {
      await postJson("/api/viajes/llegada-segura", { codigoViaje: target.dataset.llegadaSegura });
      showToast(`Llegada segura verificada para ${target.dataset.llegadaSegura}`, "success");
      await cargarEstado();
    } else if (target.dataset.cancelarViaje) {
      await postJson("/api/viajes/cancelar", {
        codigoViaje: target.dataset.cancelarViaje,
        motivo: "Cancelado desde panel campus"
      });
      showToast(`Viaje ${target.dataset.cancelarViaje} cancelado`);
      await cargarEstado();
    } else if (target.dataset.calificarViaje) {
      state.calificandoCodigo = target.dataset.calificarViaje;
      els.calificarCodigo.textContent = target.dataset.calificarViaje;
      els.modalCalificar.classList.remove("hidden");
    }
  } catch (err) {
    showToast(err.message, "error");
  }
});

els.btnIniciarViaje.addEventListener("click", async () => {
  const codigo = els.driverActiveBox.dataset.codigo;
  if (!codigo) return;
  try {
    await postJson("/api/viajes/iniciar", { codigoViaje: codigo });
    showToast(`Trayecto ${codigo} en curso`, "success");
    await cargarEstado();
  } catch (err) {
    showToast(err.message, "error");
  }
});

els.btnFinalizarViaje.addEventListener("click", async () => {
  const codigo = els.driverActiveBox.dataset.codigo;
  if (!codigo) return;
  try {
    await postJson("/api/viajes/finalizar", { codigoViaje: codigo });
    showToast(`Trayecto ${codigo} finalizado`, "success");
    await cargarEstado();
  } catch (err) {
    showToast(err.message, "error");
  }
});

// --- MODAL REGISTRO ---
els.btnAbrirRegistro.addEventListener("click", () => els.modalRegistro.classList.remove("hidden"));
els.btnCerrarRegistro.addEventListener("click", () => els.modalRegistro.classList.add("hidden"));

document.querySelectorAll("[data-reg-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    const esEst = tab.dataset.regTab === "estudiante";
    document.querySelectorAll("[data-reg-tab]").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    els.formRegEst.classList.toggle("hidden", !esEst);
    els.formRegMot.classList.toggle("hidden", esEst);
  });
});

els.formRegEst.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const res = await postJson("/api/estudiantes", {
      identificacion: document.getElementById("reg-est-id").value,
      nombre: document.getElementById("reg-est-nombre").value,
      telefono: document.getElementById("reg-est-tel").value,
      correoInstitucional: document.getElementById("reg-est-correo").value,
      codigoEstudiantil: document.getElementById("reg-est-codigo").value,
      carrera: document.getElementById("reg-est-carrera").value
    });
    els.modalRegistro.classList.add("hidden");
    els.formRegEst.reset();
    await cargarEstado();
    els.selectEstudiante.value = res.identificacion;
    showToast(`Estudiante ${res.nombre} registrado`, "success");
  } catch (err) {
    showToast(err.message, "error");
  }
});

els.formRegMot.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const res = await postJson("/api/motoristas", {
      identificacion: document.getElementById("reg-mot-id").value,
      nombre: document.getElementById("reg-mot-nombre").value,
      telefono: document.getElementById("reg-mot-tel").value,
      correoInstitucional: document.getElementById("reg-mot-correo").value,
      placa: document.getElementById("reg-mot-placa").value,
      marca: document.getElementById("reg-mot-marca").value,
      modelo: document.getElementById("reg-mot-modelo").value,
      cilindraje: Number(document.getElementById("reg-mot-cc").value),
      numeroSoat: document.getElementById("reg-mot-soat-num").value,
      soatVigente: document.getElementById("reg-mot-soat-vigente").checked
    });
    els.modalRegistro.classList.add("hidden");
    els.formRegMot.reset();
    await cargarEstado();
    els.selectMotorista.value = res.identificacion;
    showToast(`Motorista ${res.nombre} (${res.placa}) verificado`, "success");
  } catch (err) {
    showToast(err.message, "error");
  }
});

// --- MODAL CALIFICACIÓN ---
els.btnCerrarCalificar.addEventListener("click", () => els.modalCalificar.classList.add("hidden"));

els.stars.forEach((star) => {
  star.addEventListener("click", () => {
    const val = parseInt(star.dataset.value, 10);
    els.inputPuntuacion.value = String(val);
    els.stars.forEach((s) => {
      s.classList.toggle("active", parseInt(s.dataset.value, 10) <= val);
    });
  });
});

els.formCalificar.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!state.calificandoCodigo) return;
  try {
    await postJson("/api/viajes/calificar", {
      codigoViaje: state.calificandoCodigo,
      puntuacion: Number(els.inputPuntuacion.value),
      comentario: els.inputComentario.value,
      autorId: els.selectEstudiante.value
    });
    els.modalCalificar.classList.add("hidden");
    els.inputComentario.value = "";
    showToast(`Calificación enviada para ${state.calificandoCodigo}`, "success");
    await cargarEstado();
  } catch (err) {
    showToast(err.message, "error");
  }
});

// --- INIT ---
conectarSse();
cargarEstado(true);
