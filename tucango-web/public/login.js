const portalState = {
  rolLogin: "pasajero",
  regTipo: "estudiante",
  theme: "cream",
  scrollProgress: 0,
  targetProgress: 0,
  flowFrames: [],
  flowEnabled: false,
  corridorImg: null
};

const els = {
  html: document.documentElement,
  storyStage: document.getElementById("scroll-story-stage"),
  canvas: document.getElementById("flow-scroll-canvas"),
  heroCard: document.getElementById("story-hero-card"),
  chapterBadge: document.getElementById("story-chapter-badge"),
  headline: document.getElementById("story-headline"),
  copy: document.getElementById("story-copy"),
  progressFill: document.getElementById("story-progress-fill"),
  scrollPct: document.getElementById("story-scroll-pct"),
  engineTag: document.getElementById("story-engine-tag"),
  btnSkipScroll: document.getElementById("btn-skip-scroll"),
  authSection: document.getElementById("auth-portal-section"),
  activeSessionBox: document.getElementById("portal-active-session"),
  authViewsBox: document.getElementById("portal-auth-views"),
  activeInitials: document.getElementById("active-user-initials"),
  activeName: document.getElementById("active-user-name"),
  activeDetail: document.getElementById("active-user-detail"),
  btnLogout: document.getElementById("btn-logout-portal"),
  modeTabs: document.querySelectorAll("[data-portal-mode]"),
  viewLogin: document.getElementById("view-portal-login"),
  viewRegister: document.getElementById("view-portal-register"),
  roleChips: document.querySelectorAll("[data-login-role]"),
  idLabel: document.getElementById("portal-id-label"),
  inputIdentificador: document.getElementById("portal-identificador"),
  loginFeedback: document.getElementById("portal-login-feedback"),
  loginForm: document.getElementById("portal-login-form"),
  quickButtons: document.querySelectorAll("[data-quick-id]"),
  regTypeBtns: document.querySelectorAll("[data-reg-type]"),
  regEstForm: document.getElementById("portal-reg-est-form"),
  regMotForm: document.getElementById("portal-reg-mot-form"),
  btnGoRegister: document.getElementById("btn-go-register"),
  btnThemeToggle: document.getElementById("btn-theme-toggle"),
  iconMoon: document.getElementById("icon-moon"),
  iconSun: document.getElementById("icon-sun"),
  toast: document.getElementById("portal-toast")
};

function showToast(mensaje, esError = false) {
  els.toast.textContent = mensaje;
  els.toast.classList.toggle("error", esError);
  els.toast.classList.remove("hidden");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => els.toast.classList.add("hidden"), 3400);
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

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "No se pudo completar la operación");
  }
  return data;
}

function setPortalMode(mode) {
  const isLogin = mode === "login";
  els.modeTabs.forEach((btn) => {
    const active = btn.dataset.portalMode === mode;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", String(active));
  });
  els.viewLogin.classList.toggle("hidden", !isLogin);
  els.viewRegister.classList.toggle("hidden", isLogin);
}

function setLoginRole(rol) {
  portalState.rolLogin = rol;
  els.roleChips.forEach((b) => b.classList.toggle("active", b.dataset.loginRole === rol));
  if (rol === "motorista") {
    els.idLabel.textContent = "Cédula, correo institucional o placa de motocicleta";
    els.inputIdentificador.placeholder = "Ej. 2001 o GNX-45F";
  } else {
    els.idLabel.textContent = "Cédula, código estudiantil o correo institucional";
    els.inputIdentificador.placeholder = "Ej. 1001 o c.rivera@uniamazonia.edu.co";
  }
}

function setTheme(theme) {
  portalState.theme = theme;
  els.html.setAttribute("data-theme", theme);
  const esNoche = theme === "forest-night";
  els.btnThemeToggle.setAttribute("aria-pressed", String(esNoche));
  els.btnThemeToggle.setAttribute(
    "aria-label",
    esNoche ? "Cambiar a modo crema clásico" : "Cambiar a modo noche bosque"
  );
  els.iconMoon.classList.toggle("hidden", esNoche);
  els.iconSun.classList.toggle("hidden", !esNoche);
}

