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
  mapEngine: "leaflet",
  gmapsLoaded: false,
  mapConfig: null,
  trafficLayer: null,
  trafficEnabled: false,
  geocoder: null,
  infoWindow: null,
  markers: new Map(),
  savedPlaceMarkers: new Map(),
  userGpsMarker: null,
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
  trackingProgressPct: document.getElementById("tracking-progress-pct"),
  trackingEtaLive: document.getElementById("tracking-eta-live"),
  trackingRadarStage: document.getElementById("tracking-radar-stage"),
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
  listaCorreosAuditoria: document.getElementById("lista-correos-auditoria"),
  tabCountPendientes: document.getElementById("tab-count-pendientes"),
  tabCountCorreos: document.getElementById("tab-count-correos"),
  auditPanelPendientes: document.getElementById("audit-panel-pendientes"),
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
    tabMotoristaDesktop.classList.toggle("hidden", !esAdmin && esPasajero);
  }
  const tabMotoristaMobile = document.querySelector('[data-mobile-tab="motorista"]');
  if (tabMotoristaMobile) {
    tabMotoristaMobile.classList.toggle("hidden", !esAdmin && esPasajero);
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
  try {
    const res = await fetch("/api/mapa/config");
    if (!res.ok) return;
    state.mapConfig = await res.json();
    const esGoogle =
      state.mapConfig.proveedorActivo === "google_maps" &&
      Boolean(state.mapConfig.googleMapsApiKey);

    if (esGoogle) {
      const ok = await cargarScriptGoogleMaps(state.mapConfig.googleMapsApiKey);
      state.mapEngine = ok ? "google" : "leaflet";
    } else {
      state.mapEngine = "leaflet";
    }
  } catch {
    state.mapEngine = "leaflet";
  }
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
      console.warn("Google Maps API fallback activado");
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

    setTimeout(() => finish(Boolean(window.google && window.google.maps)), 6500);
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

  // Fallback pasivo Leaflet si el entorno no cuenta con Google Maps API Key
  if (typeof window.L === "undefined") return;
  const bounds = window.L.latLngBounds(FLORENCIA_BOUNDS_COORDS[0], FLORENCIA_BOUNDS_COORDS[1]);
  state.florenciaBounds = bounds;
  const map = window.L.map("campus-map", {
    zoomControl: true,
    minZoom: 12,
    maxZoom: 19,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0
  }).setView(FLORENCIA_CENTRO, 15);
  map.setMaxBounds(bounds);

  const tileUrl = state.mapConfig?.tileUrlDidi || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  window.L.tileLayer(tileUrl, {
    minZoom: 12,
    maxZoom: 19,
    bounds,
    attribution: "&copy; OpenStreetMap · Florencia"
  }).addTo(map);

  map.on("click", (ev) => {
    if (!state.pickingMapPlace || !ev?.latlng) return;
    completarPuntoSeleccionadoEnMapa(
      Number(ev.latlng.lat.toFixed(6)),
      Number(ev.latlng.lng.toFixed(6))
    );
  });

  for (const sec of sedesMapa) {
    const marker = window.L.marker([sec.latitud, sec.longitud]).addTo(map);
    marker.bindPopup(`<strong>${esc(sec.nombre)}</strong><br/><small>${esc(sec.referencia || "")}</small>`);
    marker.on("click", () => seleccionarSectorEnMapa(sec.id));
    state.markers.set(sec.id, marker);
  }

  state.map = map;
  if (sedesMapa.length > 0) {
    map.fitBounds(window.L.latLngBounds(sedesMapa.map((s) => [s.latitud, s.longitud])), {
      padding: [48, 48],
      maxZoom: 15
    });
  }
  setTimeout(() => state.map && state.map.invalidateSize(), 250);
  iniciarGeolocalizacionTiempoReal();
}

