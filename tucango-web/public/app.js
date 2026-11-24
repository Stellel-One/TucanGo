const state = {
  data: null,
  authUser: null,
  role: "pasajero",
  adminShowMap: false,
  calificandoCodigo: null,
  routeKm: 1.15,
  routeMin: 3,
  tarifas: {
    estudiantil: 2500,
    distancia: 3000,
    lluvia: 3500,
    nocturna: 3750
  },
  map: null,
  mapEngine: "google",
  gmapsLoaded: false,
  mapboxLoaded: false,
  mapConfig: null,
  mapConfigPromise: null,
  trafficLayer: null,
  trafficEnabled: false,
  geocoder: null,
  infoWindow: null,
  markers: new Map(),
  savedPlaceMarkers: new Map(),
  adminHeatmapCircles: [],
  userGpsMarker: null,
  vehicleMarker: null,
  vehicleMarkerEl: null,
  vehiclePos: null,
  vehicleAnimFrame: null,
  vehicleFacingWest: false,
  realGps: null,
  prevGps: null,
  realAddressLabel: "",
  lastGeocodePos: null,
  gpsWatchId: null,
  lastGpsPostTs: 0,
  pickingMapPlace: false,
  tempPickMarker: null,
  routeLine: null,
  routeLineCasing: null,
  nextPinTarget: "destino",
  lastRouteKey: "",
  lastPolilinea: [],
  ubicacionesGuardadas: [],
  perfilActual: null,
  charts: {}
};

const els = {
  ssePill: document.getElementById("sse-pill"),
  sseLabel: document.getElementById("sse-label"),
  btnAdminToggleMap: document.getElementById("btn-admin-toggle-map"),
  btnAdminToggleMapLabel: document.getElementById("btn-admin-toggle-map-label"),
  btnSesionTopbar: document.getElementById("btn-sesion-topbar"),
  sessionAvatarInitials: document.getElementById("session-avatar-initials"),
  sessionUserName: document.getElementById("session-user-name"),
  roleLockedBadge: document.getElementById("role-locked-badge"),
  btnCerrarSesionApp: document.getElementById("btn-cerrar-sesion-app"),
  adminDashboardView: document.getElementById("admin-dashboard-view"),
  btnAdminExportCsv: document.getElementById("btn-admin-export-csv"),
  adminKpiEstudiantes: document.getElementById("admin-kpi-estudiantes"),
  adminKpiBarriosCount: document.getElementById("admin-kpi-barrios-count"),
  adminKpiTucanes: document.getElementById("admin-kpi-tucanes"),
  adminKpiPendientes: document.getElementById("admin-kpi-pendientes"),
  adminKpiViajes: document.getElementById("admin-kpi-viajes"),
  adminKpiCumplimiento: document.getElementById("admin-kpi-cumplimiento"),
  adminKpiSeguras: document.getElementById("admin-kpi-seguras"),
  adminKpiKm: document.getElementById("admin-kpi-km"),
  adminKpiKmProm: document.getElementById("admin-kpi-km-prom"),
  adminKpiVolumen: document.getElementById("admin-kpi-volumen"),
  adminTabPendBadge: document.getElementById("admin-tab-pend-badge"),
  adminPanelAnalitica: document.getElementById("admin-panel-analitica"),
  adminPanelAuditoria: document.getElementById("admin-panel-auditoria"),
  adminPanelComunidad: document.getElementById("admin-panel-comunidad"),
  adminPanelTrazabilidad: document.getElementById("admin-panel-trazabilidad"),
  adminTablaTrazabilidad: document.getElementById("admin-tabla-trazabilidad"),
  adminInlinePendientes: document.getElementById("admin-inline-pendientes"),
  adminInlineCorreos: document.getElementById("admin-inline-correos"),
  adminTablaEstudiantes: document.getElementById("admin-tabla-estudiantes"),
  adminTablaTucanes: document.getElementById("admin-tabla-tucanes"),
  panelPasajero: document.getElementById("panel-pasajero"),
  panelMotorista: document.getElementById("panel-motorista"),
  selectEstudiante: document.getElementById("select-estudiante"),
  selectMotorista: document.getElementById("select-motorista"),
  selectOrigen: document.getElementById("select-origen"),
  selectDestino: document.getElementById("select-destino"),
  btnIntercambiar: document.getElementById("btn-intercambiar-ruta"),
  savedPlacesBar: document.getElementById("saved-places-bar"),
  btnAbrirGuardarLugar: document.getElementById("btn-abrir-guardar-lugar"),
  btnPerfilAgregarLugar: document.getElementById("btn-perfil-agregar-lugar"),
  perfilUbicacionesCard: document.getElementById("perfil-ubicaciones-card"),
  perfilUbicacionesList: document.getElementById("perfil-ubicaciones-list"),
  modalLugarFrecuente: document.getElementById("modal-lugar-frecuente"),
  btnCerrarLugar: document.getElementById("btn-cerrar-lugar"),
  formGuardarLugar: document.getElementById("form-guardar-lugar"),
  lugarEtiqueta: document.getElementById("lugar-etiqueta"),
  lugarBarrio: document.getElementById("lugar-barrio"),
  lugarNombre: document.getElementById("lugar-nombre"),
  lugarReferencia: document.getElementById("lugar-referencia"),
  lugarLat: document.getElementById("lugar-lat"),
  lugarLng: document.getElementById("lugar-lng"),
  btnLugarUsarGps: document.getElementById("btn-lugar-usar-gps"),
  btnLugarElegirMapa: document.getElementById("btn-lugar-elegir-mapa"),
  previewRutaKm: document.getElementById("preview-ruta-km"),
  previewTarifaCop: document.getElementById("preview-tarifa-cop"),
  overlayDist: document.getElementById("overlay-dist"),
  overlayEta: document.getElementById("overlay-eta"),
  overlayTrafficSep: document.getElementById("overlay-traffic-sep"),
  overlayTrafficBadge: document.getElementById("overlay-traffic-badge"),
  overlayCorridor: document.getElementById("overlay-corridor"),
  coordsReadout: document.getElementById("map-coords-readout"),
  activityBannerTitle: document.getElementById("activity-banner-title"),
  activityBannerSub: document.getElementById("activity-banner-sub"),
  metricLabel1: document.getElementById("metric-label-1"),
  metricTag1: document.getElementById("metric-tag-1"),
  metricLabel2: document.getElementById("metric-label-2"),
  metricTag2: document.getElementById("metric-tag-2"),
  metricLabel3: document.getElementById("metric-label-3"),
  metricTag3: document.getElementById("metric-tag-3"),
  metricLabel4: document.getElementById("metric-label-4"),
  metricTag4: document.getElementById("metric-tag-4"),
  metricTotal: document.getElementById("metric-total"),
  metricFinalizados: document.getElementById("metric-finalizados"),
  metricSolicitados: document.getElementById("metric-solicitados"),
  metricIngresos: document.getElementById("metric-ingresos"),
  feedSectionTitle: document.getElementById("feed-section-title"),
  feedSectionSub: document.getElementById("feed-section-sub"),
  formSolicitar: document.getElementById("form-solicitar"),
  viajesFeed: document.getElementById("viajes-feed"),
  feedCount: document.getElementById("feed-count"),
  liveTrackingCard: document.getElementById("live-tracking-card"),
  trackingStageBadge: document.getElementById("tracking-stage-badge"),
  trackingTitle: document.getElementById("tracking-title"),
  trackingSubtitle: document.getElementById("tracking-subtitle"),
  trackingPin: document.getElementById("tracking-pin"),
  trackingProgressBar: document.getElementById("tracking-progress-bar"),
  trackingProgressThumb: document.getElementById("tracking-progress-thumb"),
  trackingThumbImg: document.getElementById("tracking-thumb-img"),
  trackingProgressPct: document.getElementById("tracking-progress-pct"),
  trackingEtaLive: document.getElementById("tracking-eta-live"),
  trackingRadarStage: document.getElementById("tracking-radar-stage"),
  trackingModelStage: document.getElementById("tracking-model-stage"),
  trackingModelImg: document.getElementById("tracking-model-img"),
  trackingModelTag: document.getElementById("tracking-model-tag"),
  trackingModelDesc: document.getElementById("tracking-model-desc"),
  mapRappiBanner: document.getElementById("map-rappi-banner"),
  mapRappiModelImg: document.getElementById("map-rappi-model-img"),
  mapRappiTitle: document.getElementById("map-rappi-title"),
  mapRappiSubPrefix: document.getElementById("map-rappi-sub-prefix"),
  mapRappiEta: document.getElementById("map-rappi-eta"),
  mapRappiProgressFill: document.getElementById("map-rappi-progress-fill"),
  mapRappiProgressThumb: document.getElementById("map-rappi-progress-thumb"),
  mapEnginePill: document.getElementById("map-engine-pill"),
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
  inputPinViaje: document.getElementById("input-pin-viaje"),
  driverTrackingStageText: document.getElementById("driver-tracking-stage-text"),
  driverProgressBar: document.getElementById("driver-progress-bar"),
  driverTripPax: document.getElementById("driver-trip-pax"),
  driverTripRoute: document.getElementById("driver-trip-route"),
  driverTripPrice: document.getElementById("driver-trip-price"),
  btnIniciarViaje: document.getElementById("btn-iniciar-viaje"),
  btnFinalizarViaje: document.getElementById("btn-finalizar-viaje"),
  radarCount: document.getElementById("radar-count"),
  radarList: document.getElementById("radar-solicitudes-list"),
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
  sectionPerfil: document.getElementById("section-perfil"),
  perfilCardAvatar: document.getElementById("perfil-card-avatar"),
  perfilCardRol: document.getElementById("perfil-card-rol"),
  perfilCardNombre: document.getElementById("perfil-card-nombre"),
  perfilCardDetalle: document.getElementById("perfil-card-detalle"),
  perfilCardId: document.getElementById("perfil-card-id"),
  perfilStatViajes: document.getElementById("perfil-stat-viajes"),
  perfilStatRating: document.getElementById("perfil-stat-rating"),
  perfilStatMoneyLabel: document.getElementById("perfil-stat-money-label"),
  perfilStatAhorro: document.getElementById("perfil-stat-ahorro"),
  formPerfilUsuario: document.getElementById("form-perfil-usuario"),
  perfilInputId: document.getElementById("perfil-input-id"),
  perfilInputNombre: document.getElementById("perfil-input-nombre"),
  perfilInputTelefono: document.getElementById("perfil-input-telefono"),
  perfilInputCorreo: document.getElementById("perfil-input-correo"),
  perfilFieldsEstudiante: document.getElementById("perfil-fields-estudiante"),
  perfilInputCodigo: document.getElementById("perfil-input-codigo"),
  perfilInputCarrera: document.getElementById("perfil-input-carrera"),
  perfilInputBarrio: document.getElementById("perfil-input-barrio"),
  perfilFieldsMotorista: document.getElementById("perfil-fields-motorista"),
  perfilInputPlaca: document.getElementById("perfil-input-placa"),
  perfilInputMarca: document.getElementById("perfil-input-marca"),
  perfilInputModelo: document.getElementById("perfil-input-modelo"),
  perfilInputCc: document.getElementById("perfil-input-cc"),
  perfilInputSoat: document.getElementById("perfil-input-soat"),
  perfilInputSos: document.getElementById("perfil-input-sos"),
  perfilSelectSedeFav: document.getElementById("perfil-select-sede-fav"),
  perfilInputPassActual: document.getElementById("perfil-input-pass-actual"),
  perfilInputPassNueva: document.getElementById("perfil-input-pass-nueva"),
  btnGuardarPerfil: document.getElementById("btn-guardar-perfil"),
  mobileTabBtns: document.querySelectorAll("[data-mobile-tab]"),
  mobileTrackingDot: document.getElementById("mobile-tracking-dot"),
  btnAbrirAuditoria: document.getElementById("btn-abrir-auditoria"),
  countTucanesPendientes: document.getElementById("count-tucanes-pendientes"),
  modalAuditoriaTucanes: document.getElementById("modal-auditoria-tucanes"),
  btnCerrarAuditoria: document.getElementById("btn-cerrar-auditoria"),
  listaTucanesPendientes: document.getElementById("lista-tucanes-pendientes"),
  listaTucanesExpedientes: document.getElementById("lista-tucanes-expedientes"),
  listaCorreosAuditoria: document.getElementById("lista-correos-auditoria"),
  tabCountPendientes: document.getElementById("tab-count-pendientes"),
  tabCountExpedientes: document.getElementById("tab-count-expedientes"),
  tabCountCorreos: document.getElementById("tab-count-correos"),
  auditPanelPendientes: document.getElementById("audit-panel-pendientes"),
  auditPanelExpedientes: document.getElementById("audit-panel-expedientes"),
  auditPanelCorreos: document.getElementById("audit-panel-correos")
};

function tgIcon(symbolId, extraClass = "tg-icon-sm") {
  return `<svg class="tg-icon ${extraClass}" aria-hidden="true"><use href="/assets/icons/iconly-sprite.svg#${symbolId}"/></svg>`;
}

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

function inicialesNombre(nombre) {
  return iniciales(nombre);
}

function showToast(mensaje, tipo = "info") {
  if (!els.toasts) return;
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
  if (!state.authUser) return;
  const nombre = state.authUser.nombre || "TucanGo";
  els.sessionUserName.textContent =
    state.authUser.rol === "motorista" ? `${nombre.split(" ")[0]} · Tucán` : nombre;
  els.sessionAvatarInitials.textContent = iniciales(nombre);
}

function aplicarLayoutPorRol() {
  const esAdmin = state.authUser?.rol === "admin";
  if (els.btnAdminToggleMap) {
    els.btnAdminToggleMap.classList.toggle("hidden", !esAdmin);
  }

  if (esAdmin && !state.adminShowMap) {
    els.adminDashboardView?.classList.remove("hidden");
    els.didiStage?.classList.add("hidden");
    if (els.btnAdminToggleMapLabel) els.btnAdminToggleMapLabel.textContent = "Ver Mapa";
  } else {
    els.adminDashboardView?.classList.add("hidden");
    els.didiStage?.classList.remove("hidden");
    if (els.btnAdminToggleMapLabel) els.btnAdminToggleMapLabel.textContent = "Volver al Panel";
    if (state.map) {
      setTimeout(() => state.map.invalidateSize(), 200);
    }
  }
}