// --- MOTOR WEB-SCROLL 60 FPS (GOOGLE FLOW FRAMES O CANVAS + PARALLAX) ---
async function cargarAssetsScroll() {
  const corridor = new Image();
  corridor.src = "/assets/portal/tucango-corridor-depth.png?v=2.4";
  corridor.onload = () => {
    portalState.corridorImg = corridor;
  };

  try {
    const res = await fetch("/assets/flow-frames/manifest.json");
    if (!res.ok) return;
    const manifest = await res.json();
    if (!manifest.enabled || !manifest.frameCount) return;

    const frames = [];
    for (let i = 1; i <= manifest.frameCount; i++) {
      const idx = String(i).padStart(manifest.padLength || 3, "0");
      const img = new Image();
      img.src = manifest.pattern.replace("{index}", idx);
      frames.push(img);
    }
    portalState.flowFrames = frames;
    portalState.flowEnabled = true;
    els.engineTag.textContent = `GOOGLE FLOW · ${manifest.frameCount}F`;
  } catch {
    // Mantiene Canvas interactivo nativo 60 FPS
  }
}

function actualizarHudCapitulo(p) {
  const pct = Math.round(p * 100);
  els.progressFill.style.width = `${Math.max(8, pct)}%`;
  els.scrollPct.textContent = `SCROLL ${pct}%`;

  if (p < 0.35) {
    els.chapterBadge.textContent = "01 / IDENTIDAD UNIAMAZONIA";
    els.headline.textContent = "Movilidad estudiantil con trazabilidad real";
    els.copy.textContent =
      "Conecta Campus Porvenir, Sede Centro y Granja Balcanes con verificación institucional.";
  } else if (p < 0.72) {
    els.chapterBadge.textContent = "02 / PROTOCOLO SOAT + PIN";
    els.headline.textContent = "Cada motocicleta validada antes de rodar";
    els.copy.textContent =
      "Control de póliza SOAT, placa visible y código PIN de 4 dígitos al abordar en portería.";
  } else {
    els.chapterBadge.textContent = "03 / NOUS-STYLE PORTAL";
    els.headline.textContent = "Autenticación directa y segura";
    els.copy.textContent =
      "Ingresa con tu cédula, código o placa y pasa al mapa DiDi Moto en vivo.";
  }

  if (els.heroCard) {
    const lift = Math.round(p * -26);
    const scale = 1 - p * 0.06;
    els.heroCard.style.transform = `translateX(-50%) translateY(${lift}px) scale(${scale.toFixed(3)})`;
    els.heroCard.style.opacity = String(Math.max(0.2, 1 - p * 0.75));
  }
}

function puntoEnBezierCubica(t, p0, p1, p2, p3) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
  };
}