async function reverseGeocodeSiAplica(lat, lng) {
  if (!state.geocoder) return null;
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
  if (!state.map) return;
  const esGoogle = state.mapEngine === "google" && window.google?.maps;
  if (!esGoogle && typeof window.L === "undefined") return;

  // Marcadores de lugares guardados por el estudiante (Casa, Trabajo, etc.)
  for (const mk of state.savedPlaceMarkers.values()) {
    if (typeof mk.setMap === "function") mk.setMap(null);
    else if (typeof mk.remove === "function") mk.remove();
  }
  state.savedPlaceMarkers.clear();

  if (state.role === "pasajero") {
    const AdvancedMarker = window.google?.maps?.marker?.AdvancedMarkerElement;
    const PinElement = window.google?.maps?.marker?.PinElement;
    for (const u of state.ubicacionesGuardadas || []) {
      if (esGoogle) {
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
      } else {
        const lm = window.L.marker([u.latitud, u.longitud]).addTo(state.map);
        lm.bindPopup(`<strong>${esc(u.etiqueta)}: ${esc(u.nombre)}</strong>`);
        lm.on("click", () => seleccionarSectorEnMapa(u.id));
        state.savedPlaceMarkers.set(u.id, lm);
      }
    }
  }

  // Marcador nativo azul de GPS real del usuario (sin marcadores de motoristas cercanos por ahora)
  if (state.realGps && typeof state.realGps.latitud === "number" && typeof state.realGps.longitud === "number") {
    const gpsLat = state.realGps.latitud;
    const gpsLng = state.realGps.longitud;

    if (esGoogle) {
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
    } else {
      if (!state.userGpsMarker) {
        state.userGpsMarker = window.L.circleMarker([gpsLat, gpsLng], {
          radius: 7,
          color: "#FFFFFF",
          weight: 2.5,
          fillColor: "#2563EB",
          fillOpacity: 1
        }).addTo(state.map);
      } else if (typeof state.userGpsMarker.setLatLng === "function") {
        state.userGpsMarker.setLatLng([gpsLat, gpsLng]);
      }
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
  const esGoogle = state.mapEngine === "google" && window.google?.maps;
  if (!esGoogle && typeof window.L === "undefined") return;

  if (state.routeLine) {
    if (typeof state.routeLine.setMap === "function") state.routeLine.setMap(null);
    else if (typeof state.routeLine.remove === "function") state.routeLine.remove();
    state.routeLine = null;
  }
  if (state.routeLineCasing) {
    if (typeof state.routeLineCasing.setMap === "function") state.routeLineCasing.setMap(null);
    state.routeLineCasing = null;
  }
  if (!puntos || puntos.length === 0) return;

  const latLngs = puntos.map((p) => (Array.isArray(p) ? p : [p.latitud, p.longitud]));

  if (esGoogle) {
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
    return;
  }

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
  } else if (ajustarEncuadre) {
    if (state.mapEngine === "google" && typeof state.map.fitBoundsCompat === "function") {
      state.map.fitBoundsCompat(FLORENCIA_BOUNDS_COORDS, 15);
    } else if (state.florenciaBounds && typeof state.map.fitBounds === "function") {
      state.map.fitBounds(state.florenciaBounds, { padding: [36, 36], maxZoom: 15 });
    }
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

async function intentarRutaVial(origen, destino, key) {
  if (origen.id === destino.id) return;

  if (state.mapEngine === "google") {
    const okGoogle = await intentarGoogleRoutesApi(origen, destino, key);
    if (okGoogle) return;
  }

  if (typeof AbortController === "undefined") return;
  const baseOsrm = state.mapConfig?.osrmRouteUrl || "https://router.project-osrm.org/route/v1/driving";
  const url = `${baseOsrm}/${origen.longitud},${origen.latitud};${destino.longitud},${destino.latitud}?overview=full&geometries=geojson`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2400);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return;
    const json = await res.json();
    const route = json?.routes?.[0];
    const coords = route?.geometry?.coordinates;
    if (Array.isArray(coords) && coords.length >= 2 && state.lastRouteKey === key) {
      const polilinea = coords.map(([lng, lat]) => ({ latitud: lat, longitud: lng }));
      const distKm = route.distance ? Number(Math.max(0.5, route.distance / 1000).toFixed(2)) : state.routeKm;
      const durMin = route.duration ? Math.max(1, Math.round(route.duration / 60)) : state.routeMin;
      aplicarMetricasRutaOficial({
        distanciaKm: distKm,
        duracionMin: durMin,
        traficoTexto: "Ruta vial",
        pesado: false,
        polilinea
      });
    }
  } catch {
    // Mantiene polilínea de respaldo
  } finally {
    clearTimeout(timer);
  }
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

  if (state.geocoder) {
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
  const m = data.metricas || {};
  const rol = state.authUser?.rol === "motorista" || state.role === "motorista" ? "motorista" : "pasajero";

  if (rol === "motorista") {
    if (els.activityBannerTitle) els.activityBannerTitle.textContent = "Mi Desempeño como Tucán";
    if (els.activityBannerSub) els.activityBannerSub.textContent = "Carreras realizadas, solicitudes y aportes recibidos";
    if (els.metricLabel1) els.metricLabel1.textContent = "MIS CARRERAS";
    if (els.metricTag1) els.metricTag1.textContent = "ASIGNADAS";
    if (els.metricLabel2) els.metricLabel2.textContent = "COMPLETADAS";
    if (els.metricTag2) els.metricTag2.textContent = "FINALIZADAS";
    if (els.metricLabel3) els.metricLabel3.textContent = "EN RADAR";
    if (els.metricTag3) els.metricTag3.textContent = "PENDIENTES";
    if (els.metricLabel4) els.metricLabel4.textContent = "GANANCIAS COP";
    if (els.metricTag4) els.metricTag4.textContent = "TUCÁN";

    els.metricTotal.textContent = String(m.totalViajes ?? 0);
    els.metricFinalizados.textContent = String(m.finalizados ?? 0);
    els.metricSolicitados.textContent = String(m.solicitados ?? 0);
    els.metricIngresos.textContent = `$${Number(m.gananciasCop ?? 0).toLocaleString("es-CO")}`;
  } else {
    if (els.activityBannerTitle) els.activityBannerTitle.textContent = "Mi Historial Universitario";
    if (els.activityBannerSub) els.activityBannerSub.textContent = "Tus trayectos entre sedes y lugares guardados";
    if (els.metricLabel1) els.metricLabel1.textContent = "MIS VIAJES";
    if (els.metricTag1) els.metricTag1.textContent = "HISTÓRICO";
    if (els.metricLabel2) els.metricLabel2.textContent = "FINALIZADOS";
    if (els.metricTag2) els.metricTag2.textContent = "SEGUROS";
    if (els.metricLabel3) els.metricLabel3.textContent = "ACTIVOS";
    if (els.metricTag3) els.metricTag3.textContent = "EN CURSO";
    if (els.metricLabel4) els.metricLabel4.textContent = "GASTO TOTAL COP";
    if (els.metricTag4) els.metricTag4.textContent = "MIS APORTES";

    els.metricTotal.textContent = String(m.totalViajes ?? 0);
    els.metricFinalizados.textContent = String(m.finalizados ?? 0);
    els.metricSolicitados.textContent = String(m.solicitados ?? 0);
    els.metricIngresos.textContent = `$${Number(m.gastoTotalCop ?? 0).toLocaleString("es-CO")}`;
  }
}

function renderSeguimientoEnVivo(data) {
  if (state.role !== "pasajero") {
    els.liveTrackingCard.classList.add("hidden");
    if (els.mobileTrackingDot) els.mobileTrackingDot.classList.add("hidden");
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
    return;
  }

  els.liveTrackingCard.classList.remove("hidden");
  els.trackingPin.textContent = viajeActivo.pinSeguridad || "0000";
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

function construirHtmlTarjetasPendientes(pendientes) {
  if (pendientes.length === 0) {
    return renderEmptyState(
      "Sin solicitudes pendientes",
      "Todos los aspirantes a Tucán han sido auditados."
    );
  }
  return pendientes
    .map((t) => {
      const faceUrl =
        t.fotoRostroUrl ||
        "data:image/svg+xml;utf8," +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#EAF1ED"/><text x="40" y="48" font-size="28" text-anchor="middle" fill="#006837">${esc(inicialesNombre(t.nombre))}</text></svg>`
          );
      const motoImg = t.fotoMotoUrl
        ? `<img src="${esc(t.fotoMotoUrl)}" alt="Moto" class="audit-moto-preview" />`
        : `<div class="audit-moto-preview" style="display:grid;place-items:center;color:#555;font-size:11px;">Sin foto de moto</div>`;

      return `
        <article class="audit-tucan-card">
          <div class="audit-card-top">
            <img src="${esc(faceUrl)}" alt="Foto facial de ${esc(t.nombre)}" class="audit-face-img" />
            <div class="audit-person-info">
              <h4>${esc(t.nombre)}</h4>
              <p>C.C. ${esc(t.identificacion)} · Tel: ${esc(t.telefono)} · ${esc(t.correo)}</p>
            </div>
            <span class="chip-mono chip-ochre-soft">EN REVISIÓN</span>
          </div>
          <div class="audit-docs-grid">
            <div>
              <strong>${tgIcon("tg-moto")} Motocicleta:</strong><br/>
              <span>${esc(t.moto?.marca || "")} ${esc(t.moto?.modelo || "")} (${esc(t.moto?.cilindraje || "")}cc)</span><br/>
              <span>Placa: <strong class="mono-text">${esc(t.moto?.placa || "N/A")}</strong></span>
            </div>
            <div>
              <strong>${tgIcon("iconly-document")} Marco Legal:</strong><br/>
              <span>SOAT: <strong>${esc(t.moto?.numeroSoat || "N/A")}</strong></span><br/>
              <span>Licencia: <strong>${esc(t.fotoLicenciaUrl || "Verificada A2")}</strong></span><br/>
              <span>Compromiso Honor: <strong style="color:#006837;">${t.compromisoAceptado ? `${tgIcon("iconly-tick-square")} Aceptado` : "Pendiente"}</strong></span>
            </div>
            <div>
              ${motoImg}
            </div>
          </div>
          <div class="audit-card-actions">
            <button type="button" class="btn-rechazar-tucan" data-rechazar-tucan="${esc(t.identificacion)}">
              ${tgIcon("iconly-close-square")} Rechazar
            </button>
            <button type="button" class="btn-aprobar-tucan" data-aprobar-tucan="${esc(t.identificacion)}">
              ${tgIcon("iconly-tick-square")} Aprobar y Enviar Bienvenida
            </button>
          </div>
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
  const correos = data.notificacionesCorreo || [];

  if (els.countTucanesPendientes) els.countTucanesPendientes.textContent = String(pendientes.length);
  if (els.adminTabPendBadge) els.adminTabPendBadge.textContent = String(pendientes.length);
  if (els.tabCountPendientes) els.tabCountPendientes.textContent = String(pendientes.length);
  if (els.tabCountCorreos) els.tabCountCorreos.textContent = String(correos.length);

  const htmlPend = construirHtmlTarjetasPendientes(pendientes);
  const htmlMail = construirHtmlCorreosAuditoria(correos);

  if (els.listaTucanesPendientes) els.listaTucanesPendientes.innerHTML = htmlPend;
  if (els.listaCorreosAuditoria) els.listaCorreosAuditoria.innerHTML = htmlMail;
  if (els.adminInlinePendientes) els.adminInlinePendientes.innerHTML = htmlPend;
  if (els.adminInlineCorreos) els.adminInlineCorreos.innerHTML = htmlMail;
}

// --- DASHBOARD EJECUTIVO ADMIN (CHART.JS v4.4.8) ---
function upsertChart(canvasId, config) {
  if (typeof window.Chart === "undefined") return;
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  if (state.charts[canvasId]) {
    state.charts[canvasId].destroy();
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
    ...(a.corredoresComunes || []).map((c) => ["Corredor Comun", c.ruta, c.viajes, `${c.kmPromedio} km promedio`])
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
  initMap(data.sectores || []);
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

// --- EVENTOS UI ---
els.btnCerrarSesionApp?.addEventListener("click", cerrarSesionActual);
els.btnSesionTopbar?.addEventListener("click", () => {
  if (state.authUser?.rol === "admin") {
    state.adminShowMap = true;
    aplicarLayoutPorRol();
  }
  switchTab("perfil");
});

els.btnAdminToggleMap?.addEventListener("click", () => {
  state.adminShowMap = !state.adminShowMap;
  aplicarLayoutPorRol();
  if (state.adminShowMap) {
    setTimeout(() => pintarRutaEnMapa(true), 250);
  }
});

els.btnAdminExportCsv?.addEventListener("click", exportarCsvAdmin);

document.querySelectorAll("[data-admin-tab]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const t = btn.dataset.adminTab;
    document.querySelectorAll("[data-admin-tab]").forEach((b) => b.classList.toggle("active", b === btn));
    els.adminPanelAnalitica?.classList.toggle("hidden", t !== "analitica");
    els.adminPanelAuditoria?.classList.toggle("hidden", t !== "auditoria");
    els.adminPanelComunidad?.classList.toggle("hidden", t !== "comunidad");
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
  if (els.perfilStatViajes) els.perfilStatViajes.textContent = String(stats.totalViajesUsuario ?? 0);
  if (els.perfilStatRating) {
    els.perfilStatRating.textContent = `${Number(stats.calificacionPromedio ?? 5).toFixed(1)} ★`;
  }
  if (els.perfilStatMoneyLabel) {
    els.perfilStatMoneyLabel.textContent =
      perfil.rol === "motorista" ? "Ganancias" : perfil.rol === "admin" ? "Volumen" : "Gasto Total";
  }
  if (els.perfilStatAhorro) {
    els.perfilStatAhorro.textContent = formatoCop(stats.gastoTotalCop ?? stats.gastoOAhorroCop ?? 0);
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
      estudianteId: els.selectEstudiante.value,
      origen: origenText,
      destino: destinoText,
      distanciaKm: state.routeKm,
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
      const r = await postJson("/api/viajes/aceptar", {
        codigoViaje: target.dataset.aceptarViaje,
        motoristaId: els.selectMotorista.value
      });
      showToast(`Solicitud ${target.dataset.aceptarViaje} aceptada · PIN ${r.pinSeguridad}`, "success");
      await cargarEstado(false);
    } else if (target.dataset.iniciarViaje) {
      await postJson("/api/viajes/iniciar", { codigoViaje: target.dataset.iniciarViaje });
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
        motivo: "Cancelado por el estudiante"
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

els.btnIniciarViaje?.addEventListener("click", async () => {
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
    await cargarConfigMapa();
    await cargarUbicacionesEstudiante();
    await cargarEstado(true);
  } catch {
    window.location.replace("/login");
  }
}

if (els.roleLockedBadge) {
  els.roleLockedBadge.addEventListener("click", () => {
    if (state.authUser?.rol !== "admin") return;
    state.adminShowMap = true;
    aplicarLayoutPorRol();
    setRole(state.role === "pasajero" ? "motorista" : "pasajero");
    showToast(`Vista operativa: ${state.role.toUpperCase()}`, "info");
  });
}

// --- INIT ---
iniciarAppAutenticada();