function switchTab(tabName) {
  state.currentTab = tabName;

  document.querySelectorAll("[data-tab], [data-mobile-tab]").forEach((btn) => {
    const t = btn.dataset.tab || btn.dataset.mobileTab;
    btn.classList.toggle("active", t === tabName);
  });

  const esMotorista = tabName === "motorista";
  const esActividad = tabName === "actividad";
  const esPerfil = tabName === "perfil";
  const esViajar = tabName === "viajar" || tabName === "tracking";

  els.panelPasajero?.classList.toggle("hidden", !esViajar);
  els.panelMotorista?.classList.toggle("hidden", !esMotorista);
  els.sectionActividad?.classList.toggle("hidden", !esActividad);
  els.sectionPerfil?.classList.toggle("hidden", !esPerfil);

  if (esPerfil) {
    cargarPerfilUsuario();
  }

  if (tabName === "tracking" && els.liveTrackingCard && !els.liveTrackingCard.classList.contains("hidden")) {
    els.liveTrackingCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (state.map) {
    setTimeout(() => state.map.invalidateSize(), 200);
  }
}

function setRole(role) {
  const esAdmin = state.authUser?.rol === "admin";
  const rolFinal = esAdmin ? role || "pasajero" : state.authUser?.rol || role;
  state.role = rolFinal;
  const esPasajero = rolFinal === "pasajero";

  if (els.roleLockedBadge) {
    els.roleLockedBadge.textContent = esAdmin ? "ADMIN" : esPasajero ? "ESTUDIANTE" : "TUCÁN";
    els.roleLockedBadge.classList.toggle("is-driver", !esPasajero && !esAdmin);
  }

  const tabMotoristaDesktop = document.getElementById("tab-motorista-desktop");
  if (tabMotoristaDesktop) {
    tabMotoristaDesktop.classList.toggle("hidden", esAdmin || esPasajero);
  }
  const tabMotoristaMobile = document.querySelector('[data-mobile-tab="motorista"]');
  if (tabMotoristaMobile) {
    tabMotoristaMobile.classList.toggle("hidden", esAdmin || esPasajero);
  }

  if (els.selectEstudiante) {
    els.selectEstudiante.disabled = !esAdmin && state.authUser?.rol === "pasajero";
  }
  if (els.selectMotorista) {
    els.selectMotorista.disabled = !esAdmin && state.authUser?.rol === "motorista";
  }

  els.mobileTabBtns.forEach((btn) => {
    const forRole = btn.dataset.forRole;
    btn.classList.toggle("hidden", !esAdmin && Boolean(forRole && forRole !== rolFinal));
  });

  aplicarLayoutPorRol();
  switchTab(esPasajero ? "viajar" : "motorista");
  actualizarBannerSesion();
}

// --- MAPA NATIVO GOOGLE MAPS + FALLBACK RESILIENTE ---
const FLORENCIA_BOUNDS_COORDS = [
  [1.5200, -75.6800],
  [1.6600, -75.5400]
];
const FLORENCIA_CENTRO = [1.6139, -75.6052];
const SEDES_POI_ACTIVOS = new Set(["PORVENIR", "CENTRO"]);
const googleRoutesCache = new Map();

function obtenerSedesActivas(sectores) {
  const filtradas = (sectores || []).filter((s) => SEDES_POI_ACTIVOS.has(s.id));
  return filtradas.length > 0 ? filtradas : sectores || [];
}

function obtenerCatalogoLugares() {
  const sedes = obtenerSedesActivas(state.data?.sectores || []);
  const guardados = (state.ubicacionesGuardadas || []).map((u) => ({
    id: u.id,
    nombre: `${u.etiqueta}: ${u.nombre}`,
    etiqueta: u.etiqueta,
    barrio: u.barrio,
    referencia: u.referencia || u.barrio,
    latitud: u.latitud,
    longitud: u.longitud,
    esCampusUniamazonia: false,
    esGuardado: true
  }));
  return [...sedes, ...guardados];
}

function buscarLugarPorId(id) {
  return obtenerCatalogoLugares().find((item) => item.id === id) || null;
}

async function cargarConfigMapa() {
  if (state.mapConfigPromise) {
    return state.mapConfigPromise;
  }
  state.mapConfigPromise = (async () => {
    try {
      const res = await fetch("/api/mapa/config");
      if (!res.ok) return;
      const cfg = await res.json();

      if (cfg.proveedorActivo === "mapbox" && cfg.mapboxAccessToken) {
        const mbOk = await cargarScriptMapbox();
        if (mbOk) {
          state.mapEngine = "mapbox";
          state.mapboxLoaded = true;
          state.mapConfig = cfg;
          return;
        }
      }

      state.mapEngine = "google";
      if (cfg.googleMapsApiKey) {
        const ok = await cargarScriptGoogleMaps(cfg.googleMapsApiKey);
        state.gmapsLoaded = ok;
      } else {
        state.gmapsLoaded = false;
        console.warn("GOOGLE_MAPS_API_KEY no configurada en el servidor.");
      }
      // Asignar mapConfig después de cargar Google Maps para evitar condiciones de carrera con SSE/renderAll
      state.mapConfig = cfg;
    } catch {
      state.gmapsLoaded = false;
      state.mapboxLoaded = false;
    }
  })();
  return state.mapConfigPromise;
}

function cargarScriptMapbox() {
  if (window.mapboxgl && window.mapboxgl.Map) {
    state.mapboxLoaded = true;
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    if (!document.getElementById("mapbox-gl-css")) {
      const link = document.createElement("link");
      link.id = "mapbox-gl-css";
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.css";
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = "https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.js";
    script.async = true;
    script.onload = () => {
      const ok = Boolean(window.mapboxgl && window.mapboxgl.Map);
      state.mapboxLoaded = ok;
      resolve(ok);
    };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
    setTimeout(() => resolve(Boolean(window.mapboxgl && window.mapboxgl.Map)), 12000);
  });
}

function cargarScriptGoogleMaps(apiKey) {
  if (window.google && window.google.maps && window.google.maps.Map) {
    state.gmapsLoaded = true;
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      state.gmapsLoaded = ok;
      resolve(ok);
    };

    window.gm_authFailure = () => {
      console.error("Google Maps API rechazó la llave o el dominio actual.");
      finish(false);
    };

    const callbackName = "__tucangoGmapsInit";
    window[callbackName] = () => {
      finish(Boolean(window.google && window.google.maps && window.google.maps.Map));
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&libraries=marker,places,geometry&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => finish(false);
    document.head.appendChild(script);

    setTimeout(() => finish(Boolean(window.google && window.google.maps && window.google.maps.Map)), 15000);
  });
}

function estaDentroDeFlorencia(lat, lng) {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    lat >= FLORENCIA_BOUNDS_COORDS[0][0] &&
    lat <= FLORENCIA_BOUNDS_COORDS[1][0] &&
    lng >= FLORENCIA_BOUNDS_COORDS[0][1] &&
    lng <= FLORENCIA_BOUNDS_COORDS[1][1]
  );
}

function calcularDistanciaMetrosOficial(lat1, lng1, lat2, lng2) {
  if (
    state.mapEngine === "google" &&
    window.google?.maps?.geometry?.spherical?.computeDistanceBetween
  ) {
    return window.google.maps.geometry.spherical.computeDistanceBetween(
      new window.google.maps.LatLng(lat1, lng1),
      new window.google.maps.LatLng(lat2, lng2)
    );
  }
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function construirContenidoInfoSede(sec) {
  let distanciaTexto = "";
  if (state.realGps && typeof state.realGps.latitud === "number") {
    const mts = Math.round(
      calcularDistanciaMetrosOficial(
        state.realGps.latitud,
        state.realGps.longitud,
        sec.latitud,
        sec.longitud
      )
    );
    const labelDist = mts >= 1000 ? `${(mts / 1000).toFixed(2)} km` : `${mts} m`;
    distanciaTexto = `<br/><span style="color:#0F6B36;font-size:11px;font-weight:700;">A ${labelDist} de tu ubicación</span>`;
  }
  return `
    <div style="font-family:sans-serif;padding:2px 4px;max-width:230px;">
      <strong style="color:#0F6B36;font-size:13px;">${esc(sec.nombre)}</strong><br/>
      <span style="color:#4B5563;font-size:11px;">${esc(sec.referencia || "Universidad de la Amazonia")}</span>
      ${distanciaTexto}
    </div>`;
}

function crearControlesNativosGoogle(gmap) {
  // 1. Toggle oficial de Capa de Tráfico (TOP_RIGHT)
  const trafficBtn = document.createElement("button");
  trafficBtn.type = "button";
  trafficBtn.className = "gm-tucan-control";
  trafficBtn.innerHTML = `<span>🚦</span><span>Tráfico en vivo</span>`;
  trafficBtn.title = "Mostrar u ocultar tráfico vial en Florencia";
  trafficBtn.addEventListener("click", () => {
    if (!state.trafficLayer) {
      state.trafficLayer = new window.google.maps.TrafficLayer();
    }
    state.trafficEnabled = !state.trafficEnabled;
    state.trafficLayer.setMap(state.trafficEnabled ? gmap : null);
    trafficBtn.classList.toggle("active", state.trafficEnabled);
  });
  gmap.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(trafficBtn);

  // 2. Botón oficial "Mi Ubicación / Centrar" sobre el zoom en RIGHT_BOTTOM (sin solaparse)
  const gpsBtn = document.createElement("button");
  gpsBtn.type = "button";
  gpsBtn.className = "gm-tucan-gps-btn";
  gpsBtn.title = "Detectar mi ubicación y centrar mapa";
  gpsBtn.setAttribute("aria-label", "Centrar en mi ubicación GPS");
  gpsBtn.innerHTML = tgIcon("tg-radar", "tg-icon-md");
  gpsBtn.addEventListener("click", () => {
    iniciarGeolocalizacionTiempoReal(true);
    if (!state.realGps) {
      pintarRutaEnMapa(true);
    }
  });
  gmap.controls[window.google.maps.ControlPosition.RIGHT_BOTTOM].push(gpsBtn);
}

function initMap(sectores) {
  if (state.map) return;
  const sedesMapa = obtenerSedesActivas(sectores);

  if (
    state.mapEngine === "mapbox" &&
    window.mapboxgl &&
    state.mapConfig?.mapboxAccessToken
  ) {
    const container = document.getElementById("campus-map");
    if (!container) return;

    window.mapboxgl.accessToken = state.mapConfig.mapboxAccessToken;
    const mbMap = new window.mapboxgl.Map({
      container,
      style: state.mapConfig.mapboxStyleUrl || "mapbox://styles/mapbox/streets-v12",
      center: [FLORENCIA_CENTRO[1], FLORENCIA_CENTRO[0]],
      zoom: 15.2,
      pitch: 46,
      bearing: -10,
      minZoom: 12,
      maxZoom: 19.5,
      antialias: true,
      maxBounds: [
        [-75.7000, 1.5000],
        [-75.5200, 1.6800]
      ]
    });

    mbMap.addControl(new window.mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    mbMap.addControl(
      new window.mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
      }),
      "bottom-right"
    );

    mbMap.invalidateSize = () => mbMap.resize();
    mbMap.setView = ([lat, lng], zoom) => {
      mbMap.easeTo({
        center: [Number(lng), Number(lat)],
        zoom: zoom || mbMap.getZoom(),
        pitch: 46,
        duration: 700
      });
    };
    mbMap.fitBoundsCompat = (coordsList, maxZoom = 16.5) => {
      if (!coordsList || coordsList.length === 0) return;
      const bounds = new window.mapboxgl.LngLatBounds();
      for (const c of coordsList) {
        const lat = Array.isArray(c) ? c[0] : c.latitud;
        const lng = Array.isArray(c) ? c[1] : c.longitud;
        if (typeof lat === "number" && typeof lng === "number") {
          bounds.extend([lng, lat]);
        }
      }
      mbMap.fitBounds(bounds, { padding: 72, maxZoom, pitch: 46, duration: 750 });
    };

    mbMap.on("click", (e) => {
      if (!state.pickingMapPlace) return;
      completarPuntoSeleccionadoEnMapa(e.lngLat.lat, e.lngLat.lng);
    });

    for (const sec of sedesMapa) {
      const pinEl = document.createElement("div");
      pinEl.className = "tucan-campus-pin-mb";
      pinEl.title = sec.nombre;
      pinEl.textContent = "🎓";
      pinEl.addEventListener("click", (ev) => {
        ev.stopPropagation();
        seleccionarSectorEnMapa(sec.id);
      });
      const mk = new window.mapboxgl.Marker({ element: pinEl })
        .setLngLat([sec.longitud, sec.latitud])
        .setPopup(
          new window.mapboxgl.Popup({ offset: 22 }).setHTML(
            `<div style="font-family:sans-serif;padding:2px 4px;"><strong>${esc(sec.nombre)}</strong><br/><span style="font-size:11px;color:#4B5563;">${esc(sec.barrio || "Campus Uniamazonia")}</span></div>`
          )
        )
        .addTo(mbMap);
      state.markers.set(sec.id, mk);
    }

    state.map = mbMap;
    if (els.mapEnginePill) els.mapEnginePill.textContent = "MAPBOX 3D";
    mbMap.on("load", () => {
      pintarRutaEnMapa(true);
      if (state.data) renderSeguimientoEnVivo(state.data);
    });
    return;
  }

  if (state.mapEngine === "google" && window.google && window.google.maps) {
    const container = document.getElementById("campus-map");
    if (!container) return;

    const mapOptions = {
      center: { lat: FLORENCIA_CENTRO[0], lng: FLORENCIA_CENTRO[1] },
      zoom: 15,
      minZoom: 12,
      maxZoom: 20,
      restriction: {
        latLngBounds: {
          south: 1.5000,
          west: -75.7000,
          north: 1.6800,
          east: -75.5200
        },
        strictBounds: false
      },
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        position: window.google.maps.ControlPosition.TOP_LEFT
      },
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM
      },
      clickableIcons: true,
      gestureHandling: "greedy"
    };
    if (state.mapConfig?.googleMapsMapId) {
      mapOptions.mapId = state.mapConfig.googleMapsMapId;
    }

    const gmap = new window.google.maps.Map(container, mapOptions);
    const infoWindow = new window.google.maps.InfoWindow();
    state.infoWindow = infoWindow;
    state.geocoder = new window.google.maps.Geocoder();

    gmap.invalidateSize = () => {
      if (window.google?.maps?.event) {
        window.google.maps.event.trigger(gmap, "resize");
      }
    };
    gmap.setView = ([lat, lng], zoom) => {
      gmap.panTo({ lat: Number(lat), lng: Number(lng) });
      if (zoom) gmap.setZoom(zoom);
    };
    gmap.fitBoundsCompat = (coordsList, maxZoom = 16) => {
      if (!coordsList || coordsList.length === 0) return;
      const gBounds = new window.google.maps.LatLngBounds();
      for (const c of coordsList) {
        const lat = Array.isArray(c) ? c[0] : c.latitud;
        const lng = Array.isArray(c) ? c[1] : c.longitud;
        if (typeof lat === "number" && typeof lng === "number") {
          gBounds.extend({ lat, lng });
        }
      }
      gmap.fitBounds(gBounds, 68);
      window.google.maps.event.addListenerOnce(gmap, "idle", () => {
        if (gmap.getZoom() > maxZoom) gmap.setZoom(maxZoom);
      });
    };

    crearControlesNativosGoogle(gmap);

    // Soporte para seleccionar punto en el mapa al guardar Casa / Lugar frecuente
    gmap.addListener("click", (ev) => {
      if (!state.pickingMapPlace || !ev?.latLng) return;
      const lat = Number(ev.latLng.lat().toFixed(6));
      const lng = Number(ev.latLng.lng().toFixed(6));
      completarPuntoSeleccionadoEnMapa(lat, lng);
    });

    const AdvancedMarker = window.google.maps.marker?.AdvancedMarkerElement;
    const PinElement = window.google.maps.marker?.PinElement;

    for (const sec of sedesMapa) {
      const pos = { lat: sec.latitud, lng: sec.longitud };
      if (AdvancedMarker && PinElement && mapOptions.mapId) {
        const pin = new PinElement({
          background: sec.id === "PORVENIR" ? "#0F6B36" : "#1D4ED8",
          borderColor: "#FFFFFF",
          glyphColor: "#FFFFFF",
          scale: 1.15
        });
        const advMarker = new AdvancedMarker({
          map: gmap,
          position: pos,
          title: sec.nombre,
          content: pin.element
        });
        advMarker.addListener("click", () => {
          infoWindow.setContent(construirContenidoInfoSede(sec));
          infoWindow.open({ anchor: advMarker, map: gmap });
          seleccionarSectorEnMapa(sec.id);
        });
        state.markers.set(sec.id, advMarker);
      } else {
        const stdMarker = new window.google.maps.Marker({
          map: gmap,
          position: pos,
          title: sec.nombre,
          label: {
            text: sec.id === "PORVENIR" ? "P" : "C",
            color: "#FFFFFF",
            fontWeight: "700"
          }
        });
        stdMarker.addListener("click", () => {
          infoWindow.setContent(construirContenidoInfoSede(sec));
          infoWindow.open({ anchor: stdMarker, map: gmap });
          seleccionarSectorEnMapa(sec.id);
        });
        state.markers.set(sec.id, stdMarker);
      }
    }

    state.map = gmap;
    if (sedesMapa.length > 0) {
      gmap.fitBoundsCompat(sedesMapa.map((s) => [s.latitud, s.longitud]), 15);
    }
    iniciarGeolocalizacionTiempoReal();
    return;
  }

  // Google Maps es el motor único y obligatorio (sin fallback a OpenStreetMap)
  const container = document.getElementById("campus-map");
  if (container && !container.dataset.gmapsNoticeShown) {
    container.dataset.gmapsNoticeShown = "true";
    container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;padding:24px;text-align:center;color:#374151;font-family:sans-serif;background:#F3F4F6;"><div><strong>Google Maps no pudo inicializarse</strong><br/><span style="font-size:13px;color:#6B7280;">Verifica GOOGLE_MAPS_API_KEY y los dominios autorizados en Google Cloud.</span></div></div>`;
  }
}

