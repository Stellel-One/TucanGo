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
  mapConfig: null,
  markers: new Map(),
  driverMarkers: new Map(),
  driverHeadings: new Map(),
  userGpsMarker: null,
  routeLine: null,
  nextPinTarget: "destino",
  lastOsrmKey: "",
  lastPolilinea: [],
  autoSimTimer: null,
  autoSimCodigo: null
};

const els = {
  ssePill: document.getElementById("sse-pill"),
  sseLabel: document.getElementById("sse-label"),
  btnSesionTopbar: document.getElementById("btn-sesion-topbar"),
  sessionAvatarInitials: document.getElementById("session-avatar-initials"),
  sessionUserName: document.getElementById("session-user-name"),
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
  btnSimularTracking: document.getElementById("btn-simular-tracking"),
  btnMapEnginePill: document.getElementById("btn-map-engine-pill"),
  mapEngineLabel: document.getElementById("map-engine-label"),
  gmapsStatusBadge: document.getElementById("gmaps-status-badge"),
  previewRutaKm: document.getElementById("preview-ruta-km"),
  previewTarifaCop: document.getElementById("preview-tarifa-cop"),
  searchActiveSummary: document.getElementById("search-active-summary"),
  didiSearchTrigger: document.getElementById("didi-search-trigger"),
  btnTarifaInteligente: document.getElementById("btn-tarifa-inteligente"),
  btnElegirCuenta: document.getElementById("btn-elegir-cuenta"),
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
  liveTrackingCard: document.getElementById("live-tracking-card"),
  trackingStageBadge: document.getElementById("tracking-stage-badge"),
  trackingTitle: document.getElementById("tracking-title"),
  trackingSubtitle: document.getElementById("tracking-subtitle"),
  trackingPin: document.getElementById("tracking-pin"),
  trackingProgressBar: document.getElementById("tracking-progress-bar"),
  trackingProgressPct: document.getElementById("tracking-progress-pct"),
  trackingEtaLive: document.getElementById("tracking-eta-live"),
  trackingDriverBox: document.getElementById("tracking-driver-box"),
  trackingDriverInitials: document.getElementById("tracking-driver-initials"),
  trackingDriverName: document.getElementById("tracking-driver-name"),
  trackingMotoDesc: document.getElementById("tracking-moto-desc"),
  trackingMotoPlate: document.getElementById("tracking-moto-plate"),
  trackingActionsRow: document.getElementById("tracking-actions-row"),
  driverOnlineStatusLabel: document.getElementById("driver-online-status-label"),
  driverCoordsChip: document.getElementById("driver-coords-chip"),
  btnToggleDisponibilidad: document.getElementById("btn-toggle-disponibilidad"),
  toggleDisponibilidadText: document.getElementById("toggle-disponibilidad-text"),
  driverMotoInfo: document.getElementById("driver-moto-info"),
  driverSoatBadge: document.getElementById("driver-soat-badge"),
  driverActiveBox: document.getElementById("driver-active-box"),
  driverTripCode: document.getElementById("driver-trip-code"),
  driverTripState: document.getElementById("driver-trip-state"),
  driverTripPin: document.getElementById("driver-trip-pin"),
  driverTrackingStageText: document.getElementById("driver-tracking-stage-text"),
  driverProgressBar: document.getElementById("driver-progress-bar"),
  driverTripPax: document.getElementById("driver-trip-pax"),
  driverTripRoute: document.getElementById("driver-trip-route"),
  driverTripPrice: document.getElementById("driver-trip-price"),
  btnDriverSimularPaso: document.getElementById("btn-driver-simular-paso"),
  btnIniciarViaje: document.getElementById("btn-iniciar-viaje"),
  btnFinalizarViaje: document.getElementById("btn-finalizar-viaje"),
  radarCount: document.getElementById("radar-count"),
  radarList: document.getElementById("radar-solicitudes-list"),
  modalLogin: document.getElementById("modal-login"),
  btnAbrirLogin: document.getElementById("btn-abrir-login"),
  btnAbrirLoginBadge: document.getElementById("btn-abrir-login-badge"),
  btnCerrarLogin: document.getElementById("btn-cerrar-login"),
  quickAccountsList: document.getElementById("quick-accounts-list"),
  formLogin: document.getElementById("form-login"),
  loginTabRapido: document.getElementById("login-tab-rapido"),
  loginTabGmaps: document.getElementById("login-tab-googlemaps"),
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
  toasts: document.getElementById("toast-container"),
  didiStage: document.getElementById("didi-stage"),
  btnToggleSheet: document.getElementById("btn-toggle-sheet"),
  sheetToggleHint: document.getElementById("sheet-toggle-hint"),
  sectionActividad: document.getElementById("section-actividad"),
  mobileTabBtns: document.querySelectorAll("[data-mobile-tab]"),
  mobileTrackingDot: document.getElementById("mobile-tracking-dot")
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

function iniciales(nombre) {
  return String(nombre || "TG")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] || "")
    .join("")
    .toUpperCase();
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