function renderCanvasFrame() {
  const canvas = els.canvas;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  const isDark = portalState.theme === "forest-night";
  const bg = isDark ? "#0D241A" : "#EEE2CB";
  const lineStroke = isDark ? "rgba(190, 212, 202, 0.22)" : "rgba(27, 69, 50, 0.18)";
  const routeStroke = isDark ? "#BED4CA" : "#1B4532";
  const accent = "#EE4129";
  const p = portalState.scrollProgress;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  if (portalState.flowEnabled && portalState.flowFrames.length > 0) {
    const idx = Math.min(
      portalState.flowFrames.length - 1,
      Math.floor(p * (portalState.flowFrames.length - 1))
    );
    const frame = portalState.flowFrames[idx];
    if (frame && frame.complete && frame.naturalWidth > 0) {
      const scale = Math.max(w / frame.naturalWidth, h / frame.naturalHeight);
      const dw = frame.naturalWidth * scale;
      const dh = frame.naturalHeight * scale;
      ctx.drawImage(frame, (w - dw) / 2, (h - dh) / 2, dw, dh);
      ctx.restore();
      return;
    }
  }

  // Capa de profundidad topográfica generada
  if (portalState.corridorImg && portalState.corridorImg.complete) {
    ctx.save();
    ctx.globalAlpha = isDark ? 0.16 : 0.34;
    const zoom = 1 + p * 0.1;
    const iw = portalState.corridorImg.naturalWidth || 1280;
    const ih = portalState.corridorImg.naturalHeight || 720;
    const scale = Math.max(w / iw, h / ih) * zoom;
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(portalState.corridorImg, (w - dw) / 2, (h - dh) / 2 - p * 30, dw, dh);
    ctx.restore();
  }

  // Ondas topográficas Caquetá sincronizadas al scroll
  ctx.strokeStyle = lineStroke;
  ctx.lineWidth = 1.25;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    const baseY = h * (0.22 + i * 0.12) - p * (14 + i * 6);
    for (let x = 0; x <= w; x += 28) {
      const y = baseY + Math.sin(x * 0.008 + i * 0.9 + p * 4.5) * (14 + i * 2);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Corredor animado Porvenir -> Centro -> Balcanes
  const p0 = { x: w * 0.12, y: h * 0.72 };
  const p1 = { x: w * 0.36, y: h * 0.44 };
  const p2 = { x: w * 0.64, y: h * 0.80 };
  const p3 = { x: w * 0.88, y: h * 0.56 };

  ctx.save();
  ctx.strokeStyle = lineStroke;
  ctx.setLineDash([6, 8]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  ctx.stroke();
  ctx.restore();

  // Tramo progresivo recorrido en Forest Fir
  const pasos = 48;
  const maxPaso = Math.max(1, Math.floor((0.06 + p * 0.94) * pasos));
  ctx.save();
  ctx.strokeStyle = routeStroke;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let k = 0; k <= maxPaso; k++) {
    const pt = puntoEnBezierCubica(k / pasos, p0, p1, p2, p3);
    if (k === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();

  // Puntos de parada Porvenir y Centro + marcador móvil Tomato Red
  const actual = puntoEnBezierCubica(Math.min(1, 0.06 + p * 0.94), p0, p1, p2, p3);
  ctx.fillStyle = routeStroke;
  ctx.beginPath();
  ctx.arc(p0.x, p0.y, 6, 0, Math.PI * 2);
  ctx.arc(p3.x, p3.y, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(238, 65, 41, 0.24)";
  ctx.beginPath();
  ctx.arc(actual.x, actual.y, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(actual.x, actual.y, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function tickAnimacion() {
  const diff = portalState.targetProgress - portalState.scrollProgress;
  if (Math.abs(diff) > 0.0005) {
    portalState.scrollProgress += diff * 0.16;
  } else {
    portalState.scrollProgress = portalState.targetProgress;
  }
  actualizarHudCapitulo(portalState.scrollProgress);
  renderCanvasFrame();
  window.requestAnimationFrame(tickAnimacion);
}

function actualizarObjetivoScroll() {
  if (!els.storyStage) return;
  const maxScroll = Math.max(1, els.storyStage.offsetHeight - window.innerHeight * 0.85);
  const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
  portalState.targetProgress = progress;
}

// --- AUTENTICACIÓN Y COOKIE HTTPONLY ---
async function verificarSesionActual() {
  try {
    const res = await fetch("/api/auth/me");
    if (!res.ok) return;
    const data = await res.json();
    if (data.autenticado && data.usuario) {
      els.activeInitials.textContent = iniciales(data.usuario.nombre);
      els.activeName.textContent = data.usuario.nombre;
      els.activeDetail.textContent = `${data.usuario.rol.toUpperCase()} · ${data.usuario.detalle}`;
      els.activeSessionBox.classList.remove("hidden");
      els.authViewsBox.classList.add("hidden");
    } else {
      els.activeSessionBox.classList.add("hidden");
      els.authViewsBox.classList.remove("hidden");
    }
  } catch {
    // Fallback al formulario visible
  }
}

async function ejecutarLogin(identificador, rol) {
  const sesion = await postJson("/api/auth/login", { identificador, rol });
  showToast(`Bienvenido ${sesion.nombre} · Redirigiendo al mapa...`);
  setTimeout(() => {
    window.location.href = "/";
  }, 450);
}

// --- LISTENERS ---
window.addEventListener("scroll", actualizarObjetivoScroll, { passive: true });
window.addEventListener("resize", actualizarObjetivoScroll);

els.btnSkipScroll.addEventListener("click", () => {
  els.authSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

els.modeTabs.forEach((tab) => {
  tab.addEventListener("click", () => setPortalMode(tab.dataset.portalMode));
});

els.btnGoRegister.addEventListener("click", () => setPortalMode("register"));

els.roleChips.forEach((chip) => {
  chip.addEventListener("click", () => setLoginRole(chip.dataset.loginRole));
});

els.regTypeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const esEst = btn.dataset.regType === "estudiante";
    portalState.regTipo = btn.dataset.regType;
    els.regTypeBtns.forEach((b) => b.classList.toggle("active", b === btn));
    els.regEstForm.classList.toggle("hidden", !esEst);
    els.regMotForm.classList.toggle("hidden", esEst);
  });
});

els.loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  els.loginFeedback.textContent = "";
  try {
    await ejecutarLogin(els.inputIdentificador.value, portalState.rolLogin);
  } catch (err) {
    els.loginFeedback.textContent = err.message;
    showToast(err.message, true);
  }
});

els.quickButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    try {
      await ejecutarLogin(btn.dataset.quickId, btn.dataset.quickRole);
    } catch (err) {
      showToast(err.message, true);
    }
  });
});