async function reverseGeocodeSiAplica(lat, lng) {
  // Solo invocar Geocoder si está explícitamente habilitado para evitar errores en consola si la API no está activa en GCP
  if (!state.mapConfig?.geocodingEnabled || !state.geocoder) return null;
  if (state.lastGeocodePos) {
    const movM = calcularDistanciaMetrosOficial(
      state.lastGeocodePos.lat,
      state.lastGeocodePos.lng,
      lat,
      lng
    );
    if (movM < 80 && state.realAddressLabel) return state.realAddressLabel;
  }
  try {
    const resp = await state.geocoder.geocode({ location: { lat, lng } });
    const first = resp?.results?.[0];
    if (first?.formatted_address) {
      const shortAddr = first.formatted_address.split(",").slice(0, 2).join(", ");
      state.lastGeocodePos = { lat, lng };
      state.realAddressLabel = shortAddr;
      return shortAddr;
    }
  } catch {
    // Geocoding API puede no estar habilitada en la key; se usa texto limpio
  }
  return null;
}

function iniciarGeolocalizacionTiempoReal(forzarCentrado = false) {
  if (typeof navigator === "undefined" || !navigator.geolocation) return;

  const onPos = async (pos) => {
    const lat = Number(pos.coords.latitude);
    const lng = Number(pos.coords.longitude);
    const acc = Math.round(Number(pos.coords.accuracy || 20));
    const ahora = Date.now();

    let velocidadKmh = Number.isFinite(pos.coords.speed) && pos.coords.speed >= 0
      ? Math.round(pos.coords.speed * 3.6)
      : 0;
    let heading = Number.isFinite(pos.coords.heading) ? Number(pos.coords.heading) : undefined;

    if (state.prevGps && ahora > state.prevGps.ts) {
      const distM = calcularDistanciaMetrosOficial(
        state.prevGps.latitud,
        state.prevGps.longitud,
        lat,
        lng
      );
      const dtSeg = (ahora - state.prevGps.ts) / 1000;
      if (dtSeg > 0.8 && distM >= 4 && velocidadKmh === 0) {
        velocidadKmh = Math.round((distM / dtSeg) * 3.6);
      }
      if (
        heading === undefined &&
        distM >= 4 &&
        window.google?.maps?.geometry?.spherical?.computeHeading
      ) {
        heading = Math.round(
          window.google.maps.geometry.spherical.computeHeading(
            new window.google.maps.LatLng(state.prevGps.latitud, state.prevGps.longitud),
            new window.google.maps.LatLng(lat, lng)
          )
        );
      }
    }

    state.prevGps = { latitud: lat, longitud: lng, ts: ahora };
    state.realGps = { latitud: lat, longitud: lng, accuracy: acc, heading, velocidadKmh, ts: ahora };
    const enFlorencia = estaDentroDeFlorencia(lat, lng);

    if (enFlorencia) {
      await reverseGeocodeSiAplica(lat, lng);
    }

    // Distancia al campus más cercano usando google.maps.geometry.spherical
    const sedes = obtenerSedesActivas(state.data?.sectores || []);
    let sedeCercanaTxt = "";
    if (sedes.length > 0) {
      let minM = Infinity;
      let nombreCercana = "";
      for (const s of sedes) {
        const m = calcularDistanciaMetrosOficial(lat, lng, s.latitud, s.longitud);
        if (m < minM) {
          minM = m;
          nombreCercana = s.id === "PORVENIR" ? "Porvenir" : "Centro IDEMA";
        }
      }
      if (Number.isFinite(minM)) {
        const dTxt = minM >= 1000 ? `${(minM / 1000).toFixed(1)} km` : `${Math.round(minM)} m`;
        sedeCercanaTxt = ` · A ${dTxt} de ${nombreCercana}`;
      }
    }

    if (els.coordsReadout) {
      const estadoMov = velocidadKmh >= 3 ? `En movimiento (${velocidadKmh} km/h)` : `GPS activo (±${acc}m)`;
      const dirTxt = state.realAddressLabel ? ` · ${state.realAddressLabel}` : "";
      els.coordsReadout.textContent = enFlorencia
        ? `📡 ${estadoMov}${dirTxt}${sedeCercanaTxt}`
        : `📡 ${estadoMov} · Fuera de cobertura Florencia`;
    }

    if (state.data) {
      renderMarcadoresEnVivo(state.data);
    }

    if (
      enFlorencia &&
      state.role === "motorista" &&
      Date.now() - state.lastGpsPostTs > 4000
    ) {
      state.lastGpsPostTs = Date.now();
      if (els.driverCoordsChip) {
        els.driverCoordsChip.textContent = `GPS ${lat.toFixed(4)}, ${lng.toFixed(4)} · ${velocidadKmh} km/h`;
      }
      postJson("/api/motoristas/ubicacion", {
        motoristaId: els.selectMotorista?.value,
        latitud: lat,
        longitud: lng,
        direccionGrados: heading
      }).catch(() => {});
    }

    if (forzarCentrado && state.map) {
      if (enFlorencia) {
        state.map.setView([lat, lng], 16);
        showToast(`Ubicación GPS detectada (±${acc}m)`, "success");
      } else {
        showToast("Tu ubicación actual está fuera de Florencia; mostrando sedes Uniamazonia", "info");
        pintarRutaEnMapa(true);
      }
    }
  };

  const onErr = () => {
    if (forzarCentrado) {
      showToast("Activa el permiso de ubicación en tu navegador para detección en tiempo real", "info");
    }
  };

  navigator.geolocation.getCurrentPosition(onPos, onErr, {
    enableHighAccuracy: true,
    timeout: 6000,
    maximumAge: 5000
  });

  if (state.gpsWatchId === null) {
    state.gpsWatchId = navigator.geolocation.watchPosition(onPos, () => {}, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 3000
    });
  }
}