function actualizarBannerSesion() {
  if (!state.data) return;
  if (state.role === "motorista") {
    const mot = state.data.motoristas.find((m) => m.identificacion === els.selectMotorista.value);
    if (mot) {
      els.sessionUserName.textContent = `${mot.nombre.split(" ")[0]} · Moto`;
      els.sessionAvatarInitials.textContent = iniciales(mot.nombre);
    }
  } else {
    const est = state.data.estudiantes.find((e) => e.identificacion === els.selectEstudiante.value);
    if (est) {
      els.sessionUserName.textContent = est.nombre;
      els.sessionAvatarInitials.textContent = iniciales(est.nombre);
    }
  }
}

function actualizarTabMovilActiva(tabName) {
  els.mobileTabBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mobileTab === tabName);
  });
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
  actualizarTabMovilActiva(esPasajero ? "viajar" : "motorista");
  actualizarBannerSesion();
}

function crearSvgMotoCenital(ocupada, rumboGrados) {
  const colorChasis = ocupada ? "#FF6600" : "#0F6B36";
  return `
    <div class="moto-marker-wrap">
      <div class="moto-svg-rotator" style="transform: rotate(${Number(rumboGrados || 0)}deg);">
        <svg viewBox="0 0 36 36" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="18" cy="18" rx="13" ry="15" fill="rgba(255,255,255,0.86)" />
          <rect x="16" y="4" width="4" height="7" rx="2" fill="#1E2421" />
          <path d="M11 11 H25" stroke="#1E2421" stroke-width="2.6" stroke-linecap="round" />
          <rect x="14" y="10" width="8" height="14" rx="4" fill="${colorChasis}" stroke="#FFFFFF" stroke-width="1.4" />
          <circle cx="18" cy="16.5" r="3" fill="#1E2421" />
          <rect x="16.2" y="25" width="3.6" height="6" rx="1.5" fill="#1E2421" />
          <circle cx="18" cy="6.2" r="1.7" fill="#F7C927" />
        </svg>
      </div>
    </div>`;
}

async function cargarConfigMapa() {
  try {
    const res = await fetch("/api/mapa/config");
    if (!res.ok) return;
    state.mapConfig = await res.json();
    const esGoogle = state.mapConfig.proveedorActivo === "google_maps";
    const texto = esGoogle ? "Google Maps API Activa" : "Mapa Vial · OSRM";
    if (els.mapEngineLabel) els.mapEngineLabel.textContent = texto;
    if (els.gmapsStatusBadge) els.gmapsStatusBadge.textContent = texto;
  } catch {
    // Fallback silencioso
  }
}

function initMap(sectores) {
  if (typeof window.L === "undefined" || state.map) return;

  const map = window.L.map("campus-map", { zoomControl: true }).setView([1.617, -75.609], 14);
  const tileUrl =
    state.mapConfig?.tileUrlDidi || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const baseLayer = window.L.tileLayer(tileUrl, {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  const fallbackOsm = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap"
  });
  baseLayer.on("tileerror", () => {
    if (!map.hasLayer(fallbackOsm)) {
      fallbackOsm.addTo(map);
    }
  });

  for (const sec of sectores) {
    const icon = window.L.divIcon({
      className: "",
      html: `<div class="tucan-pin ${sec.esCampusUniamazonia ? "" : "external"}" data-pin="${esc(sec.id)}">${esc(sec.id)}</div>`,
      iconSize: [null, 24],
      iconAnchor: [30, 12]
    });
    const marker = window.L.marker([sec.latitud, sec.longitud], { icon }).addTo(map);
    marker.bindTooltip(`${sec.nombre}`, { direction: "top" });
    marker.on("click", () => seleccionarSectorEnMapa(sec.id));
    state.markers.set(sec.id, marker);
  }

  state.map = map;
}

function normalizarAnguloContinuo(motoristaId, targetDeg) {
  const objetivo = Number(targetDeg || 0);
  const previo = state.driverHeadings.get(motoristaId);
  if (previo === undefined) {
    state.driverHeadings.set(motoristaId, objetivo);
    return objetivo;
  }
  const actualMod = ((previo % 360) + 360) % 360;
  const delta = ((objetivo - actualMod + 540) % 360) - 180;
  const unwrapped = previo + delta;
  state.driverHeadings.set(motoristaId, unwrapped);
  return unwrapped;
}