els.regEstForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const res = await postJson("/api/estudiantes", {
      identificacion: document.getElementById("p-est-id").value,
      codigoEstudiantil: document.getElementById("p-est-cod").value,
      nombre: document.getElementById("p-est-nombre").value,
      telefono: document.getElementById("p-est-tel").value,
      correoInstitucional: document.getElementById("p-est-correo").value,
      carrera: document.getElementById("p-est-carrera").value
    });
    await ejecutarLogin(res.identificacion, "pasajero");
  } catch (err) {
    showToast(err.message, true);
  }
});

els.regMotForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const res = await postJson("/api/motoristas", {
      identificacion: document.getElementById("p-mot-id").value,
      telefono: document.getElementById("p-mot-tel").value,
      nombre: document.getElementById("p-mot-nombre").value,
      correoInstitucional: document.getElementById("p-mot-correo").value,
      placa: document.getElementById("p-mot-placa").value,
      marca: document.getElementById("p-mot-marca").value,
      cilindraje: Number(document.getElementById("p-mot-cc").value),
      modelo: document.getElementById("p-mot-modelo").value,
      numeroSoat: document.getElementById("p-mot-soat").value,
      soatVigente: document.getElementById("p-mot-soat-ok").checked
    });
    await ejecutarLogin(res.identificacion, "motorista");
  } catch (err) {
    showToast(err.message, true);
  }
});

els.btnLogout.addEventListener("click", async () => {
  try {
    await postJson("/api/auth/logout", {});
    showToast("Sesión cerrada correctamente");
    await verificarSesionActual();
  } catch (err) {
    showToast(err.message, true);
  }
});

els.btnThemeToggle.addEventListener("click", () => {
  setTheme(portalState.theme === "cream" ? "forest-night" : "cream");
});

// --- INIT ---
cargarAssetsScroll();
verificarSesionActual();
actualizarObjetivoScroll();
window.requestAnimationFrame(tickAnimacion);