function renderMarcadoresEnVivo(data) {
  if (!state.map || !window.google?.maps) return;

  // Marcadores de lugares guardados (Estudiante) o puntos recurrentes estudiantiles (Admin)
  for (const mk of state.savedPlaceMarkers.values()) {
    if (typeof mk.setMap === "function") mk.setMap(null);
    else if (typeof mk.remove === "function") mk.remove();
  }
  state.savedPlaceMarkers.clear();

  for (const c of state.adminHeatmapCircles || []) {
    if (typeof c.setMap === "function") c.setMap(null);
    else if (typeof c.remove === "function") c.remove();
  }
  state.adminHeatmapCircles = [];

  if (state.authUser?.rol === "admin" && state.adminShowMap) {
    const puntos = data?.analiticaAdmin?.puntosRecurrentesMapa || [];
    const AdvancedMarker = window.google?.maps?.marker?.AdvancedMarkerElement;
    const PinElement = window.google?.maps?.marker?.PinElement;

    for (const p of puntos) {
      const intensidad = Number(p.registros || 0) + Number(p.viajes || 0);
      const esHotspot = intensidad >= 2;
      const colorPin = esHotspot ? "#C8232C" : "#D97706";
      const titulo = `${p.etiqueta} · ${p.barrio}`;
      const infoHtml = `<div style="font-family:sans-serif;padding:3px 5px;max-width:220px;">
        <strong>📍 ${esc(p.etiqueta)}</strong><br/>
        <span style="font-size:12px;color:#374151;">Barrio / Sector: <strong>${esc(p.barrio)}</strong></span><br/>
        <span style="font-size:11px;color:#0F6B36;font-weight:600;">${p.registros} registro(s) · ${p.viajes} viaje(s)</span><br/>
        <span style="font-size:10px;color:#6B7280;">Dato agregado (Ley 1581 de 2012)</span>
      </div>`;

      const pos = { lat: p.latitud, lng: p.longitud };
      let marker;
      if (AdvancedMarker && PinElement && state.mapConfig?.googleMapsMapId) {
        const pin = new PinElement({
          background: colorPin,
          borderColor: "#FFFFFF",
          glyphColor: "#FFFFFF",
          scale: esHotspot ? 1.05 : 0.92
        });
        marker = new AdvancedMarker({
          map: state.map,
          position: pos,
          title: titulo,
          content: pin.element
        });
      } else {
        marker = new window.google.maps.Marker({
          map: state.map,
          position: pos,
          title: titulo
        });
      }
      marker.addListener("click", () => {
        state.infoWindow?.setContent(infoHtml);
        state.infoWindow?.open({ anchor: marker, map: state.map });
      });
      state.savedPlaceMarkers.set(p.id, marker);

      const circle = new window.google.maps.Circle({
        map: state.map,
        center: pos,
        radius: Math.min(260, 80 + intensidad * 30),
        strokeColor: colorPin,
        strokeOpacity: 0.55,
        strokeWeight: 1.5,
        fillColor: colorPin,
        fillOpacity: 0.16,
        clickable: false
      });
      state.adminHeatmapCircles.push(circle);
    }

    const totalRegistros = puntos.reduce((acc, item) => acc + Number(item.registros || 0), 0);
    if (els.overlayDist) {
      els.overlayDist.textContent = `${puntos.length} ${puntos.length === 1 ? "punto recurrente" : "puntos recurrentes"}`;
    }
    if (els.overlayEta) {
      els.overlayEta.textContent = `${totalRegistros} ubicaciones guardadas`;
    }
    if (els.overlayTrafficBadge) {
      els.overlayTrafficBadge.textContent = "Ley 1581 · Anonimizado";
      els.overlayTrafficBadge.classList.remove("heavy");
    }
    if (els.overlayCorridor) {
      els.overlayCorridor.textContent =
        "Mapa General Uniamazonia · Destinos y barrios frecuentes de estudiantes";
    }
    if (els.coordsReadout) {
      els.coordsReadout.textContent =
        puntos.length > 0
          ? "Toca cada marcador para consultar el barrio y frecuencia de viajes estudiantiles."
          : "Aún no hay ubicaciones recurrentes registradas por estudiantes; mostrando sedes campus.";
    }
  } else if (state.role === "pasajero") {
    const AdvancedMarker = window.google?.maps?.marker?.AdvancedMarkerElement;
    const PinElement = window.google?.maps?.marker?.PinElement;
    for (const u of state.ubicacionesGuardadas || []) {
      const pos = { lat: u.latitud, lng: u.longitud };
      let marker;
      if (AdvancedMarker && PinElement && state.mapConfig?.googleMapsMapId) {
        const pin = new PinElement({
          background: "#D97706",
          borderColor: "#FFFFFF",
          glyphColor: "#FFFFFF",
          scale: 0.95
        });
        marker = new AdvancedMarker({
          map: state.map,
          position: pos,
          title: `${u.etiqueta}: ${u.nombre}`,
          content: pin.element
        });
      } else {
        marker = new window.google.maps.Marker({
          map: state.map,
          position: pos,
          title: `${u.etiqueta}: ${u.nombre}`
        });
      }
      marker.addListener("click", () => {
        state.infoWindow?.setContent(
          `<div style="font-family:sans-serif;padding:2px 4px;"><strong>${esc(u.etiqueta)}: ${esc(u.nombre)}</strong><br/><span style="font-size:11px;color:#4B5563;">${esc(u.barrio)}</span></div>`
        );
        state.infoWindow?.open({ anchor: marker, map: state.map });
        seleccionarSectorEnMapa(u.id);
      });
      state.savedPlaceMarkers.set(u.id, marker);
    }
  }

  // Marcador nativo azul de GPS real del usuario (sin marcadores de motoristas cercanos por ahora)
  if (state.realGps && typeof state.realGps.latitud === "number" && typeof state.realGps.longitud === "number") {
    const gpsLat = state.realGps.latitud;
    const gpsLng = state.realGps.longitud;
    const pos = { lat: gpsLat, lng: gpsLng };
    if (!state.userGpsMarker) {
      state.userGpsMarker = new window.google.maps.Marker({
        map: state.map,
        position: pos,
        title: "Tu ubicación GPS en tiempo real",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#2563EB",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2.5
        },
        zIndex: 700
      });
    } else if (typeof state.userGpsMarker.setPosition === "function") {
      state.userGpsMarker.setPosition(pos);
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
  if (!state.map) return;

  if (state.mapEngine === "mapbox" && window.mapboxgl) {
    if (!puntos || puntos.length < 2) return;
    const latLngs = puntos.map((p) => (Array.isArray(p) ? p : [p.latitud, p.longitud]));
    const coordinates = latLngs.map(([lat, lng]) => [Number(lng), Number(lat)]);
    const geojson = {
      type: "Feature",
      geometry: { type: "LineString", coordinates }
    };
    const aplicarCapaMapbox = () => {
      if (state.map.getSource("tucango-route-src")) {
        state.map.getSource("tucango-route-src").setData(geojson);
      } else {
        state.map.addSource("tucango-route-src", { type: "geojson", data: geojson });
        state.map.addLayer({
          id: "tucango-route-casing",
          type: "line",
          source: "tucango-route-src",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#FFFFFF", "line-width": 8, "line-opacity": 0.9 }
        });
        state.map.addLayer({
          id: "tucango-route-line",
          type: "line",
          source: "tucango-route-src",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#111827", "line-width": 4.5, "line-opacity": 0.96 }
        });
      }
      if (ajustarEncuadre && typeof state.map.fitBoundsCompat === "function") {
        state.map.fitBoundsCompat(latLngs, 16);
      }
    };
    if (state.map.isStyleLoaded()) aplicarCapaMapbox();
    else state.map.once("load", aplicarCapaMapbox);
    return;
  }

  if (!window.google?.maps) return;

  if (state.routeLine) {
    if (typeof state.routeLine.setMap === "function") state.routeLine.setMap(null);
    state.routeLine = null;
  }
  if (state.routeLineCasing) {
    if (typeof state.routeLineCasing.setMap === "function") state.routeLineCasing.setMap(null);
    state.routeLineCasing = null;
  }
  if (!puntos || puntos.length === 0) return;

  const latLngs = puntos.map((p) => (Array.isArray(p) ? p : [p.latitud, p.longitud]));
  const path = latLngs.map(([lat, lng]) => ({ lat: Number(lat), lng: Number(lng) }));
  state.routeLineCasing = new window.google.maps.Polyline({
    path,
    geodesic: true,
    strokeColor: "#06371B",
    strokeOpacity: 0.35,
    strokeWeight: 9,
    map: state.map,
    zIndex: 40
  });
  state.routeLine = new window.google.maps.Polyline({
    path,
    geodesic: true,
    strokeColor: "#0F6B36",
    strokeOpacity: 0.96,
    strokeWeight: 5,
    map: state.map,
    zIndex: 45
  });
  if (ajustarEncuadre && latLngs.length >= 2 && typeof state.map.fitBoundsCompat === "function") {
    state.map.fitBoundsCompat(latLngs, 15);
  }
}

function pintarRutaEnMapa(ajustarEncuadre = true) {
  if (!state.data || !state.map) return;

  if (state.authUser?.rol === "admin" && state.adminShowMap) {
    if (state.routeLine) {
      if (typeof state.routeLine.setMap === "function") state.routeLine.setMap(null);
      else if (typeof state.routeLine.remove === "function") state.routeLine.remove();
      state.routeLine = null;
    }
    if (state.routeLineCasing) {
      if (typeof state.routeLineCasing.setMap === "function") state.routeLineCasing.setMap(null);
      state.routeLineCasing = null;
    }
    renderMarcadoresEnVivo(state.data);
    if (ajustarEncuadre) {
      const sedes = obtenerSedesActivas(state.data.sectores || []);
      const puntos = state.data?.analiticaAdmin?.puntosRecurrentesMapa || [];
      const objetivos = [...sedes, ...puntos];
      if (objetivos.length > 0 && typeof state.map.fitBoundsCompat === "function") {
        state.map.fitBoundsCompat(objetivos, 15);
      } else if (typeof state.map.fitBoundsCompat === "function") {
        state.map.fitBoundsCompat(FLORENCIA_BOUNDS_COORDS, 15);
      }
    }
    return;
  }

  const origen = buscarLugarPorId(els.selectOrigen.value);
  const destino = buscarLugarPorId(els.selectDestino.value);

  if (origen && destino) {
    const puntos =
      state.lastPolilinea.length >= 2
        ? state.lastPolilinea
        : [
            [origen.latitud, origen.longitud],
            [destino.latitud, destino.longitud]
          ];
    dibujarPolilineaEnMapa(puntos, ajustarEncuadre);
  } else if (ajustarEncuadre && typeof state.map.fitBoundsCompat === "function") {
    state.map.fitBoundsCompat(FLORENCIA_BOUNDS_COORDS, 15);
  }
  renderMarcadoresEnVivo(state.data);
}

async function recotizarTarifasPorDistanciaReal(distanciaKm) {
  try {
    const res = await fetch(`/api/cotizar?distanciaKm=${encodeURIComponent(distanciaKm)}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data?.tarifas) {
      state.tarifas = data.tarifas;
      actualizarPreviewTarifa();
    }
  } catch {
    // Mantiene tarifas actuales si hay corte temporal
  }
}

function aplicarMetricasRutaOficial({ distanciaKm, duracionMin, traficoTexto, pesado, polilinea }) {
  state.routeKm = distanciaKm;
  state.routeMin = duracionMin;
  state.lastPolilinea = polilinea;

  els.overlayDist.textContent = `${state.routeKm.toFixed(2)} km`;
  els.overlayEta.textContent = `${state.routeMin} min en moto`;
  if (els.overlayTrafficBadge) {
    els.overlayTrafficBadge.textContent = traficoTexto;
    els.overlayTrafficBadge.classList.toggle("heavy", Boolean(pesado));
  }
  if (els.previewRutaKm) {
    els.previewRutaKm.textContent = `${state.routeKm.toFixed(2)} km · ${state.routeMin} min`;
  }
  pintarRutaEnMapa(true);
  recotizarTarifasPorDistanciaReal(state.routeKm);
}

async function intentarGoogleRoutesApi(origen, destino, key) {
  const apiKey = state.mapConfig?.googleMapsApiKey;
  if (!apiKey || !window.google?.maps?.geometry?.encoding?.decodePath) return false;

  if (googleRoutesCache.has(key)) {
    const cached = googleRoutesCache.get(key);
    if (state.lastRouteKey === key) {
      aplicarMetricasRutaOficial(cached);
    }
    return true;
  }

  for (const travelMode of ["TWO_WHEELER", "DRIVE"]) {
    try {
      const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "routes.duration,routes.staticDuration,routes.distanceMeters,routes.polyline.encodedPolyline"
        },
        body: JSON.stringify({
          origin: { location: { latLng: { latitude: origen.latitud, longitude: origen.longitud } } },
          destination: { location: { latLng: { latitude: destino.latitud, longitude: destino.longitud } } },
          travelMode,
          routingPreference: "TRAFFIC_AWARE",
          polylineQuality: "HIGH_QUALITY"
        })
      });
      if (!res.ok) continue;
      const json = await res.json();
      const route = json?.routes?.[0];
      const encoded = route?.polyline?.encodedPolyline;
      if (!encoded) continue;

      const decoded = window.google.maps.geometry.encoding.decodePath(encoded);
      if (!Array.isArray(decoded) || decoded.length < 2) continue;

      const polilinea = decoded.map((pt) => ({ latitud: pt.lat(), longitud: pt.lng() }));
      const lengthMeters =
        route.distanceMeters ||
        window.google.maps.geometry.spherical?.computeLength?.(decoded) ||
        1000;
      const distanciaKm = Number(Math.max(0.5, Number(lengthMeters) / 1000).toFixed(2));
      const durSeg = route.duration ? parseInt(String(route.duration).replace("s", ""), 10) : 180;
      const staticSeg = route.staticDuration
        ? parseInt(String(route.staticDuration).replace("s", ""), 10)
        : durSeg;
      const duracionMin = Math.max(1, Math.round(durSeg / 60));
      const demoraMin = Math.max(0, Math.round((durSeg - staticSeg) / 60));

      const payload = {
        distanciaKm,
        duracionMin,
        traficoTexto:
          demoraMin >= 2
            ? `+${demoraMin} min tráfico (${travelMode === "TWO_WHEELER" ? "Moto" : "Vial"})`
            : travelMode === "TWO_WHEELER"
              ? "Ruta Moto · Fluido"
              : "Ruta Vial · Fluido",
        pesado: demoraMin >= 2,
        polilinea
      };
      googleRoutesCache.set(key, payload);
      if (state.lastRouteKey === key) {
        aplicarMetricasRutaOficial(payload);
      }
      return true;
    } catch {
      // Intenta siguiente modo o cae a OSRM
    }
  }
  return false;
}

async function intentarMapboxDirectionsApi(origen, destino, key) {
  const token = state.mapConfig?.mapboxAccessToken;
  if (!token) return false;
  if (googleRoutesCache.has(key)) {
    const cached = googleRoutesCache.get(key);
    if (state.lastRouteKey === key) aplicarMetricasRutaOficial(cached);
    return true;
  }
  try {
    const coords = `${origen.longitud},${origen.latitud};${destino.longitud},${destino.latitud}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    if (!res.ok) return false;
    const json = await res.json();
    const route = json?.routes?.[0];
    const lineCoords = route?.geometry?.coordinates;
    if (!Array.isArray(lineCoords) || lineCoords.length < 2) return false;

    const polilinea = lineCoords.map(([lng, lat]) => ({ latitud: lat, longitud: lng }));
    const distanciaKm = Number(Math.max(0.5, Number(route.distance || 1000) / 1000).toFixed(2));
    const duracionMin = Math.max(1, Math.round(Number(route.duration || 180) / 60));
    const payload = {
      distanciaKm,
      duracionMin,
      traficoTexto: "Mapbox 3D · Ruta vial",
      pesado: false,
      polilinea
    };
    googleRoutesCache.set(key, payload);
    if (state.lastRouteKey === key) aplicarMetricasRutaOficial(payload);
    return true;
  } catch {
    return false;
  }
}

async function intentarRutaVial(origen, destino, key) {
  if (origen.id === destino.id) return;
  if (state.mapEngine === "mapbox" && state.mapConfig?.mapboxAccessToken) {
    const ok = await intentarMapboxDirectionsApi(origen, destino, key);
    if (ok) return;
  }
  await intentarGoogleRoutesApi(origen, destino, key);
}

async function actualizarRutaDesdeSectores() {
  const origen = buscarLugarPorId(els.selectOrigen.value);
  const destino = buscarLugarPorId(els.selectDestino.value);
  if (!origen || !destino) return;

  const qs =
    !origen.esGuardado && !destino.esGuardado
      ? `origenId=${encodeURIComponent(origen.id)}&destinoId=${encodeURIComponent(destino.id)}`
      : `origenId=${encodeURIComponent(origen.id)}&origenNombre=${encodeURIComponent(origen.nombre)}&origenLat=${encodeURIComponent(origen.latitud)}&origenLng=${encodeURIComponent(origen.longitud)}&destinoId=${encodeURIComponent(destino.id)}&destinoNombre=${encodeURIComponent(destino.nombre)}&destinoLat=${encodeURIComponent(destino.latitud)}&destinoLng=${encodeURIComponent(destino.longitud)}`;

  try {
    const res = await fetch(`/api/ruta?${qs}`);
    if (res.ok) {
      const ruta = await res.json();
      state.routeKm = Math.max(0.5, Number(ruta.distanciaKm || 0.5));
      state.routeMin = Number(ruta.tiempoEstimadoMin || 3);
      if (ruta.tarifas) state.tarifas = ruta.tarifas;
      if (Array.isArray(ruta.polilinea)) state.lastPolilinea = ruta.polilinea;

      const key = `${origen.id}->${destino.id}`;
      state.lastRouteKey = key;

      els.overlayDist.textContent = `${state.routeKm.toFixed(2)} km`;
      els.overlayEta.textContent = `${state.routeMin} min en moto`;
      els.overlayCorridor.textContent = `${ruta.origen.nombre} → ${ruta.destino.nombre}`;
      els.previewRutaKm.textContent = `${state.routeKm.toFixed(2)} km · ${state.routeMin} min`;
      actualizarPreviewTarifa();
      pintarRutaEnMapa(true);
      intentarRutaVial(ruta.origen, ruta.destino, key);
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

// --- UBICACIONES RECURRENTES DEL ESTUDIANTE (CASA / FAVORITOS) ---
function renderUbicacionesGuardadas() {
  const prevOrig = els.selectOrigen.value || "PORVENIR";
  const prevDest = els.selectDestino.value || "CENTRO";

  const opciones = obtenerCatalogoLugares()
    .map((item) => `<option value="${esc(item.id)}">${esc(item.nombre)}</option>`)
    .join("");
  els.selectOrigen.innerHTML = opciones;
  els.selectDestino.innerHTML = opciones;

  if (buscarLugarPorId(prevOrig)) els.selectOrigen.value = prevOrig;
  else els.selectOrigen.value = "PORVENIR";

  if (buscarLugarPorId(prevDest)) els.selectDestino.value = prevDest;
  else els.selectDestino.value = "CENTRO";

  if (els.savedPlacesBar) {
    const baseBtns = [
      `<button type="button" class="shortcut-pill" data-quick-dest="PORVENIR">${tgIcon("tg-campus")} Sede Porvenir</button>`,
      `<button type="button" class="shortcut-pill" data-quick-dest="CENTRO">${tgIcon("iconly-home")} Sede Centro (IDEMA)</button>`
    ];
    const savedBtns = (state.ubicacionesGuardadas || []).map((u) => {
      const ico = u.etiqueta.toLowerCase() === "casa" ? "🏠" : u.etiqueta.toLowerCase() === "trabajo" ? "💼" : "⭐";
      return `<button type="button" class="shortcut-pill" data-quick-saved="${esc(u.id)}" title="Usar ${esc(u.nombre)} como destino (o clic con Shift para origen)">${ico} ${esc(u.etiqueta)}</button>`;
    });
    els.savedPlacesBar.innerHTML = [...baseBtns, ...savedBtns].join("");
  }

  if (els.perfilUbicacionesList) {
    const lista = state.ubicacionesGuardadas || [];
    if (lista.length === 0) {
      els.perfilUbicacionesList.innerHTML =
        `<p class="muted-sub">Aún no has guardado tu Casa o lugares frecuentes. Toca <strong>+ Agregar</strong> para seleccionarlo en el mapa.</p>`;
    } else {
      els.perfilUbicacionesList.innerHTML = lista
        .map(
          (u) => `
          <div class="saved-place-item">
            <div class="saved-place-meta">
              <strong>${esc(u.etiqueta)} · ${esc(u.nombre)}</strong>
              <span>Barrio ${esc(u.barrio)}${u.referencia ? ` · ${esc(u.referencia)}` : ""}</span>
            </div>
            <div class="saved-place-actions">
              <button type="button" class="btn-mini-pill" data-use-origin="${esc(u.id)}">Origen</button>
              <button type="button" class="btn-mini-pill" data-use-dest="${esc(u.id)}">Destino</button>
              <button type="button" class="btn-mini-pill danger" data-delete-lugar="${esc(u.id)}">Eliminar</button>
            </div>
          </div>`
        )
        .join("");
    }
  }
}

async function cargarUbicacionesEstudiante() {
  if (state.authUser?.rol !== "pasajero") return;
  try {
    const res = await fetch("/api/estudiante/ubicaciones", { credentials: "same-origin" });
    if (!res.ok) return;
    const data = await res.json();
    state.ubicacionesGuardadas = data.ubicaciones || [];
    renderUbicacionesGuardadas();
  } catch {
    // Silencioso
  }
}

function abrirModalLugar() {
  if (state.realGps && estaDentroDeFlorencia(state.realGps.latitud, state.realGps.longitud)) {
    els.lugarLat.value = String(state.realGps.latitud.toFixed(6));
    els.lugarLng.value = String(state.realGps.longitud.toFixed(6));
    if (state.realAddressLabel && !els.lugarReferencia.value) {
      els.lugarReferencia.value = state.realAddressLabel;
    }
  }
  els.modalLugarFrecuente?.classList.remove("hidden");

  // Conectar Places Autocomplete en Florencia si está disponible sin romper si falta permiso
  try {
    if (
      state.mapEngine === "google" &&
      window.google?.maps?.places?.Autocomplete &&
      els.lugarReferencia &&
      !els.lugarReferencia.dataset.acAttached
    ) {
      const ac = new window.google.maps.places.Autocomplete(els.lugarReferencia, {
        bounds: new window.google.maps.LatLngBounds(
          { lat: 1.52, lng: -75.68 },
          { lat: 1.66, lng: -75.54 }
        ),
        componentRestrictions: { country: "co" },
        fields: ["geometry", "name", "formatted_address", "address_components"]
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (place?.geometry?.location) {
          els.lugarLat.value = String(place.geometry.location.lat().toFixed(6));
          els.lugarLng.value = String(place.geometry.location.lng().toFixed(6));
          if (place.name && !els.lugarNombre.value) els.lugarNombre.value = place.name;
          const sublocality = (place.address_components || []).find(
            (c) => c.types.includes("sublocality") || c.types.includes("neighborhood")
          );
          if (sublocality && !els.lugarBarrio.value) els.lugarBarrio.value = sublocality.long_name;
        }
      });
      els.lugarReferencia.dataset.acAttached = "1";
    }
  } catch {
    // Fallback manual + mapa
  }
}

async function completarPuntoSeleccionadoEnMapa(lat, lng) {
  state.pickingMapPlace = false;
  if (els.lugarLat) els.lugarLat.value = String(lat);
  if (els.lugarLng) els.lugarLng.value = String(lng);

  if (state.mapConfig?.geocodingEnabled && state.geocoder) {
    try {
      const resp = await state.geocoder.geocode({ location: { lat, lng } });
      const first = resp?.results?.[0];
      if (first) {
        if (els.lugarReferencia && !els.lugarReferencia.value) {
          els.lugarReferencia.value = first.formatted_address.split(",").slice(0, 2).join(", ");
        }
        const barrioComp = (first.address_components || []).find(
          (c) => c.types.includes("neighborhood") || c.types.includes("sublocality")
        );
        if (barrioComp && els.lugarBarrio && !els.lugarBarrio.value) {
          els.lugarBarrio.value = barrioComp.long_name;
        }
      }
    } catch {
      // Continuar con coordenadas capturadas
    }
  }
  els.modalLugarFrecuente?.classList.remove("hidden");
  showToast("Punto capturado del mapa", "success");
}

function renderSelectores(data) {
  const prevEst = els.selectEstudiante.value;
  const prevMot = els.selectMotorista.value;

  els.selectEstudiante.innerHTML = (data.estudiantes || [])
    .map((e) => `<option value="${esc(e.identificacion)}">${esc(e.nombre)} · ${esc(e.carrera)}</option>`)
    .join("");
  if (state.authUser?.rol === "pasajero") {
    els.selectEstudiante.value = state.authUser.identificacion;
  } else if (prevEst && (data.estudiantes || []).some((e) => e.identificacion === prevEst)) {
    els.selectEstudiante.value = prevEst;
  }

  els.selectMotorista.innerHTML = (data.motoristas || [])
    .map((m) => {
      const placa = m.motoActiva ? m.motoActiva.placa : "SIN-MOTO";
      return `<option value="${esc(m.identificacion)}">${esc(m.nombre)} (${esc(placa)})</option>`;
    })
    .join("");
  if (state.authUser?.rol === "motorista") {
    els.selectMotorista.value = state.authUser.identificacion;
  } else if (prevMot && (data.motoristas || []).some((m) => m.identificacion === prevMot)) {
    els.selectMotorista.value = prevMot;
  }

  const estActual = (data.estudiantes || []).find(
    (e) => e.identificacion === (state.authUser?.identificacion || els.selectEstudiante.value)
  );
  if (estActual?.ubicacionesFrecuentes) {
    state.ubicacionesGuardadas = estActual.ubicacionesFrecuentes;
  }
  renderUbicacionesGuardadas();
  actualizarBannerSesion();
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

function renderMetricasPorRol(data) {
  const m = data.metricas || { rol: "anonimo" };
  // El rol lo declara el servidor; el DOM no lo adivina.
  const rol = m.rol || "anonimo";

  if (rol === "admin") {
    if (els.activityBannerTitle) els.activityBannerTitle.textContent = "Panel de Operación Institucional";
    if (els.activityBannerSub) els.activityBannerSub.textContent = "Flota, solicitudes y volumen de movilidad del campus";
    if (els.metricLabel1) els.metricLabel1.textContent = "VIAJES FLOTA";
    if (els.metricTag1) els.metricTag1.textContent = "HISTÓRICO";
    if (els.metricLabel2) els.metricLabel2.textContent = "FINALIZADOS";
    if (els.metricTag2) els.metricTag2.textContent = "CERRADOS";
    if (els.metricLabel3) els.metricLabel3.textContent = "EN CURSO";
    if (els.metricTag3) els.metricTag3.textContent = "ACTIVOS";
    if (els.metricLabel4) els.metricLabel4.textContent = "VOLUMEN MOVILIDAD";
    if (els.metricTag4) els.metricTag4.textContent = "FACTURADO COP";

    els.metricTotal.textContent = String(m.totalViajes ?? 0);
    els.metricFinalizados.textContent = String(m.finalizados ?? 0);
    els.metricSolicitados.textContent = String(m.enCurso ?? 0);
    els.metricIngresos.textContent = `$${Number(m.volumenMovilidadCop ?? 0).toLocaleString("es-CO")}`;
    return;
  }

  if (rol === "motorista") {
    if (els.activityBannerTitle) els.activityBannerTitle.textContent = "Mi Desempeño como Tucán";
    if (els.activityBannerSub) els.activityBannerSub.textContent = "Carreras realizadas, solicitudes y aportes recibidos";
    if (els.metricLabel1) els.metricLabel1.textContent = "MIS CARRERAS";
    if (els.metricTag1) els.metricTag1.textContent = "ASIGNADAS";
    if (els.metricLabel2) els.metricLabel2.textContent = "COMPLETADAS";
    if (els.metricTag2) els.metricTag2.textContent = "FINALIZADAS";
    if (els.metricLabel3) els.metricLabel3.textContent = "EN RADAR";
    if (els.metricTag3) els.metricTag3.textContent = "PENDIENTES";
    if (els.metricLabel4) els.metricLabel4.textContent = "MIS GANANCIAS";
    if (els.metricTag4) els.metricTag4.textContent = "TUCÁN";

    els.metricTotal.textContent = String(m.totalViajes ?? 0);
    els.metricFinalizados.textContent = String(m.finalizados ?? 0);
    els.metricSolicitados.textContent = String(m.solicitados ?? 0);
    els.metricIngresos.textContent = `$${Number(m.gananciasCop ?? 0).toLocaleString("es-CO")}`;
    return;
  }

  if (rol === "pasajero") {
    if (els.activityBannerTitle) els.activityBannerTitle.textContent = "Mi Historial Universitario";
    if (els.activityBannerSub) els.activityBannerSub.textContent = "Tus trayectos entre sedes y lugares guardados";
    if (els.metricLabel1) els.metricLabel1.textContent = "MIS VIAJES";
    if (els.metricTag1) els.metricTag1.textContent = "HISTÓRICO";
    if (els.metricLabel2) els.metricLabel2.textContent = "FINALIZADOS";
    if (els.metricTag2) els.metricTag2.textContent = "SEGUROS";
    if (els.metricLabel3) els.metricLabel3.textContent = "ACTIVOS";
    if (els.metricTag3) els.metricTag3.textContent = "EN CURSO";
    if (els.metricLabel4) els.metricLabel4.textContent = "MI GASTO";
    if (els.metricTag4) els.metricTag4.textContent = "APORTES";

    els.metricTotal.textContent = String(m.totalViajes ?? 0);
    els.metricFinalizados.textContent = String(m.finalizados ?? 0);
    els.metricSolicitados.textContent = String(m.solicitados ?? 0);
    els.metricIngresos.textContent = `$${Number(m.gastoTotalCop ?? 0).toLocaleString("es-CO")}`;
    return;
  }

  els.metricTotal.textContent = "0";
  els.metricFinalizados.textContent = "0";
  els.metricSolicitados.textContent = "0";
  els.metricIngresos.textContent = "$0";
}

const TUCAN_MODELS = {
  SOLICITADO: {
    src: "/assets/models/tucan-moto-llegando.png",
    tag: "BUSCANDO TUCÁN",
    desc: "Conectando con Tucanes verificados con SOAT vigente cerca de ti.",
    bannerTitle: "Buscando tu Tucán...",
    bannerSubPrefix: "Tiempo estimado:"
  },
  ACEPTADO: {
    src: "/assets/models/tucan-moto-llegando.png",
    tag: "TUCÁN EN CAMINO",
    desc: "Tu Tucán conduce hacia tu punto de recogida. Ten listo tu PIN.",
    bannerTitle: "Tu Tucán está llegando",
    bannerSubPrefix: "Tu Tucán llega en:"
  },
  EN_CURSO: {
    src: "/assets/models/tucan-moto-estudiante.png",
    tag: "VIAJE CON ESTUDIANTE",
    desc: "Viajando seguro con tu Tucán hacia tu destino universitario.",
    bannerTitle: "Viajando con tu Tucán",
    bannerSubPrefix: "Llegas a tu destino en:"
  },
  FINALIZADO: {
    src: "/assets/models/tucan-moto-llegada.png",
    tag: "LLEGADA SEGURA",
    desc: "¡Llegaste a tu destino! Confirma tu llegada segura en portería.",
    bannerTitle: "¡Llegaste con tu Tucán!",
    bannerSubPrefix: "Estado del trayecto:"
  }
};

function obtenerModeloTucanPorEstado(estado) {
  return TUCAN_MODELS[estado] || TUCAN_MODELS.ACEPTADO;
}

function calcularRumboGrados(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dLambda = toRad(lng2 - lng1);
  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function interpolarPosicionEnPolilinea(puntos, progresoPct) {
  if (!Array.isArray(puntos) || puntos.length === 0) return null;
  const coords = puntos.map((p) =>
    Array.isArray(p) ? [Number(p[0]), Number(p[1])] : [Number(p.latitud), Number(p.longitud)]
  );
  if (coords.length === 1) {
    return { lat: coords[0][0], lng: coords[0][1], bearing: 90 };
  }
  const tTotal = Math.max(0, Math.min(1, Number(progresoPct || 0) / 100));
  const segLengths = [];
  let totalLen = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const dLat = coords[i + 1][0] - coords[i][0];
    const dLng = coords[i + 1][1] - coords[i][1];
    const len = Math.hypot(dLat, dLng);
    segLengths.push(len);
    totalLen += len;
  }
  if (totalLen === 0) {
    return { lat: coords[0][0], lng: coords[0][1], bearing: 90 };
  }
  let targetDist = tTotal * totalLen;
  for (let i = 0; i < segLengths.length; i++) {
    const seg = segLengths[i];
    if (targetDist <= seg || i === segLengths.length - 1) {
      const localT = seg > 0 ? Math.max(0, Math.min(1, targetDist / seg)) : 0;
      const lat = coords[i][0] + (coords[i + 1][0] - coords[i][0]) * localT;
      const lng = coords[i][1] + (coords[i + 1][1] - coords[i][1]) * localT;
      const bearing = calcularRumboGrados(coords[i][0], coords[i][1], coords[i + 1][0], coords[i + 1][1]);
      return { lat, lng, bearing };
    }
    targetDist -= seg;
  }
  const last = coords[coords.length - 1];
  return { lat: last[0], lng: last[1], bearing: 90 };
}

function limpiarVehiculoTucanEnMapa() {
  if (state.vehicleAnimFrame) {
    cancelAnimationFrame(state.vehicleAnimFrame);
    state.vehicleAnimFrame = null;
  }
  if (state.vehicleMarker) {
    if (typeof state.vehicleMarker.remove === "function") state.vehicleMarker.remove();
    else if (typeof state.vehicleMarker.setMap === "function") state.vehicleMarker.setMap(null);
    state.vehicleMarker = null;
  }
  state.vehicleMarkerEl = null;
  state.vehiclePos = null;
}

function construirElementoVehiculoTucan(modelo, pillText, facingWest) {
  const wrap = document.createElement("div");
  wrap.className = "tucan-map-vehicle";
  wrap.innerHTML = `
    <div class="tucan-map-pill"><span class="eta-dot"></span><span class="tucan-map-pill-txt">${esc(pillText)}</span></div>
    <div class="tucan-map-sprite-wrap${facingWest ? " facing-west" : ""}">
      <div class="tucan-map-shadow"></div>
      <img src="${esc(modelo.src)}" alt="${esc(modelo.tag)}" class="tucan-map-sprite" width="72" height="72" />
    </div>
  `;
  return wrap;
}

function posicionarVehiculoEnMapa(lat, lng) {
  if (!state.vehicleMarker) return;
  if (state.mapEngine === "mapbox" && typeof state.vehicleMarker.setLngLat === "function") {
    state.vehicleMarker.setLngLat([lng, lat]);
  } else if ("position" in state.vehicleMarker && typeof state.vehicleMarker.setPosition !== "function") {
    state.vehicleMarker.position = { lat, lng };
  } else if (typeof state.vehicleMarker.setPosition === "function") {
    state.vehicleMarker.setPosition({ lat, lng });
  }
}

function actualizarVehiculoTucanEnMapa(viajeActivo, etaRestante) {
  if (!state.map || !viajeActivo || viajeActivo.estado === "SOLICITADO") {
    limpiarVehiculoTucanEnMapa();
    return;
  }

  const modelo = obtenerModeloTucanPorEstado(viajeActivo.estado);
  const progreso =
    viajeActivo.estado === "FINALIZADO"
      ? 100
      : viajeActivo.estado === "ACEPTADO"
        ? Math.max(8, Math.min(35, Number(viajeActivo.progresoRuta || 12)))
        : Math.max(5, Number(viajeActivo.progresoRuta || 15));

  let target = interpolarPosicionEnPolilinea(state.lastPolilinea, progreso);
  if (!target && viajeActivo.motorista?.latitud && viajeActivo.motorista?.longitud) {
    target = {
      lat: Number(viajeActivo.motorista.latitud),
      lng: Number(viajeActivo.motorista.longitud),
      bearing: 90
    };
  }
  if (!target) {
    target = { lat: FLORENCIA_CENTRO[0], lng: FLORENCIA_CENTRO[1], bearing: 90 };
  }

  const facingWest = target.bearing > 180 && target.bearing < 360;
  state.vehicleFacingWest = facingWest;
  const pillText =
    viajeActivo.estado === "FINALIZADO"
      ? "¡En destino!"
      : viajeActivo.estado === "ACEPTADO"
        ? `Tu Tucán · ${etaRestante} min`
        : `En curso · ${etaRestante} min`;

  if (!state.vehicleMarker) {
    const el = construirElementoVehiculoTucan(modelo, pillText, facingWest);
    state.vehicleMarkerEl = el;
    if (state.mapEngine === "mapbox" && window.mapboxgl) {
      state.vehicleMarker = new window.mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([target.lng, target.lat])
        .addTo(state.map);
    } else if (window.google?.maps) {
      const AdvancedMarker = window.google.maps.marker?.AdvancedMarkerElement;
      if (AdvancedMarker && state.mapConfig?.googleMapsMapId) {
        state.vehicleMarker = new AdvancedMarker({
          map: state.map,
          position: { lat: target.lat, lng: target.lng },
          title: pillText,
          content: el,
          zIndex: 950
        });
      } else {
        state.vehicleMarker = new window.google.maps.Marker({
          map: state.map,
          position: { lat: target.lat, lng: target.lng },
          title: pillText,
          icon: {
            url: modelo.src,
            scaledSize: new window.google.maps.Size(66, 66),
            anchor: new window.google.maps.Point(33, 56)
          },
          zIndex: 950
        });
      }
    }
    state.vehiclePos = { lat: target.lat, lng: target.lng };
    return;
  }

  // Actualizar sprite, etiqueta y dirección sin recrear el marcador
  if (state.vehicleMarkerEl) {
    const img = state.vehicleMarkerEl.querySelector(".tucan-map-sprite");
    const txt = state.vehicleMarkerEl.querySelector(".tucan-map-pill-txt");
    const wrap = state.vehicleMarkerEl.querySelector(".tucan-map-sprite-wrap");
    if (img && img.getAttribute("src") !== modelo.src) img.setAttribute("src", modelo.src);
    if (txt) txt.textContent = pillText;
    if (wrap) wrap.classList.toggle("facing-west", facingWest);
  } else if (typeof state.vehicleMarker.setIcon === "function" && window.google?.maps) {
    state.vehicleMarker.setIcon({
      url: modelo.src,
      scaledSize: new window.google.maps.Size(66, 66),
      anchor: new window.google.maps.Point(33, 56)
    });
  }

  // Interpolación suave a 60 FPS entre posición anterior y nueva
  const start = state.vehiclePos || { lat: target.lat, lng: target.lng };
  const startTs = performance.now();
  const durationMs = 650;
  if (state.vehicleAnimFrame) cancelAnimationFrame(state.vehicleAnimFrame);
  const step = (now) => {
    const rawT = Math.min(1, (now - startTs) / durationMs);
    const ease = 1 - Math.pow(1 - rawT, 3);
    const curLat = start.lat + (target.lat - start.lat) * ease;
    const curLng = start.lng + (target.lng - start.lng) * ease;
    state.vehiclePos = { lat: curLat, lng: curLng };
    posicionarVehiculoEnMapa(curLat, curLng);
    if (rawT < 1) {
      state.vehicleAnimFrame = requestAnimationFrame(step);
    } else {
      state.vehicleAnimFrame = null;
    }
  };
  state.vehicleAnimFrame = requestAnimationFrame(step);
}

function renderSeguimientoEnVivo(data) {
  if (state.role !== "pasajero") {
    els.liveTrackingCard.classList.add("hidden");
    if (els.mapRappiBanner) els.mapRappiBanner.classList.add("hidden");
    if (els.mobileTrackingDot) els.mobileTrackingDot.classList.add("hidden");
    limpiarVehiculoTucanEnMapa();
    return;
  }

  const estId =
    state.authUser?.rol === "pasajero"
      ? state.authUser.identificacion
      : els.selectEstudiante.value;
  const viajesOrdenados = [...(data.viajes || [])].reverse();
  const viajeActivo = viajesOrdenados.find(
    (v) =>
      v.estudiante.id === estId &&
      (v.estado === "SOLICITADO" ||
        v.estado === "ACEPTADO" ||
        v.estado === "EN_CURSO" ||
        (v.estado === "FINALIZADO" && !v.llegadaSeguraConfirmada))
  );

  if (els.mobileTrackingDot) {
    els.mobileTrackingDot.classList.toggle("hidden", !viajeActivo);
  }

  if (!viajeActivo) {
    els.liveTrackingCard.classList.add("hidden");
    if (els.mapRappiBanner) els.mapRappiBanner.classList.add("hidden");
    limpiarVehiculoTucanEnMapa();
    return;
  }

  els.liveTrackingCard.classList.remove("hidden");
  els.trackingPin.textContent = viajeActivo.pinSeguridad || "0000";
  const progreso = Number(viajeActivo.progresoRuta || 0);
  const progresoVisual = viajeActivo.estado === "FINALIZADO" ? 100 : Math.max(4, progreso);
  els.trackingProgressBar.style.width = `${progreso}%`;
  if (els.trackingProgressThumb) els.trackingProgressThumb.style.left = `${progresoVisual}%`;
  els.trackingProgressPct.textContent = `${progreso}% del tramo`;
  const etaRestante = Math.max(1, Math.round(((100 - progreso) / 100) * Math.max(2, state.routeMin)));
  els.trackingEtaLive.textContent =
    viajeActivo.estado === "FINALIZADO"
      ? "En destino"
      : viajeActivo.estado === "SOLICITADO"
        ? "Buscando..."
        : `ETA ~${etaRestante} min`;

  // Actualizar escenario 3D del Tucán + Banner flotante estilo Rappi
  const modelo = obtenerModeloTucanPorEstado(viajeActivo.estado);
  if (els.trackingModelImg && els.trackingModelImg.getAttribute("src") !== modelo.src) {
    els.trackingModelImg.setAttribute("src", modelo.src);
  }
  if (els.trackingThumbImg && els.trackingThumbImg.getAttribute("src") !== modelo.src) {
    els.trackingThumbImg.setAttribute("src", modelo.src);
  }
  if (els.trackingModelTag) els.trackingModelTag.textContent = modelo.tag;
  if (els.trackingModelDesc) els.trackingModelDesc.textContent = modelo.desc;

  if (els.mapRappiBanner) {
    els.mapRappiBanner.classList.remove("hidden");
    if (els.mapRappiModelImg && els.mapRappiModelImg.getAttribute("src") !== modelo.src) {
      els.mapRappiModelImg.setAttribute("src", modelo.src);
    }
    if (els.mapRappiTitle) els.mapRappiTitle.textContent = modelo.bannerTitle;
    if (els.mapRappiSubPrefix) els.mapRappiSubPrefix.textContent = modelo.bannerSubPrefix;
    if (els.mapRappiEta) {
      els.mapRappiEta.textContent =
        viajeActivo.estado === "FINALIZADO"
          ? "Completado"
          : viajeActivo.estado === "SOLICITADO"
            ? `~${state.routeMin} min`
            : `${etaRestante} min`;
    }
    if (els.mapRappiProgressFill) els.mapRappiProgressFill.style.width = `${progresoVisual}%`;
    if (els.mapRappiProgressThumb) {
      els.mapRappiProgressThumb.style.left = `${progresoVisual}%`;
      const thumbImg = els.mapRappiProgressThumb.querySelector("img");
      if (thumbImg && thumbImg.getAttribute("src") !== modelo.src) {
        thumbImg.setAttribute("src", modelo.src);
      }
    }
    if (els.mapEnginePill) {
      els.mapEnginePill.textContent = state.mapEngine === "mapbox" ? "MAPBOX 3D" : "3D LIVE";
    }
  }

  actualizarVehiculoTucanEnMapa(viajeActivo, etaRestante);

  const btns = [];
  if (els.trackingRadarStage) {
    els.trackingRadarStage.classList.toggle("hidden", viajeActivo.estado !== "SOLICITADO");
  }
  if (viajeActivo.estado === "SOLICITADO") {
    els.trackingStageBadge.textContent = `SOLICITUD ACTIVA · ${viajeActivo.codigo}`;
    els.trackingTitle.textContent = "Buscando Tucán verificado...";
    els.trackingSubtitle.textContent = `${viajeActivo.origen} → ${viajeActivo.destino} (${formatoCop(viajeActivo.tarifa)})`;
    els.trackingDriverBox.classList.add("hidden");
    btns.push(
      `<button type="button" class="btn-danger-outline" data-cancelar-viaje="${esc(viajeActivo.codigo)}">Cancelar Solicitud</button>`
    );
  } else if (viajeActivo.estado === "ACEPTADO") {
    els.trackingStageBadge.textContent = `TUCÁN EN CAMINO · ${viajeActivo.codigo}`;
    els.trackingTitle.textContent = "Tu Tucán va hacia tu punto de recogida";
    els.trackingSubtitle.textContent = `Comparte tu PIN ${viajeActivo.pinSeguridad} al abordar la motocicleta.`;
  } else if (viajeActivo.estado === "EN_CURSO") {
    els.trackingStageBadge.textContent = `TRAYECTO EN CURSO · ${viajeActivo.codigo}`;
    els.trackingTitle.textContent = "En camino a tu destino";
    els.trackingSubtitle.textContent = `${viajeActivo.origen} → ${viajeActivo.destino}`;
  } else if (viajeActivo.estado === "FINALIZADO") {
    els.trackingStageBadge.textContent = `LLEGADA AL DESTINO · ${viajeActivo.codigo}`;
    els.trackingTitle.textContent = "¡Llegaste a tu destino!";
    els.trackingSubtitle.textContent = `Aporte ${viajeActivo.pago.metodo} (${viajeActivo.pago.estado})`;
    if (!viajeActivo.llegadaSeguraConfirmada) {
      btns.push(
        `<button type="button" class="btn-primary btn-sm" data-llegada-segura="${esc(viajeActivo.codigo)}">Confirmar Llegada Segura</button>`
      );
    }
    if (viajeActivo.calificaciones.length === 0) {
      btns.push(
        `<button type="button" class="btn-chip" data-calificar-viaje="${esc(viajeActivo.codigo)}">Calificar Tucán</button>`
      );
    }
  }

  if (viajeActivo.motorista) {
    els.trackingDriverBox.classList.remove("hidden");
    els.trackingDriverInitials.textContent = iniciales(viajeActivo.motorista.nombre);
    els.trackingDriverName.textContent = viajeActivo.motorista.nombre;
    els.trackingMotoDesc.textContent = "Motocicleta Verificada · SOAT Vigente";
    els.trackingMotoPlate.textContent = viajeActivo.motorista.placaMoto;
  }

  els.trackingActionsRow.innerHTML = btns.join("");
}

function renderMotorista(data) {
  const mot = (data.motoristas || []).find((m) => m.identificacion === els.selectMotorista.value);
  if (mot) {
    if (mot.motoActiva) {
      els.driverMotoInfo.textContent = `${mot.motoActiva.marca} ${mot.motoActiva.modelo} ${mot.motoActiva.cilindraje}cc · Placa ${mot.motoActiva.placa} · ${mot.motoActiva.numeroSoat}`;
      els.driverSoatBadge.textContent = mot.motoActiva.soatVigente ? "SOAT VIGENTE" : "SOAT INACTIVO";
    }
    els.btnToggleDisponibilidad.classList.toggle("active", mot.disponible);
    els.btnToggleDisponibilidad.setAttribute("aria-pressed", String(mot.disponible));
    els.toggleDisponibilidadText.textContent = mot.disponible ? "En línea" : "Desconectado";
    els.driverOnlineStatusLabel.textContent = mot.disponible
      ? "En línea · Recibiendo solicitudes"
      : "Desconectado";
    if (!state.realGps && typeof mot.latitud === "number" && typeof mot.longitud === "number") {
      els.driverCoordsChip.textContent = `Lat ${mot.latitud.toFixed(4)} · Lon ${mot.longitud.toFixed(4)}`;
    }
  }

  const activo = (data.viajes || []).find(
    (v) =>
      v.motorista &&
      v.motorista.id === els.selectMotorista.value &&
      (v.estado === "ACEPTADO" || v.estado === "EN_CURSO")
  );
  if (activo) {
    els.driverActiveBox.classList.remove("hidden");
    els.driverActiveBox.dataset.codigo = activo.codigo;
    els.driverTripCode.textContent = activo.codigo;
    els.driverTripState.textContent = activo.estado;
    els.driverTripPin.textContent = `PIN: ${activo.pinSeguridad || "----"}`;
    els.driverTrackingStageText.textContent =
      activo.estado === "ACEPTADO"
        ? "Dirígete al punto de recogida y verifica el PIN con el estudiante"
        : "Trayecto en curso hacia el destino";
    els.driverProgressBar.style.width = `${Number(activo.progresoRuta || 0)}%`;
    els.driverTripPax.textContent = `Estudiante: ${activo.estudiante.nombre}`;
    els.driverTripRoute.textContent = `${activo.origen} → ${activo.destino} (${activo.distanciaKm} km)`;
    els.driverTripPrice.textContent = `Aporte: ${formatoCop(activo.tarifa)} (${activo.pago.metodo})`;
    els.btnIniciarViaje.disabled = activo.estado !== "ACEPTADO";
    els.btnFinalizarViaje.disabled = activo.estado !== "EN_CURSO";
  } else {
    els.driverActiveBox.classList.add("hidden");
    els.driverActiveBox.dataset.codigo = "";
  }

  const solicitados = (data.viajes || []).filter((v) => v.estado === "SOLICITADO");
  els.radarCount.textContent = `${solicitados.length} pendientes`;
  if (solicitados.length === 0) {
    els.radarList.innerHTML = renderEmptyState(
      "Sin solicitudes pendientes en campus",
      "Cuando un estudiante solicite un trayecto aparecerá aquí en tiempo real."
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
          </div>
          <strong class="mono-text">${formatoCop(v.tarifa)}</strong>
        </div>
        <div class="ride-route">${esc(v.origen)} → ${esc(v.destino)}</div>
        <div class="ride-meta">${esc(v.estudiante.nombre)} · ${esc(v.distanciaKm)} km · ${esc(v.estrategia)} · ${esc(v.pago.metodo)}</div>
        <div class="ride-actions">
          <span class="chip-mono chip-verified">RUTA VERIFICADA</span>
          <button type="button" class="btn-primary btn-sm" data-aceptar-viaje="${esc(v.codigo)}">Aceptar Solicitud</button>
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
  const uid = state.authUser?.identificacion;
  const esAdmin = state.authUser?.rol === "admin";
  const esMotorista = state.role === "motorista";
  const viajes = [...(data.viajes || [])]
    .reverse()
    .filter((v) => {
      if (!uid || esAdmin) return true;
      return esMotorista
        ? v.motorista?.id === uid
        : v.estudiante.id === uid;
    });
  els.feedCount.textContent = `${viajes.length} REGISTROS`;

  if (viajes.length === 0) {
    els.viajesFeed.innerHTML = renderEmptyState(
      esMotorista ? "Sin carreras asignadas aún" : "Sin trayectos registrados aún",
      esMotorista
        ? "Acepta una solicitud pendiente en Radar Tucán para iniciar tu recorrido."
        : "Selecciona tu origen y destino en el mapa o tus lugares guardados para pedir un Tucán."
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
      // El administrador observa la operación; no ejecuta viajes como pasajero
      // ni como Tucán. El servidor también lo rechaza.
      if (!esAdmin) {
        if (esMotorista) {
          if (v.estado === "ACEPTADO" && v.motorista?.id === uid) {
            botones.push(`<button type="button" class="btn-primary btn-sm" data-iniciar-viaje="${esc(v.codigo)}">Iniciar</button>`);
          } else if (v.estado === "EN_CURSO" && v.motorista?.id === uid) {
            botones.push(`<button type="button" class="btn-leaf btn-sm" data-finalizar-viaje="${esc(v.codigo)}">Finalizar</button>`);
          }
        } else {
          if (v.estado === "SOLICITADO" || v.estado === "ACEPTADO") {
            botones.push(`<button type="button" class="btn-danger-outline" data-cancelar-viaje="${esc(v.codigo)}">Cancelar</button>`);
          } else if (v.estado === "FINALIZADO") {
            if (!v.llegadaSeguraConfirmada) {
              botones.push(`<button type="button" class="btn-primary btn-sm" data-llegada-segura="${esc(v.codigo)}">Confirmar Llegada Segura</button>`);
            }
            if (v.calificaciones.length === 0) {
              botones.push(`<button type="button" class="btn-chip" data-calificar-viaje="${esc(v.codigo)}">Calificar</button>`);
            }
          }
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
          <div class="ride-meta">Estudiante: ${esc(v.estudiante.nombre)} · Tucán: ${driverHtml} · ${esc(v.distanciaKm)} km · ${esc(v.pago.metodo)} (${esc(v.pago.estado)})</div>
          ${botones.length > 0 ? `<div class="ride-actions">${botones.join("")}</div>` : ""}
        </article>`;
    })
    .join("");
}

function esUrlImagen(valor) {
  return typeof valor === "string" && /^(data:image\/|https?:\/\/|\/)/.test(valor.trim());
}

function construirMiniaturaDocumento(url, etiqueta, nombreTitular) {
  if (!esUrlImagen(url)) {
    return `<figure class="audit-doc">
      <div class="audit-doc-missing">Sin adjuntar</div>
      <figcaption>${esc(etiqueta)}</figcaption>
    </figure>`;
  }
  return `<figure class="audit-doc">
    <img src="${esc(url)}" alt="${esc(etiqueta)} de ${esc(nombreTitular)}" class="audit-doc-thumb" data-doc-zoom="true" />
    <figcaption>${esc(etiqueta)} · <span class="audit-doc-hint">ampliar</span></figcaption>
  </figure>`;
}

function abrirVisorDocumento(src, alt) {
  let overlay = document.getElementById("visor-documento");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "visor-documento";
    overlay.className = "doc-viewer hidden";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Vista ampliada del documento");
    overlay.innerHTML = `
      <button type="button" class="doc-viewer-close" aria-label="Cerrar vista ampliada">&times;</button>
      <img id="visor-documento-img" alt="" />`;
    document.body.appendChild(overlay);
  }
  const img = overlay.querySelector("#visor-documento-img");
  if (img) {
    img.src = src;
    img.alt = alt || "Documento ampliado";
  }
  overlay.classList.remove("hidden");
  overlay.querySelector(".doc-viewer-close")?.focus();
}

function cerrarVisorDocumento() {
  document.getElementById("visor-documento")?.classList.add("hidden");
}

document.addEventListener("click", (e) => {
  const thumb = e.target.closest?.("img[data-doc-zoom]");
  if (thumb) {
    abrirVisorDocumento(thumb.src, thumb.alt);
    return;
  }
  const overlay = document.getElementById("visor-documento");
  if (!overlay || overlay.classList.contains("hidden")) return;
  if (e.target === overlay || e.target.closest?.(".doc-viewer-close")) {
    cerrarVisorDocumento();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarVisorDocumento();
});

function construirHtmlTarjetasExpedienteTucan(lista, conAcciones = true, emptyTitulo = "Sin solicitudes pendientes", emptyDesc = "Todos los aspirantes a Tucán han sido auditados.") {
  if (!lista || lista.length === 0) {
    return renderEmptyState(emptyTitulo, emptyDesc);
  }
  return lista
    .map((t) => {
      const faceUrl =
        t.fotoRostroUrl ||
        "data:image/svg+xml;utf8," +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#EAF1ED"/><text x="40" y="48" font-size="28" text-anchor="middle" fill="#006837">${esc(inicialesNombre(t.nombre))}</text></svg>`
          );
      const galeriaDocumentos = `
        ${construirMiniaturaDocumento(t.fotoCedulaUrl, "Cédula", t.nombre)}
        ${construirMiniaturaDocumento(t.fotoSoatUrl, "SOAT", t.nombre)}
        ${construirMiniaturaDocumento(t.fotoLicenciaUrl, "Licencia A2", t.nombre)}
        ${construirMiniaturaDocumento(t.fotoMotoUrl, "Motocicleta", t.nombre)}
      `;

      const estadoChip =
        t.estadoAprobacion === "ACTIVO"
          ? `<span class="chip-mono chip-verified">ACTIVO · EN FLOTA</span>`
          : t.estadoAprobacion === "RECHAZADO"
            ? `<span class="chip-mono chip-danger">RECHAZADO</span>`
            : `<span class="chip-mono chip-ochre-soft">EN REVISIÓN</span>`;

      const accionesHtml = conAcciones
        ? `<div class="audit-card-actions">
            <button type="button" class="btn-rechazar-tucan" data-rechazar-tucan="${esc(t.identificacion)}">
              ${tgIcon("iconly-close-square")} Rechazar
            </button>
            <button type="button" class="btn-aprobar-tucan" data-aprobar-tucan="${esc(t.identificacion)}">
              ${tgIcon("iconly-tick-square")} Aprobar y Enviar Bienvenida
            </button>
          </div>`
        : "";

      return `
        <article class="audit-tucan-card">
          <div class="audit-card-top">
            <img src="${esc(faceUrl)}" alt="Foto facial de ${esc(t.nombre)}" class="audit-face-img" />
            <div class="audit-person-info">
              <h4>${esc(t.nombre)}</h4>
              <p>C.C. ${esc(t.identificacion)} · WhatsApp: ${esc(t.telefono)} · ${esc(t.correo)}</p>
              ${t.fechaAprobacion ? `<p style="font-size:11px;color:#006837;">Aprobado: ${new Date(t.fechaAprobacion).toLocaleDateString("es-CO")}</p>` : ""}
            </div>
            ${estadoChip}
          </div>
          <div class="audit-docs-grid">
            <div>
              <strong>${tgIcon("tg-moto")} Motocicleta:</strong><br/>
              <span>${esc(t.moto?.marca || "")} ${esc(t.moto?.modelo || "")} (${esc(t.moto?.cilindraje || "")}cc)</span><br/>
              <span>Placa: <strong class="mono-text">${esc(t.moto?.placa || "N/A")}</strong></span>
            </div>
            <div>
              <strong>${tgIcon("iconly-document")} Marco Legal (Hoja de Vida):</strong><br/>
              <span>SOAT: <strong>${esc(t.moto?.numeroSoat || "N/A")}</strong> · ${esUrlImagen(t.fotoSoatUrl) ? "documento adjunto" : "sin documento"}</span><br/>
              <span>Licencia A2: <strong>${esc(t.numeroLicencia || "N/A")}</strong> · ${esUrlImagen(t.fotoLicenciaUrl) ? "documento adjunto" : "sin documento"}</span><br/>
              <span>Compromiso Honor: <strong style="color:#006837;">${t.compromisoAceptado ? `${tgIcon("iconly-tick-square")} Aceptado` : "Pendiente"}</strong></span>
            </div>
          </div>
          <div class="audit-doc-gallery">
            ${galeriaDocumentos}
          </div>
          ${accionesHtml}
        </article>`;
    })
    .join("");
}

function construirHtmlCorreosAuditoria(correos) {
  if (correos.length === 0) {
    return renderEmptyState(
      "Sin correos despachados",
      "Al aprobar a un Tucán se generará aquí su correo institucional de bienvenida."
    );
  }
  return correos
    .map(
      (c) => `
      <article class="audit-email-card">
        <div class="audit-email-header">
          <span>Para: ${esc(c.destinatario)}</span>
          <span>${new Date(c.enviadoEn).toLocaleString("es-CO")}</span>
        </div>
        <div class="audit-email-subject">${tgIcon("iconly-message")} ${esc(c.asunto)}</div>
        <div class="audit-email-body">${esc(c.mensajeHtml)}</div>
      </article>`
    )
    .join("");
}

function renderAuditoriaTucanes(data) {
  const esAdmin = state.authUser?.rol === "admin";
  if (els.btnAbrirAuditoria) {
    els.btnAbrirAuditoria.classList.toggle("hidden", !esAdmin);
  }
  const pendientes = data.tucanesPendientes || [];
  const expedientes = data.tucanesExpedientes || [];
  const correos = data.notificacionesCorreo || [];

  if (els.countTucanesPendientes) els.countTucanesPendientes.textContent = String(pendientes.length);
  if (els.adminTabPendBadge) els.adminTabPendBadge.textContent = String(pendientes.length);
  if (els.tabCountPendientes) els.tabCountPendientes.textContent = String(pendientes.length);
  if (els.tabCountExpedientes) els.tabCountExpedientes.textContent = String(expedientes.length);
  if (els.tabCountCorreos) els.tabCountCorreos.textContent = String(correos.length);

  const htmlPend = construirHtmlTarjetasExpedienteTucan(pendientes, true);
  const htmlExp = construirHtmlTarjetasExpedienteTucan(
    expedientes,
    false,
    "Sin Tucanes registrados",
    "Aquí aparecerá la hoja de vida completa de cada Tucán en plataforma."
  );
  const htmlMail = construirHtmlCorreosAuditoria(correos);

  if (els.listaTucanesPendientes) els.listaTucanesPendientes.innerHTML = htmlPend;
  if (els.listaTucanesExpedientes) els.listaTucanesExpedientes.innerHTML = htmlExp;
  if (els.listaCorreosAuditoria) els.listaCorreosAuditoria.innerHTML = htmlMail;
  if (els.adminInlinePendientes) els.adminInlinePendientes.innerHTML = htmlPend;
  if (els.adminInlineCorreos) els.adminInlineCorreos.innerHTML = htmlMail;
}

// --- DASHBOARD EJECUTIVO ADMIN (CHART.JS v4.4.8) ---
function upsertChart(canvasId, config) {
  if (typeof window.Chart === "undefined") return;
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const existente = state.charts[canvasId];
  if (existente && existente.config?.type === config.type) {
    existente.data.labels = config.data.labels || [];
    existente.data.datasets = (config.data.datasets || []).map((ds, idx) => ({
      ...(existente.data.datasets?.[idx] || {}),
      ...ds
    }));
    existente.update("none");
    return;
  }
  if (existente) {
    existente.destroy();
  }
  state.charts[canvasId] = new window.Chart(canvas, config);
}

function renderAdminDashboard(data) {
  if (state.authUser?.rol !== "admin" || !data.analiticaAdmin) return;
  const a = data.analiticaAdmin;
  const r = a.resumen || {};

  if (els.adminKpiEstudiantes) els.adminKpiEstudiantes.textContent = String(r.totalEstudiantes ?? 0);
  if (els.adminKpiBarriosCount) els.adminKpiBarriosCount.textContent = `${(a.barriosEstudiantes || []).length} barrios registrados`;
  if (els.adminKpiTucanes) els.adminKpiTucanes.textContent = String(r.totalTucanesActivos ?? 0);
  if (els.adminKpiPendientes) els.adminKpiPendientes.textContent = `${r.totalTucanesPendientes ?? 0} pendientes por auditar`;
  if (els.adminKpiViajes) els.adminKpiViajes.textContent = String(r.totalViajes ?? 0);
  if (els.adminKpiCumplimiento) els.adminKpiCumplimiento.textContent = `${r.tasaCumplimientoPct ?? 0}% finalizados`;
  if (els.adminKpiSeguras) els.adminKpiSeguras.textContent = String(r.llegadasSeguras ?? 0);
  if (els.adminKpiKm) els.adminKpiKm.textContent = `${r.distanciaTotalKm ?? 0} km`;
  if (els.adminKpiKmProm) els.adminKpiKmProm.textContent = `Promedio ${r.promedioDistanciaKm ?? 0} km / viaje`;
  if (els.adminKpiVolumen) els.adminKpiVolumen.textContent = `$${Number(r.volumenMovilidadCop ?? 0).toLocaleString("es-CO")}`;

  // 1. Gráfica de barrios de residencia de estudiantes
  const barrios = a.barriosEstudiantes || [];
  upsertChart("chart-barrios", {
    type: "bar",
    data: {
      labels: barrios.length ? barrios.map((b) => b.barrio) : ["Sin datos"],
      datasets: [
        {
          label: "Estudiantes",
          data: barrios.length ? barrios.map((b) => b.estudiantes) : [0],
          backgroundColor: "#0F6B36",
          borderRadius: 6
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });

  // 2. Corredores más transitados
  const corredores = a.corredoresComunes || [];
  upsertChart("chart-corredores", {
    type: "bar",
    data: {
      labels: corredores.length ? corredores.map((c) => c.ruta.slice(0, 34)) : ["Sin viajes aún"],
      datasets: [
        {
          label: "Viajes",
          data: corredores.length ? corredores.map((c) => c.viajes) : [0],
          backgroundColor: "#FF6600",
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });

  // 3. Demanda por sede
  const sedes = a.demandaPorSede || [];
  upsertChart("chart-sedes", {
    type: "doughnut",
    data: {
      labels: sedes.map((s) => s.sede),
      datasets: [
        {
          data: sedes.some((s) => s.viajes > 0) ? sedes.map((s) => s.viajes) : [1, 1, 0],
          backgroundColor: ["#0F6B36", "#1D4ED8", "#D97706"]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } }
    }
  });

  // 4. Modalidades de tarifa / pago
  const tarifas = a.distribucionTarifas || [];
  upsertChart("chart-tarifas", {
    type: "doughnut",
    data: {
      labels: tarifas.length ? tarifas.map((t) => t.nombre) : ["Sin trayectos aún"],
      datasets: [
        {
          data: tarifas.length ? tarifas.map((t) => t.cantidad) : [1],
          backgroundColor: ["#0F6B36", "#2563EB", "#D97706", "#7C3AED"]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } }
    }
  });

  // Tablas comunidad
  if (els.adminTablaEstudiantes) {
    const ests = a.comunidad?.estudiantes || [];
    els.adminTablaEstudiantes.innerHTML = ests
      .map(
        (e) => `
        <tr>
          <td><strong>${esc(e.nombre)}</strong></td>
          <td class="mono-text">${esc(e.codigoEstudiantil)}</td>
          <td>${esc(e.carrera)}</td>
          <td>${esc(e.barrioResidencia)}</td>
          <td class="mono-text">${esc(e.viajesRealizados)}</td>
        </tr>`
      )
      .join("");
  }

  if (els.adminTablaTucanes) {
    const tucs = a.comunidad?.tucanes || [];
    els.adminTablaTucanes.innerHTML = tucs.length
      ? tucs
          .map(
            (m) => `
            <tr>
              <td><strong>${esc(m.nombre)}</strong></td>
              <td class="mono-text">${esc(m.placa)}</td>
              <td>${esc(m.marca)} ${esc(m.modelo)}</td>
              <td>${m.soatVigente ? `<span class="chip-mono chip-verified">${esc(m.numeroSoat)}</span>` : "Vencido"}</td>
              <td><span class="chip-mono ${m.estadoAprobacion === "ACTIVO" ? "chip-verified" : "chip-ochre-soft"}">${esc(m.estadoAprobacion)}</span></td>
              <td class="mono-text">${esc(m.viajesCompletados)}</td>
            </tr>`
          )
          .join("")
      : `<tr><td colspan="6" class="muted-sub">Aún no hay Tucanes registrados. Cuando un aspirante se registre en /login aparecerá en Auditoría.</td></tr>`;
  }

  // Tabla Trazabilidad y Bitácora Institucional
  if (els.adminTablaTrazabilidad) {
    const eventos = data?.bitacoraAuditoria || [];
    els.adminTablaTrazabilidad.innerHTML = eventos.length
      ? eventos
          .map((ev) => {
            const timeStr = ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : "--";
            const detalle = ev.payload ? JSON.stringify(ev.payload).slice(0, 90) : "";
            return `
            <tr>
              <td class="mono-text">${esc(timeStr)}</td>
              <td><strong>${esc(ev.tipo)}</strong></td>
              <td class="text-subtle"><small>${esc(detalle)}</small></td>
              <td><span class="chip-mono chip-verified">REGISTRADO</span></td>
            </tr>`;
          })
          .join("")
      : `<tr><td colspan="4" class="text-muted">Sin eventos registrados aún.</td></tr>`;
  }
}

function exportarCsvAdmin() {
  const a = state.data?.analiticaAdmin;
  if (!a) return;
  const rows = [
    ["Seccion", "Etiqueta", "Valor", "Detalle"],
    ["Resumen", "Estudiantes Registrados", a.resumen.totalEstudiantes, "Total comunidad"],
    ["Resumen", "Tucanes Activos", a.resumen.totalTucanesActivos, `${a.resumen.totalTucanesPendientes} pendientes`],
    ["Resumen", "Viajes Totales", a.resumen.totalViajes, `${a.resumen.viajesFinalizados} finalizados`],
    ["Resumen", "Llegadas Seguras", a.resumen.llegadasSeguras, "Confirmadas en porteria"],
    ...(a.barriosEstudiantes || []).map((b) => ["Barrio Residencia (Ley 1581)", b.barrio, b.estudiantes, `${b.porcentaje}%`]),
    ...(a.corredoresComunes || []).map((c) => ["Corredor Comun", c.ruta, c.viajes, `${c.kmPromedio} km promedio`]),
    ...(state.data?.bitacoraAuditoria || []).map((ev) => [
      "Bitacora Trazabilidad",
      ev.tipo,
      ev.timestamp,
      JSON.stringify(ev.payload || {})
    ])
  ];
  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `tucango-analitica-uniamazonia-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function renderAll(data) {
  state.data = data;
  renderMetricasPorRol(data);
  const debeMostrarMapa = state.authUser?.rol !== "admin" || state.adminShowMap;
  if (debeMostrarMapa && (state.map || (state.mapConfig && state.gmapsLoaded))) {
    initMap(data.sectores || []);
  }
  renderSelectores(data);
  renderMarcadoresEnVivo(data);
  renderSeguimientoEnVivo(data);
  renderMotorista(data);
  renderFeed(data);
  renderAuditoriaTucanes(data);
  renderAdminDashboard(data);
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
    els.sseLabel.textContent = "En línea";
  });
  es.addEventListener("dominio", () => {
    cargarEstado(false);
  });
  es.onerror = () => {
    els.ssePill.classList.add("offline");
    els.sseLabel.textContent = "Reconectando";
  };
}

async function cerrarSesionActual() {
  try {
    await postJson("/api/auth/logout", {});
  } catch {
    // Redirigir de todas formas a login
  }
  window.location.replace("/login");
}

async function abrirMapaAdmin() {
  state.adminShowMap = true;
  aplicarLayoutPorRol();
  await cargarConfigMapa();
  initMap(state.data?.sectores || []);
  state.map?.invalidateSize?.();
  setTimeout(() => {
    state.map?.invalidateSize?.();
    pintarRutaEnMapa(true);
  }, 180);
}

// --- EVENTOS UI ---
els.btnCerrarSesionApp?.addEventListener("click", cerrarSesionActual);
els.btnSesionTopbar?.addEventListener("click", async () => {
  if (state.authUser?.rol === "admin") {
    await abrirMapaAdmin();
  }
  switchTab("perfil");
});

els.btnAdminToggleMap?.addEventListener("click", async () => {
  if (!state.adminShowMap) {
    await abrirMapaAdmin();
    return;
  }
  state.adminShowMap = false;
  aplicarLayoutPorRol();
});

els.btnAdminExportCsv?.addEventListener("click", exportarCsvAdmin);

document.querySelectorAll("[data-admin-tab]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const t = btn.dataset.adminTab;
    document.querySelectorAll("[data-admin-tab]").forEach((b) => b.classList.toggle("active", b === btn));
    els.adminPanelAnalitica?.classList.toggle("hidden", t !== "analitica");
    els.adminPanelAuditoria?.classList.toggle("hidden", t !== "auditoria");
    els.adminPanelComunidad?.classList.toggle("hidden", t !== "comunidad");
    els.adminPanelTrazabilidad?.classList.toggle("hidden", t !== "trazabilidad");
  });
});

els.selectEstudiante?.addEventListener("change", () => {
  actualizarBannerSesion();
  if (state.data) renderSeguimientoEnVivo(state.data);
});
els.selectMotorista?.addEventListener("change", () => {
  actualizarBannerSesion();
  if (state.data) renderMotorista(state.data);
});
els.selectOrigen?.addEventListener("change", actualizarRutaDesdeSectores);
els.selectDestino?.addEventListener("change", actualizarRutaDesdeSectores);

els.btnIntercambiar?.addEventListener("click", () => {
  const temp = els.selectOrigen.value;
  els.selectOrigen.value = els.selectDestino.value;
  els.selectDestino.value = temp;
  actualizarRutaDesdeSectores();
});

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

document.querySelectorAll("[data-tab], [data-mobile-tab]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab || btn.dataset.mobileTab;
    if (els.didiStage && els.didiStage.classList.contains("sheet-peek")) {
      els.didiStage.classList.remove("sheet-peek");
      if (els.btnToggleSheet) els.btnToggleSheet.setAttribute("aria-expanded", "true");
      if (els.sheetToggleHint) els.sheetToggleHint.textContent = "Ver más mapa";
      setTimeout(() => state.map && state.map.invalidateSize(), 300);
    }

    if (tab === "motorista") {
      if (state.authUser?.rol === "admin" && state.role !== "motorista") {
        setRole("motorista");
        return;
      }
      if (state.role !== "motorista") return;
    }

    if (tab === "viajar" || tab === "tracking") {
      if (state.authUser?.rol === "admin" && state.role !== "pasajero") {
        setRole("pasajero");
        return;
      }
    }

    switchTab(tab);
  });
});

// Delegación de clics en accesos rápidos (sedes y lugares guardados)
els.savedPlacesBar?.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const destId = btn.dataset.quickDest || btn.dataset.quickSaved;
  if (!destId) return;
  if (e.shiftKey) {
    els.selectOrigen.value = destId;
  } else {
    if (els.selectOrigen.value === destId) {
      els.selectOrigen.value = destId === "PORVENIR" ? "CENTRO" : "PORVENIR";
    }
    els.selectDestino.value = destId;
  }
  actualizarRutaDesdeSectores();
});

// Gestión modal de lugares frecuentes (Casa / Trabajo / Favorito)
els.btnAbrirGuardarLugar?.addEventListener("click", abrirModalLugar);
els.btnPerfilAgregarLugar?.addEventListener("click", abrirModalLugar);
els.btnCerrarLugar?.addEventListener("click", () => {
  state.pickingMapPlace = false;
  els.modalLugarFrecuente?.classList.add("hidden");
});

els.btnLugarUsarGps?.addEventListener("click", () => {
  if (state.realGps && estaDentroDeFlorencia(state.realGps.latitud, state.realGps.longitud)) {
    els.lugarLat.value = String(state.realGps.latitud.toFixed(6));
    els.lugarLng.value = String(state.realGps.longitud.toFixed(6));
    if (state.realAddressLabel && !els.lugarReferencia.value) {
      els.lugarReferencia.value = state.realAddressLabel;
    }
    showToast("Coordenadas GPS actuales aplicadas", "success");
  } else {
    iniciarGeolocalizacionTiempoReal(true);
    showToast("Activa tu ubicación GPS dentro de Florencia o selecciona el punto en el mapa", "info");
  }
});

els.btnLugarElegirMapa?.addEventListener("click", () => {
  state.pickingMapPlace = true;
  els.modalLugarFrecuente?.classList.add("hidden");
  showToast("Toca cualquier punto del mapa en Florencia para fijar tu ubicación", "info");
});

els.formGuardarLugar?.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const payload = {
      etiqueta: els.lugarEtiqueta.value,
      nombre: els.lugarNombre.value.trim(),
      barrio: els.lugarBarrio.value.trim(),
      referencia: els.lugarReferencia.value.trim(),
      latitud: Number(els.lugarLat.value),
      longitud: Number(els.lugarLng.value)
    };
    await postJson("/api/estudiante/ubicaciones", payload);
    els.modalLugarFrecuente?.classList.add("hidden");
    els.formGuardarLugar.reset();
    await cargarUbicacionesEstudiante();
    await cargarEstado(false);
    showToast(`${payload.etiqueta} guardado correctamente`, "success");
  } catch (err) {
    showToast(err.message, "error");
  }
});

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.useOrigin) {
    els.selectOrigen.value = btn.dataset.useOrigin;
    switchTab("viajar");
    actualizarRutaDesdeSectores();
  } else if (btn.dataset.useDest) {
    els.selectDestino.value = btn.dataset.useDest;
    switchTab("viajar");
    actualizarRutaDesdeSectores();
  } else if (btn.dataset.deleteLugar) {
    try {
      const res = await fetch(
        `/api/estudiante/ubicaciones?id=${encodeURIComponent(btn.dataset.deleteLugar)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        await cargarUbicacionesEstudiante();
        await cargarEstado(false);
        showToast("Ubicación eliminada", "info");
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  }
});

// --- PERFIL ---
function pintarPerfilEnVista(perfil) {
  if (!perfil) return;
  state.perfilActual = perfil;

  if (els.perfilCardAvatar) els.perfilCardAvatar.textContent = iniciales(perfil.nombre);
  if (els.perfilCardRol) {
    els.perfilCardRol.textContent =
      perfil.rol === "admin" ? "ADMINISTRADOR" : perfil.rol === "motorista" ? "TUCÁN VERIFICADO" : "ESTUDIANTE";
  }
  if (els.perfilCardNombre) els.perfilCardNombre.textContent = perfil.nombre || "Usuario TucanGo";
  if (els.perfilCardDetalle) els.perfilCardDetalle.textContent = perfil.detalle || "Uniamazonia · Florencia";
  if (els.perfilCardId) els.perfilCardId.textContent = `ID: ${perfil.identificacion}`;

  const stats = perfil.estadisticas || {};
  if (perfil.rol === "admin") {
    // El administrador no tiene viajes ni calificaciones personales.
    if (els.perfilStatViajes) els.perfilStatViajes.textContent = "—";
    if (els.perfilStatRating) els.perfilStatRating.textContent = "—";
    if (els.perfilStatMoneyLabel) els.perfilStatMoneyLabel.textContent = "Operación";
    if (els.perfilStatAhorro) els.perfilStatAhorro.textContent = "Panel admin";
  } else {
    if (els.perfilStatViajes) els.perfilStatViajes.textContent = String(stats.totalViajesUsuario ?? 0);
    if (els.perfilStatRating) {
      els.perfilStatRating.textContent = `${Number(stats.calificacionPromedio ?? 0).toFixed(1)} ★`;
    }
    if (els.perfilStatMoneyLabel) {
      els.perfilStatMoneyLabel.textContent = perfil.rol === "motorista" ? "Ganancias" : "Gasto Total";
    }
    if (els.perfilStatAhorro) {
      els.perfilStatAhorro.textContent = formatoCop(stats.gastoTotalCop ?? stats.gastoOAhorroCop ?? 0);
    }
  }

  if (els.perfilInputId) els.perfilInputId.value = perfil.identificacion || "";
  if (els.perfilInputNombre) els.perfilInputNombre.value = perfil.nombre || "";
  if (els.perfilInputTelefono) els.perfilInputTelefono.value = perfil.telefono || "";
  if (els.perfilInputCorreo) els.perfilInputCorreo.value = perfil.correo || "";
  if (els.perfilInputSos) els.perfilInputSos.value = perfil.contactoEmergencia || "";
  if (els.perfilSelectSedeFav) els.perfilSelectSedeFav.value = perfil.sedeFavorita || "PORVENIR";

  const esPasajero = perfil.rol === "pasajero";
  const esMotorista = perfil.rol === "motorista";
  els.perfilFieldsEstudiante?.classList.toggle("hidden", !esPasajero);
  els.perfilUbicacionesCard?.classList.toggle("hidden", !esPasajero);
  els.perfilFieldsMotorista?.classList.toggle("hidden", !esMotorista);

  if (esPasajero) {
    if (els.perfilInputCodigo) els.perfilInputCodigo.value = perfil.codigoEstudiantil || "";
    if (els.perfilInputCarrera) els.perfilInputCarrera.value = perfil.carrera || "";
    if (els.perfilInputBarrio) els.perfilInputBarrio.value = perfil.barrioResidencia || "";
    if (Array.isArray(perfil.ubicacionesFrecuentes)) {
      state.ubicacionesGuardadas = perfil.ubicacionesFrecuentes;
      renderUbicacionesGuardadas();
    }
  }
  if (esMotorista && perfil.moto) {
    if (els.perfilInputPlaca) els.perfilInputPlaca.value = perfil.moto.placa || "";
    if (els.perfilInputMarca) els.perfilInputMarca.value = perfil.moto.marca || "";
    if (els.perfilInputModelo) els.perfilInputModelo.value = perfil.moto.modelo || "";
    if (els.perfilInputCc) els.perfilInputCc.value = String(perfil.moto.cilindraje || 125);
    if (els.perfilInputSoat) els.perfilInputSoat.value = perfil.moto.numeroSoat || "";
  }
}

async function cargarPerfilUsuario() {
  try {
    const res = await fetch("/api/auth/perfil", { credentials: "same-origin", cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    if (data?.perfil) {
      pintarPerfilEnVista(data.perfil);
    }
  } catch {
    // Silencioso
  }
}

els.formPerfilUsuario?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const rol = state.perfilActual?.rol || state.authUser?.rol || "pasajero";
  const payload = {
    nombre: els.perfilInputNombre?.value.trim(),
    telefono: els.perfilInputTelefono?.value.trim(),
    correoInstitucional: els.perfilInputCorreo?.value.trim(),
    contactoEmergencia: els.perfilInputSos?.value.trim() || "",
    sedeFavorita: els.perfilSelectSedeFav?.value || "PORVENIR"
  };

  if (rol === "pasajero") {
    payload.codigoEstudiantil = els.perfilInputCodigo?.value.trim();
    payload.carrera = els.perfilInputCarrera?.value.trim();
    payload.barrioResidencia = els.perfilInputBarrio?.value.trim();
  } else if (rol === "motorista") {
    payload.placa = els.perfilInputPlaca?.value.trim();
    payload.marca = els.perfilInputMarca?.value.trim();
    payload.modelo = els.perfilInputModelo?.value.trim();
    payload.cilindraje = Number(els.perfilInputCc?.value || 125);
    payload.numeroSoat = els.perfilInputSoat?.value.trim();
  }

  const passActual = els.perfilInputPassActual?.value || "";
  const passNueva = els.perfilInputPassNueva?.value || "";
  if (passActual || passNueva) {
    if (!passActual || !passNueva) {
      showToast("Para cambiar la contraseña debes ingresar la actual y la nueva.", "error");
      return;
    }
    payload.passwordActual = passActual;
    payload.passwordNueva = passNueva;
  }

  try {
    if (els.btnGuardarPerfil) els.btnGuardarPerfil.disabled = true;
    const res = await postJson("/api/auth/perfil", payload);
    if (res?.perfil) {
      pintarPerfilEnVista(res.perfil);
      if (state.authUser) {
        state.authUser.nombre = res.perfil.nombre;
        state.authUser.correo = res.perfil.correo;
        state.authUser.telefono = res.perfil.telefono;
        state.authUser.detalle = res.perfil.detalle;
      }
      if (els.perfilInputPassActual) els.perfilInputPassActual.value = "";
      if (els.perfilInputPassNueva) els.perfilInputPassNueva.value = "";
    }
    await cargarEstado(false);
    actualizarBannerSesion();
    showToast("Perfil actualizado correctamente", "success");
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    if (els.btnGuardarPerfil) els.btnGuardarPerfil.disabled = false;
  }
});

document.querySelectorAll('input[name="tarifa"]').forEach((radio) => {
  radio.addEventListener("change", actualizarPreviewTarifa);
});

els.formSolicitar?.addEventListener("submit", async (e) => {
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
      origenId: els.selectOrigen.value,
      destinoId: els.selectDestino.value,
      tipoTarifa,
      metodoPago
    });
    showToast(`Solicitud ${res.codigo} enviada · PIN ${res.pinSeguridad}`, "success");
    await cargarEstado(false);
  } catch (err) {
    showToast(err.message, "error");
  }
});

els.btnToggleDisponibilidad?.addEventListener("click", async () => {
  const mot = state.data?.motoristas.find((m) => m.identificacion === els.selectMotorista.value);
  if (!mot) return;
  try {
    const res = await postJson("/api/motoristas/disponibilidad", {
      motoristaId: mot.identificacion,
      disponible: !mot.disponible
    });
    showToast(
      res.disponible ? "En línea recibiendo solicitudes" : "Desconectado",
      "success"
    );
    await cargarEstado(false);
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
      showToast(`Solicitud ${target.dataset.aceptarViaje} aceptada. Pide el PIN al estudiante.`, "success");
      await cargarEstado(false);
    } else if (target.dataset.iniciarViaje) {
      const pin = pedirPinViaje();
      if (!pin) return;
      await postJson("/api/viajes/iniciar", {
        codigoViaje: target.dataset.iniciarViaje,
        pinSeguridad: pin
      });
      showToast(`Trayecto ${target.dataset.iniciarViaje} iniciado`, "success");
      await cargarEstado(false);
    } else if (target.dataset.finalizarViaje) {
      await postJson("/api/viajes/finalizar", { codigoViaje: target.dataset.finalizarViaje });
      showToast(`Trayecto ${target.dataset.finalizarViaje} finalizado`, "success");
      await cargarEstado(false);
    } else if (target.dataset.llegadaSegura) {
      await postJson("/api/viajes/llegada-segura", { codigoViaje: target.dataset.llegadaSegura });
      showToast(`Llegada segura verificada para ${target.dataset.llegadaSegura}`, "success");
      await cargarEstado(false);
    } else if (target.dataset.cancelarViaje) {
      await postJson("/api/viajes/cancelar", {
        codigoViaje: target.dataset.cancelarViaje,
        motivo: "Cancelado por el usuario"
      });
      showToast(`Solicitud ${target.dataset.cancelarViaje} cancelada`);
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

function pedirPinViaje() {
  const input = els.inputPinViaje;
  const valorInput = (input?.value || "").trim();
  if (/^\d{4}$/.test(valorInput)) return valorInput;

  const respuesta = window.prompt("Ingresa el PIN de 4 dígitos que te dio el estudiante:");
  const pin = (respuesta || "").trim();
  if (!/^\d{4}$/.test(pin)) {
    showToast("El PIN debe tener 4 dígitos.", "error");
    return "";
  }
  if (input) input.value = pin;
  return pin;
}

els.btnIniciarViaje?.addEventListener("click", async () => {
  const codigo = els.driverActiveBox.dataset.codigo;
  if (!codigo) return;
  const pin = pedirPinViaje();
  if (!pin) return;
  try {
    await postJson("/api/viajes/iniciar", { codigoViaje: codigo, pinSeguridad: pin });
    showToast(`Trayecto ${codigo} en curso`, "success");
    await cargarEstado(false);
  } catch (err) {
    showToast(err.message, "error");
  }
});

els.btnFinalizarViaje?.addEventListener("click", async () => {
  const codigo = els.driverActiveBox.dataset.codigo;
  if (!codigo) return;
  try {
    await postJson("/api/viajes/finalizar", { codigoViaje: codigo });
    showToast(`Trayecto ${codigo} finalizado`, "success");
    await cargarEstado(false);
  } catch (err) {
    showToast(err.message, "error");
  }
});

// --- MODAL CALIFICACIÓN ---
els.btnCerrarCalificar?.addEventListener("click", () => els.modalCalificar.classList.add("hidden"));

els.stars.forEach((star) => {
  star.addEventListener("click", () => {
    const val = parseInt(star.dataset.value, 10);
    els.inputPuntuacion.value = String(val);
    els.stars.forEach((s) => {
      s.classList.toggle("active", parseInt(s.dataset.value, 10) <= val);
    });
  });
});

els.formCalificar?.addEventListener("submit", async (e) => {
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

// --- AUDITORÍA Y APROBACIÓN DE TUCANES (ADMIN) ---
els.btnAbrirAuditoria?.addEventListener("click", () => {
  els.modalAuditoriaTucanes?.classList.remove("hidden");
});

els.btnCerrarAuditoria?.addEventListener("click", () => {
  els.modalAuditoriaTucanes?.classList.add("hidden");
});

document.querySelectorAll("[data-audit-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    const mode = tab.dataset.auditTab;
    document.querySelectorAll("[data-audit-tab]").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    els.auditPanelPendientes?.classList.toggle("hidden", mode !== "pendientes");
    els.auditPanelExpedientes?.classList.toggle("hidden", mode !== "expedientes");
    els.auditPanelCorreos?.classList.toggle("hidden", mode !== "correos");
  });
});

document.addEventListener("click", async (e) => {
  const btnAprobar = e.target.closest("[data-aprobar-tucan]");
  const btnRechazar = e.target.closest("[data-rechazar-tucan]");

  if (btnAprobar) {
    const id = btnAprobar.dataset.aprobarTucan;
    btnAprobar.disabled = true;
    try {
      const res = await postJson("/api/admin/tucanes/aprobar", { identificacion: id });
      showToast(res.mensaje || "Tucán aprobado y bienvenida enviada", "success");
      await cargarEstado(false);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      btnAprobar.disabled = false;
    }
  } else if (btnRechazar) {
    const id = btnRechazar.dataset.rechazarTucan;
    const motivo =
      window.prompt("Motivo del rechazo (opcional):", "SOAT vencido o foto ilegible") ||
      "Documentación no conforme";
    btnRechazar.disabled = true;
    try {
      const res = await postJson("/api/admin/tucanes/rechazar", { identificacion: id, motivo });
      showToast(res.mensaje || "Solicitud rechazada", "info");
      await cargarEstado(false);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      btnRechazar.disabled = false;
    }
  }
});

async function iniciarAppAutenticada() {
  try {
    const res = await fetch("/api/auth/me", { credentials: "same-origin" });
    if (!res.ok) {
      window.location.replace("/login");
      return;
    }
    const data = await res.json();
    if (!data.autenticado || !data.usuario) {
      window.location.replace("/login");
      return;
    }
    state.authUser = data.usuario;
    setRole(data.usuario.rol === "motorista" ? "motorista" : "pasajero");
    conectarSse();
    if (data.usuario.rol === "admin") {
      // Precargar Google Maps en paralelo sin inicializar mapa oculto hasta abrir "Ver Mapa"
      cargarConfigMapa();
      await cargarEstado(false);
    } else {
      await cargarConfigMapa();
      await cargarUbicacionesEstudiante();
      await cargarEstado(true);
    }
  } catch {
    window.location.replace("/login");
  }
}

if (els.roleLockedBadge) {
  els.roleLockedBadge.addEventListener("click", async () => {
    if (state.authUser?.rol !== "admin") return;
    await abrirMapaAdmin();
    document.getElementById("btn-abrir-auditoria")?.click();
    showToast("Panel de administración", "info");
  });
}

// --- INIT ---
iniciarAppAutenticada();