function renderMarcadoresEnVivo(data) {
  if (!state.map || typeof window.L === "undefined") return;

  const sectores = data.sectores || [];
  const sectorOrigen = sectores.find((s) => s.id === els.selectOrigen.value);
  if (sectorOrigen) {
    if (!state.userGpsMarker) {
      const gpsIcon = window.L.divIcon({
        className: "",
        html: `<div class="user-gps-marker" title="Tu ubicación de recogida"><div class="user-gps-cone"></div><div class="user-gps-dot"></div></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      state.userGpsMarker = window.L.marker([sectorOrigen.latitud, sectorOrigen.longitud], {
        icon: gpsIcon,
        zIndexOffset: 700
      }).addTo(state.map);
    } else {
      state.userGpsMarker.setLatLng([sectorOrigen.latitud, sectorOrigen.longitud]);
    }
  }

  for (const mot of data.motoristas || []) {
    if (typeof mot.latitud !== "number" || typeof mot.longitud !== "number") continue;
    const ocupada = !mot.disponible;
    const placa = mot.motoActiva ? mot.motoActiva.placa : "MOTO";
    const rumboContinuo = normalizarAnguloContinuo(mot.identificacion, mot.direccionGrados);
    const html = `${crearSvgMotoCenital(ocupada, rumboContinuo)}<div class="moto-badge-tag">${esc(placa)}</div>`;
    const existing = state.driverMarkers.get(mot.identificacion);
    if (existing) {
      existing.setLatLng([mot.latitud, mot.longitud]);
      const iconEl = existing.getElement();
      if (iconEl) {
        const rotEl = iconEl.querySelector(".moto-svg-rotator");
        if (rotEl) {
          rotEl.style.transform = `rotate(${rumboContinuo}deg)`;
        }
      }
    } else {
      const motoIcon = window.L.divIcon({
        className: "",
        html,
        iconSize: [44, 48],
        iconAnchor: [22, 20]
      });
      const marker = window.L.marker([mot.latitud, mot.longitud], {
        icon: motoIcon,
        zIndexOffset: 800
      }).addTo(state.map);
      marker.bindTooltip(`${mot.nombre} (${placa})`, { direction: "top" });
      state.driverMarkers.set(mot.identificacion, marker);
    }
  }
}

function seleccionarSectorEnMapa(sectorId) {
  if (state.nextPinTarget === "origen" && sectorId !== els.selectDestino.value) {
    els.selectOrigen.value = sectorId;
    state.nextPinTarget = "destino";
  } else if (sectorId !== els.selectOrigen.value) {
    els.selectDestino.value = sectorId;
    state.nextPinTarget = "origen";
  }
  actualizarRutaDesdeSectores();
}

function dibujarPolilineaEnMapa(puntos, ajustarEncuadre = true) {
  if (!state.map || typeof window.L === "undefined") return;
  if (state.routeLine) {
    state.routeLine.remove();
    state.routeLine = null;
  }
  if (!puntos || puntos.length === 0) return;

  const latLngs = puntos.map((p) => (Array.isArray(p) ? p : [p.latitud, p.longitud]));
  state.routeLine = window.L.polyline(latLngs, {
    color: "#0F6B36",
    weight: 5,
    dashArray: latLngs.length <= 12 ? "8 6" : null,
    opacity: 0.92
  }).addTo(state.map);

  if (ajustarEncuadre && latLngs.length >= 2) {
    state.map.fitBounds(state.routeLine.getBounds(), { padding: [54, 54], maxZoom: 15 });
  }
}

function pintarRutaEnMapa(ajustarEncuadre = true) {
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

  if (origen && destino) {
    const puntos =
      state.lastPolilinea.length >= 2
        ? state.lastPolilinea
        : [
            [origen.latitud, origen.longitud],
            [destino.latitud, destino.longitud]
          ];
    dibujarPolilineaEnMapa(puntos, ajustarEncuadre);
    els.coordsReadout.textContent = `Lat ${origen.latitud.toFixed(4)} N · Lon ${origen.longitud.toFixed(4)} W`;
  }
  renderMarcadoresEnVivo(state.data);
}

async function intentarOsrmRuta(origen, destino, key) {
  if (origen.id === destino.id || typeof AbortController === "undefined") return;
  const baseOsrm = state.mapConfig?.osrmRouteUrl || "https://router.project-osrm.org/route/v1/driving";
  const url = `${baseOsrm}/${origen.longitud},${origen.latitud};${destino.longitud},${destino.latitud}?overview=full&geometries=geojson`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2400);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return;
    const json = await res.json();
    const coords = json?.routes?.[0]?.geometry?.coordinates;
    if (Array.isArray(coords) && coords.length >= 2 && state.lastOsrmKey === key) {
      state.lastPolilinea = coords.map(([lng, lat]) => ({ latitud: lat, longitud: lng }));
      pintarRutaEnMapa(true);
    }
  } catch {
    // Mantiene polilinea institucional del servidor si OSRM no responde
  } finally {
    clearTimeout(timer);
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
      if (Array.isArray(ruta.polilinea)) state.lastPolilinea = ruta.polilinea;

      const key = `${origenId}->${destinoId}`;
      state.lastOsrmKey = key;

      els.overlayDist.textContent = `${state.routeKm.toFixed(2)} km`;
      els.overlayEta.textContent = `${state.routeMin} min`;
      els.overlayCorridor.textContent = `${ruta.origen.nombre} → ${ruta.destino.nombre}`;
      els.previewRutaKm.textContent = `${state.routeKm.toFixed(2)} km · ${state.routeMin} min`;
      if (els.searchActiveSummary) {
        els.searchActiveSummary.textContent = `${ruta.origen.id} → ${ruta.destino.id} · ${state.routeKm.toFixed(2)} km`;
      }
      actualizarPreviewTarifa();
      pintarRutaEnMapa(true);
      intentarOsrmRuta(ruta.origen, ruta.destino, key);
      return;
    }
  } catch (err) {
    console.warn("Error cotizando ruta:", err);
  }
  pintarRutaEnMapa(true);
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

  renderQuickAccountsModal(data);
  actualizarBannerSesion();
}

function renderQuickAccountsModal(data) {
  if (!els.quickAccountsList) return;
  const estButtons = data.estudiantes.map(
    (e) => `
      <button type="button" class="quick-account-btn" data-quick-login="${esc(e.identificacion)}" data-quick-role="pasajero">
        <div>
          <strong>${esc(e.nombre)}</strong>
          <div class="muted-sub">Pasajero · ${esc(e.carrera)} (${esc(e.codigo)})</div>
        </div>
        <span class="chip-mono chip-verified">PASAJERO</span>
      </button>`
  );
  const motButtons = data.motoristas.map((m) => {
    const placa = m.motoActiva ? m.motoActiva.placa : "SIN-MOTO";
    return `
      <button type="button" class="quick-account-btn" data-quick-login="${esc(m.identificacion)}" data-quick-role="motorista">
        <div>
          <strong>${esc(m.nombre)}</strong>
          <div class="muted-sub">Moto ${esc(placa)} · SOAT Activo</div>
        </div>
        <span class="chip-mono chip-ochre-soft">MOTORISTA</span>
      </button>`;
  });
  els.quickAccountsList.innerHTML = [...estButtons, ...motButtons].join("");
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

function renderSeguimientoEnVivo(data) {
  const estId = els.selectEstudiante.value;
  const viajesOrdenados = [...data.viajes].reverse();
  const viajeActivo =
    viajesOrdenados.find(
      (v) =>
        v.estudiante.id === estId &&
        (v.estado === "SOLICITADO" ||
          v.estado === "ACEPTADO" ||
          v.estado === "EN_CURSO" ||
          (v.estado === "FINALIZADO" && !v.llegadaSeguraConfirmada))
    ) ||
    viajesOrdenados.find(
      (v) => v.estado === "SOLICITADO" || v.estado === "ACEPTADO" || v.estado === "EN_CURSO"
    );

  const hayMovimiento =
    viajeActivo && (viajeActivo.estado === "ACEPTADO" || viajeActivo.estado === "EN_CURSO");
  els.btnSimularTracking.classList.toggle("hidden", !hayMovimiento);
  els.btnSimularTracking.classList.toggle("running", Boolean(state.autoSimTimer));
  els.btnSimularTracking.textContent = state.autoSimTimer ? "⏸ Pausar GPS" : "▶ Simular GPS";
  if (els.mobileTrackingDot) {
    els.mobileTrackingDot.classList.toggle("hidden", !viajeActivo);
  }

  if (!viajeActivo) {
    detenerAutoSimulacion();
    els.liveTrackingCard.classList.add("hidden");
    return;
  }

  els.liveTrackingCard.classList.remove("hidden");
  els.trackingPin.textContent = viajeActivo.pinSeguridad || "4821";
  const progreso = Number(viajeActivo.progresoRuta || 0);
  els.trackingProgressBar.style.width = `${progreso}%`;
  els.trackingProgressPct.textContent = `${progreso}% del tramo`;
  const etaRestante = Math.max(1, Math.round(((100 - progreso) / 100) * Math.max(2, state.routeMin)));
  els.trackingEtaLive.textContent =
    viajeActivo.estado === "FINALIZADO"
      ? "En destino"
      : viajeActivo.estado === "SOLICITADO"
        ? "Buscando..."
        : `ETA ~${etaRestante} min`;

  const btns = [];
  if (viajeActivo.estado === "SOLICITADO") {
    els.trackingStageBadge.textContent = `RADAR ACTIVO · ${viajeActivo.codigo}`;
    els.trackingTitle.textContent = "Buscando motorista verificado...";
    els.trackingSubtitle.textContent = `${viajeActivo.origen} → ${viajeActivo.destino} (${formatoCop(viajeActivo.tarifa)})`;
    els.trackingDriverBox.classList.add("hidden");
    btns.push(
      `<button type="button" class="btn-danger-outline" data-cancelar-viaje="${esc(viajeActivo.codigo)}">Cancelar Solicitud</button>`
    );
  } else if (viajeActivo.estado === "ACEPTADO") {
    els.trackingStageBadge.textContent = `CAMINO AL ORIGEN · ${viajeActivo.codigo}`;
    els.trackingTitle.textContent = "Tu motorista está llegando";
    els.trackingSubtitle.textContent = `Comparte tu PIN ${viajeActivo.pinSeguridad} al abordar la motocicleta.`;
    btns.push(
      `<button type="button" class="btn-primary btn-sm" data-simular-paso="${esc(viajeActivo.codigo)}">Avanzar Moto (+25%)</button>`
    );
    btns.push(
      `<button type="button" class="btn-chip" data-toggle-autosim="${esc(viajeActivo.codigo)}">${state.autoSimTimer ? "Pausar Tracking" : "Auto-Tracking"}</button>`
    );
  } else if (viajeActivo.estado === "EN_CURSO") {
    els.trackingStageBadge.textContent = `VIAJE PROTEGIDO · ${viajeActivo.codigo}`;
    els.trackingTitle.textContent = "En camino a tu destino";
    els.trackingSubtitle.textContent = `${viajeActivo.origen} → ${viajeActivo.destino}`;
    btns.push(
      `<button type="button" class="btn-primary btn-sm" data-simular-paso="${esc(viajeActivo.codigo)}">Avanzar Ruta (+25%)</button>`
    );
    btns.push(
      `<button type="button" class="btn-chip" data-toggle-autosim="${esc(viajeActivo.codigo)}">${state.autoSimTimer ? "Pausar Tracking" : "Auto-Tracking"}</button>`
    );
  } else if (viajeActivo.estado === "FINALIZADO") {
    detenerAutoSimulacion();
    els.trackingStageBadge.textContent = `LLEGADA AL DESTINO · ${viajeActivo.codigo}`;
    els.trackingTitle.textContent = "¡Llegaste a tu destino!";
    els.trackingSubtitle.textContent = `Pago ${viajeActivo.pago.metodo} (${viajeActivo.pago.estado})`;
    if (!viajeActivo.llegadaSeguraConfirmada) {
      btns.push(
        `<button type="button" class="btn-primary btn-sm" data-llegada-segura="${esc(viajeActivo.codigo)}">Confirmar Llegada Segura</button>`
      );
    }
    if (viajeActivo.calificaciones.length === 0) {
      btns.push(
        `<button type="button" class="btn-chip" data-calificar-viaje="${esc(viajeActivo.codigo)}">Calificar Motorista</button>`
      );
    }
  }

  if (viajeActivo.motorista) {
    const motFull = data.motoristas.find((m) => m.identificacion === viajeActivo.motorista.id);
    const motoTxt = motFull?.motoActiva
      ? `${motFull.motoActiva.marca} ${motFull.motoActiva.modelo} · SOAT Vigente`
      : "Motocicleta Verificada · SOAT";
    els.trackingDriverBox.classList.remove("hidden");
    els.trackingDriverInitials.textContent = iniciales(viajeActivo.motorista.nombre);
    els.trackingDriverName.textContent = viajeActivo.motorista.nombre;
    els.trackingMotoDesc.textContent = motoTxt;
    els.trackingMotoPlate.textContent = viajeActivo.motorista.placaMoto;
  }

  els.trackingActionsRow.innerHTML = btns.join("");
}

function renderMotorista(data) {
  const mot = data.motoristas.find((m) => m.identificacion === els.selectMotorista.value);
  if (mot) {
    if (mot.motoActiva) {
      els.driverMotoInfo.textContent = `${mot.motoActiva.marca} ${mot.motoActiva.modelo} ${mot.motoActiva.cilindraje}cc · Placa ${mot.motoActiva.placa} · ${mot.motoActiva.numeroSoat}`;
      els.driverSoatBadge.textContent = mot.motoActiva.soatVigente ? "SOAT VIGENTE" : "SOAT INACTIVO";
    }
    els.btnToggleDisponibilidad.classList.toggle("active", mot.disponible);
    els.btnToggleDisponibilidad.setAttribute("aria-pressed", String(mot.disponible));
    els.toggleDisponibilidadText.textContent = mot.disponible ? "En línea" : "En servicio / Off";
    els.driverOnlineStatusLabel.textContent = mot.disponible
      ? "En línea · Recibiendo pedidos"
      : "Ocupado o fuera de línea";
    if (typeof mot.latitud === "number" && typeof mot.longitud === "number") {
      els.driverCoordsChip.textContent = `Lat ${mot.latitud.toFixed(4)} · Lon ${mot.longitud.toFixed(4)} · ${mot.direccionGrados || 0}°`;
    }
  }

  const activo = data.viajes.find(
    (v) => v.motorista && v.motorista.id === els.selectMotorista.value && (v.estado === "ACEPTADO" || v.estado === "EN_CURSO")
  );
  if (activo) {
    els.driverActiveBox.classList.remove("hidden");
    els.driverActiveBox.dataset.codigo = activo.codigo;
    els.driverTripCode.textContent = activo.codigo;
    els.driverTripState.textContent = activo.estado;
    els.driverTripPin.textContent = `PIN: ${activo.pinSeguridad || "4821"}`;
    els.driverTrackingStageText.textContent =
      activo.estado === "ACEPTADO"
        ? `Rumbo al origen (${activo.progresoRuta || 0}%) · Verifica el PIN con el estudiante`
        : `Viaje en curso (${activo.progresoRuta || 0}%) · Ruta hacia destino`;
    els.driverProgressBar.style.width = `${Number(activo.progresoRuta || 0)}%`;
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
    els.radarList.innerHTML = renderEmptyState(
      "Sin solicitudes pendientes en campus",
      "Cuando un estudiante pida moto aparecerá aquí en tiempo real."
    );
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
            <span class="chip-mono chip-verified">PIN ${esc(v.pinSeguridad || "----")}</span>
          </div>
          <strong class="mono-text">${formatoCop(v.tarifa)}</strong>
        </div>
        <div class="ride-route">${esc(v.origen)} → ${esc(v.destino)}</div>
        <div class="ride-meta">${esc(v.estudiante.nombre)} · ${esc(v.distanciaKm)} km · ${esc(v.estrategia)} · ${esc(v.pago.metodo)}</div>
        <div class="ride-actions">
          <span class="chip-mono chip-verified">RUTA VERIFICADA</span>
          <button type="button" class="btn-primary btn-sm" data-aceptar-viaje="${esc(v.codigo)}">Aceptar Pedido</button>
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
    els.viajesFeed.innerHTML = renderEmptyState(
      "Sin trayectos registrados aún",
      "Toca '¿A dónde vamos?' o los pines del mapa para pedir tu primera moto."
    );
    return;
  }

  els.viajesFeed.innerHTML = viajes
    .map((v) => {
      const driverHtml = v.motorista
        ? `${esc(v.motorista.nombre)} · Placa <span class="mono-text">${esc(v.motorista.placaMoto)}</span>`
        : "Pendiente por asignación";
      const soatChip =
        v.motorista && v.motorista.soatVigente
          ? `<span class="chip-mono chip-verified">SOAT VIGENTE</span>`
          : "";
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
        botones.push(`<button type="button" class="btn-chip" data-simular-paso="${esc(v.codigo)}">GPS +25%</button>`);
        botones.push(`<button type="button" class="btn-primary btn-sm" data-iniciar-viaje="${esc(v.codigo)}">Iniciar</button>`);
        botones.push(`<button type="button" class="btn-danger-outline" data-cancelar-viaje="${esc(v.codigo)}">Cancelar</button>`);
      } else if (v.estado === "EN_CURSO") {
        botones.push(`<button type="button" class="btn-chip" data-simular-paso="${esc(v.codigo)}">GPS +25%</button>`);
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
              ${v.pinSeguridad ? `<span class="chip-mono chip-neutral">PIN ${esc(v.pinSeguridad)}</span>` : ""}
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
  renderMarcadoresEnVivo(data);
  renderSeguimientoEnVivo(data);
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

function detenerAutoSimulacion() {
  if (state.autoSimTimer) {
    clearInterval(state.autoSimTimer);
    state.autoSimTimer = null;
    state.autoSimCodigo = null;
  }
}

async function avanzarTrackingPaso(codigoViaje, incremento = 25) {
  const data = await postJson("/api/viajes/tracking", { codigoViaje, incremento });
  await cargarEstado(false);
  if (data.progresoRuta >= 100 && state.autoSimTimer) {
    detenerAutoSimulacion();
    showToast(
      data.estado === "ACEPTADO"
        ? `Motorista llegó al punto de recogida (${codigoViaje})`
        : `Motorista llegó al destino (${codigoViaje})`,
      "success"
    );
  }
  return data;
}

function toggleAutoSimulacion(codigoViaje) {
  if (state.autoSimTimer) {
    detenerAutoSimulacion();
    renderSeguimientoEnVivo(state.data);
    return;
  }
  state.autoSimCodigo = codigoViaje;
  avanzarTrackingPaso(codigoViaje, 25).catch((e) => showToast(e.message, "error"));
  state.autoSimTimer = setInterval(() => {
    if (!state.autoSimCodigo) return;
    avanzarTrackingPaso(state.autoSimCodigo, 25).catch(() => detenerAutoSimulacion());
  }, 1500);
  renderSeguimientoEnVivo(state.data);
}

function conectarSse() {
  if (typeof window.EventSource === "undefined") return;
  const es = new window.EventSource("/api/eventos");
  es.addEventListener("conectado", () => {
    els.ssePill.classList.remove("offline");
    els.sseLabel.textContent = "En vivo · SSE";
  });
  es.addEventListener("dominio", () => {
    cargarEstado(false);
  });
  es.onerror = () => {
    els.ssePill.classList.add("offline");
    els.sseLabel.textContent = "Reconectando SSE";
  };
}

function abrirModalLogin(tab = "rapido") {
  els.modalLogin.classList.remove("hidden");
  document.querySelectorAll("[data-login-tab]").forEach((t) => {
    t.classList.toggle("active", t.dataset.loginTab === tab);
  });
  els.loginTabRapido.classList.toggle("hidden", tab !== "rapido");
  els.formLogin.classList.toggle("hidden", tab !== "credenciales");
  els.loginTabGmaps.classList.toggle("hidden", tab !== "googlemaps");
}

// --- EVENTOS UI ---
els.btnPasajero.addEventListener("click", () => setRole("pasajero"));
els.btnMotorista.addEventListener("click", () => setRole("motorista"));
els.selectEstudiante.addEventListener("change", () => {
  actualizarBannerSesion();
  if (state.data) renderSeguimientoEnVivo(state.data);
});
els.selectMotorista.addEventListener("change", () => {
  actualizarBannerSesion();
  if (state.data) renderMotorista(state.data);
});
els.selectOrigen.addEventListener("change", actualizarRutaDesdeSectores);
els.selectDestino.addEventListener("change", actualizarRutaDesdeSectores);

els.btnIntercambiar.addEventListener("click", () => {
  const temp = els.selectOrigen.value;
  els.selectOrigen.value = els.selectDestino.value;
  els.selectDestino.value = temp;
  actualizarRutaDesdeSectores();
});

els.btnCentrarMapa.addEventListener("click", () => pintarRutaEnMapa(true));

if (els.btnToggleSheet && els.didiStage) {
  els.btnToggleSheet.addEventListener("click", () => {
    const peeked = els.didiStage.classList.toggle("sheet-peek");
    els.btnToggleSheet.setAttribute("aria-expanded", String(!peeked));
    if (els.sheetToggleHint) {
      els.sheetToggleHint.textContent = peeked ? "Mostrar panel completo" : "Ver más mapa";
    }
    setTimeout(() => {
      if (state.map) {
        state.map.invalidateSize();
        pintarRutaEnMapa(true);
      }
    }, 300);
  });
}

els.mobileTabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.mobileTab;
    if (els.didiStage && els.didiStage.classList.contains("sheet-peek")) {
      els.didiStage.classList.remove("sheet-peek");
      if (els.btnToggleSheet) els.btnToggleSheet.setAttribute("aria-expanded", "true");
      if (els.sheetToggleHint) els.sheetToggleHint.textContent = "Ver más mapa";
      setTimeout(() => state.map && state.map.invalidateSize(), 300);
    }

    if (tab === "motorista") {
      setRole("motorista");
      els.panelMotorista.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (tab === "actividad") {
      actualizarTabMovilActiva("actividad");
      els.sectionActividad?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setRole("pasajero");
    actualizarTabMovilActiva(tab);
    if (tab === "tracking") {
      if (!els.liveTrackingCard.classList.contains("hidden")) {
        els.liveTrackingCard.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        showToast("Sin viaje en curso. Solicita una moto en '¿A dónde vamos?'");
        els.didiSearchTrigger.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      els.didiSearchTrigger.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

els.btnSimularTracking.addEventListener("click", () => {
  const activo = (state.data?.viajes || []).find(
    (v) => v.estado === "ACEPTADO" || v.estado === "EN_CURSO"
  );
  if (activo) toggleAutoSimulacion(activo.codigo);
});

els.didiSearchTrigger.addEventListener("click", () => {
  els.selectDestino.focus();
  els.formSolicitar.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

els.btnTarifaInteligente.addEventListener("click", () => {
  const opt = document.querySelector('input[name="tarifa"][value="estudiantil"]');
  if (opt) {
    opt.checked = true;
    actualizarPreviewTarifa();
  }
  showToast("Tarifa Estudiantil Inteligente aplicada ($2.500 COP)", "success");
});

els.btnElegirCuenta.addEventListener("click", () => abrirModalLogin("rapido"));
els.btnAbrirLogin.addEventListener("click", () => abrirModalLogin("rapido"));
els.btnAbrirLoginBadge.addEventListener("click", () => abrirModalLogin("googlemaps"));
els.btnSesionTopbar.addEventListener("click", () => abrirModalLogin("rapido"));
els.btnMapEnginePill.addEventListener("click", () => abrirModalLogin("googlemaps"));
els.btnCerrarLogin.addEventListener("click", () => els.modalLogin.classList.add("hidden"));

document.querySelectorAll("[data-login-tab]").forEach((tab) => {
  tab.addEventListener("click", () => abrirModalLogin(tab.dataset.loginTab));
});

document.querySelectorAll("[data-quick-dest]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const destId = btn.dataset.quickDest;
    if (els.selectOrigen.value === destId) {
      els.selectOrigen.value = destId === "PORVENIR" ? "CENTRO" : "PORVENIR";
    }
    els.selectDestino.value = destId;
    actualizarRutaDesdeSectores();
  });
});

document.querySelectorAll("[data-recent-route]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const [orig, dest] = (btn.dataset.recentRoute || "").split("|");
    if (orig && dest) {
      els.selectOrigen.value = orig;
      els.selectDestino.value = dest;
      actualizarRutaDesdeSectores();
    }
  });
});

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
    showToast(`Viaje ${res.codigo} solicitado · PIN ${res.pinSeguridad}`, "success");
    await cargarEstado(false);
  } catch (err) {
    showToast(err.message, "error");
  }
});

els.btnToggleDisponibilidad.addEventListener("click", async () => {
  const mot = state.data?.motoristas.find((m) => m.identificacion === els.selectMotorista.value);
  if (!mot) return;
  try {
    const res = await postJson("/api/motoristas/disponibilidad", {
      motoristaId: mot.identificacion,
      disponible: !mot.disponible
    });
    showToast(
      res.disponible ? "Motorista en línea recibiendo pedidos" : "Motorista desconectado",
      "success"
    );
    await cargarEstado(false);
  } catch (err) {
    showToast(err.message, "error");
  }
});

els.btnDriverSimularPaso.addEventListener("click", async () => {
  const codigo = els.driverActiveBox.dataset.codigo;
  if (!codigo) return;
  try {
    const data = await avanzarTrackingPaso(codigo, 25);
    showToast(`Tracking ${codigo}: ${data.progresoRuta}%`, "success");
  } catch (err) {
    showToast(err.message, "error");
  }
});

document.addEventListener("click", async (e) => {
  const target = e.target.closest("button");
  if (!target) return;

  try {
    if (target.dataset.quickLogin) {
      const sesion = await postJson("/api/auth/login", {
        identificador: target.dataset.quickLogin,
        rol: target.dataset.quickRole
      });
      await cargarEstado(false);
      if (sesion.rol === "motorista") {
        els.selectMotorista.value = sesion.identificacion;
        setRole("motorista");
      } else {
        els.selectEstudiante.value = sesion.identificacion;
        setRole("pasajero");
      }
      els.modalLogin.classList.add("hidden");
      showToast(`Sesión iniciada como ${sesion.nombre}`, "success");
    } else if (target.dataset.aceptarViaje) {
      const r = await postJson("/api/viajes/aceptar", {
        codigoViaje: target.dataset.aceptarViaje,
        motoristaId: els.selectMotorista.value
      });
      showToast(`Viaje ${target.dataset.aceptarViaje} aceptado · PIN ${r.pinSeguridad}`, "success");
      await cargarEstado(false);
    } else if (target.dataset.simularPaso) {
      const d = await avanzarTrackingPaso(target.dataset.simularPaso, 25);
      showToast(`GPS actualizado: ${d.progresoRuta}% del tramo`, "success");
    } else if (target.dataset.toggleAutosim) {
      toggleAutoSimulacion(target.dataset.toggleAutosim);
    } else if (target.dataset.iniciarViaje) {
      await postJson("/api/viajes/iniciar", { codigoViaje: target.dataset.iniciarViaje });
      showToast(`Viaje ${target.dataset.iniciarViaje} iniciado`, "success");
      await cargarEstado(false);
    } else if (target.dataset.finalizarViaje) {
      detenerAutoSimulacion();
      await postJson("/api/viajes/finalizar", { codigoViaje: target.dataset.finalizarViaje });
      showToast(`Viaje ${target.dataset.finalizarViaje} finalizado`, "success");
      await cargarEstado(false);
    } else if (target.dataset.llegadaSegura) {
      await postJson("/api/viajes/llegada-segura", { codigoViaje: target.dataset.llegadaSegura });
      showToast(`Llegada segura verificada para ${target.dataset.llegadaSegura}`, "success");
      await cargarEstado(false);
    } else if (target.dataset.cancelarViaje) {
      detenerAutoSimulacion();
      await postJson("/api/viajes/cancelar", {
        codigoViaje: target.dataset.cancelarViaje,
        motivo: "Cancelado desde panel campus"
      });
      showToast(`Viaje ${target.dataset.cancelarViaje} cancelado`);
      await cargarEstado(false);
    } else if (target.dataset.calificarViaje) {
      state.calificandoCodigo = target.dataset.calificarViaje;
      els.calificarCodigo.textContent = target.dataset.calificarViaje;
      els.modalCalificar.classList.remove("hidden");
    }
  } catch (err) {
    showToast(err.message, "error");
  }
});

els.formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const sesion = await postJson("/api/auth/login", {
      identificador: document.getElementById("login-identificador").value,
      rol: document.getElementById("login-rol").value
    });
    await cargarEstado(false);
    if (sesion.rol === "motorista") {
      els.selectMotorista.value = sesion.identificacion;
      setRole("motorista");
    } else {
      els.selectEstudiante.value = sesion.identificacion;
      setRole("pasajero");
    }
    els.modalLogin.classList.add("hidden");
    els.formLogin.reset();
    showToast(`Bienvenido ${sesion.nombre}`, "success");
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
    await cargarEstado(false);
  } catch (err) {
    showToast(err.message, "error");
  }
});

els.btnFinalizarViaje.addEventListener("click", async () => {
  const codigo = els.driverActiveBox.dataset.codigo;
  if (!codigo) return;
  try {
    detenerAutoSimulacion();
    await postJson("/api/viajes/finalizar", { codigoViaje: codigo });
    showToast(`Trayecto ${codigo} finalizado`, "success");
    await cargarEstado(false);
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
    await cargarEstado(false);
    els.selectEstudiante.value = res.identificacion;
    actualizarBannerSesion();
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
    await cargarEstado(false);
    els.selectMotorista.value = res.identificacion;
    actualizarBannerSesion();
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
    await cargarEstado(false);
  } catch (err) {
    showToast(err.message, "error");
  }
});

async function sincronizarSesionCookie() {
  try {
    const res = await fetch("/api/auth/me", { credentials: "same-origin" });
    if (!res.ok) return;
    const data = await res.json();
    if (!data.autenticado || !data.usuario) return;

    const rol = data.usuario.rol === "motorista" ? "motorista" : "pasajero";
    if (rol === "motorista" && els.selectMotorista) {
      els.selectMotorista.value = data.usuario.identificacion;
    } else if (els.selectEstudiante) {
      els.selectEstudiante.value = data.usuario.identificacion;
    }
    setRole(rol);
  } catch {
    // Fallback silencioso si no hay sesión cookie activa
  }
}

// --- INIT ---
conectarSse();
cargarConfigMapa()
  .finally(() => cargarEstado(true))
  .finally(() => sincronizarSesionCookie());
