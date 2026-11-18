// TucanGo · Lógica de Autenticación General y Registro de Roles (Hardened v2.8)
(function () {
  "use strict";

  // F16: Cache único de elementos del DOM
  const els = {
    // Alertas y Banners
    networkBanner: document.getElementById("network-offline-banner"),
    storyReel: document.getElementById("tucango-story-reel"),
    alertSummary: document.getElementById("auth-alert-summary"),
    toast: document.getElementById("portal-toast"),

    // Sesión activa
    activeSessionBox: document.getElementById("portal-active-session"),
    activeUserName: document.getElementById("active-user-name"),
    activeUserDetail: document.getElementById("active-user-detail"),
    activeUserInitials: document.getElementById("active-user-initials"),
    btnLogout: document.getElementById("btn-logout-portal"),
    authViews: document.getElementById("portal-auth-views"),

    // Tabs
    tabBtnLogin: document.getElementById("tab-btn-login"),
    tabBtnRegister: document.getElementById("tab-btn-register"),
    viewLogin: document.getElementById("view-login"),
    viewRegister: document.getElementById("view-register"),
    linkGoRegister: document.getElementById("link-go-register"),
    linkGoLogin: document.getElementById("link-go-login"),

    // Formulario Login
    formLoginManual: document.getElementById("form-login-manual"),
    inputLoginId: document.getElementById("input-login-id"),
    inputLoginPassword: document.getElementById("input-login-password"),
    btnToggleLoginPass: document.getElementById("btn-toggle-login-pass"),
    btnLoginSubmit: document.getElementById("btn-login-submit"),

    // Registro Estudiante
    formRegEstudiante: document.getElementById("form-reg-estudiante"),
    btnRegEstSubmit: document.getElementById("btn-reg-est-submit"),
    regEstId: document.getElementById("reg-est-id"),
    regEstCod: document.getElementById("reg-est-cod"),
    regEstNombre: document.getElementById("reg-est-nombre"),
    regEstTel: document.getElementById("reg-est-tel"),
    regEstCorreo: document.getElementById("reg-est-correo"),
    regEstCarrera: document.getElementById("reg-est-carrera"),
    regEstBarrio: document.getElementById("reg-est-barrio"),
    regEstPassword: document.getElementById("reg-est-password"),
    regEstPasswordConfirm: document.getElementById("reg-est-password-confirm"),

    // Registro Tucán (Wizard 5 pasos)
    wizardTucanContainer: document.getElementById("wizard-tucan-container"),
    formWizardTucan: document.getElementById("form-wizard-tucan"),
    btnSubmitWizardTucan: document.getElementById("btn-submit-wizard-tucan"),
    regTucanId: document.getElementById("reg-tucan-id"),
    regTucanNombre: document.getElementById("reg-tucan-nombre"),
    regTucanTel: document.getElementById("reg-tucan-tel"),
    regTucanCorreo: document.getElementById("reg-tucan-correo"),
    regTucanPassword: document.getElementById("reg-tucan-password"),
    regTucanPasswordConfirm: document.getElementById("reg-tucan-password-confirm"),
    regTucanPlaca: document.getElementById("reg-tucan-placa"),
    regTucanMarca: document.getElementById("reg-tucan-marca"),
    regTucanModelo: document.getElementById("reg-tucan-modelo"),
    regTucanCc: document.getElementById("reg-tucan-cc"),
    regTucanSoat: document.getElementById("reg-tucan-soat"),
    regTucanLicencia: document.getElementById("reg-tucan-licencia"),
    regTucanCompromisoCheck: document.getElementById("reg-tucan-compromiso-check"),
    btnPendingGoLogin: document.getElementById("btn-pending-go-login"),
    pendingTucanNombre: document.getElementById("pending-tucan-nombre"),
    pendingTucanPlaca: document.getElementById("pending-tucan-placa")
  };

  let toastTimer = null;
  let wizardPhotos = {
    face: "",
    moto: ""
  };

  function mostrarToast(mensaje, tipo = "info") {
    if (!els.toast) return;
    if (toastTimer) clearTimeout(toastTimer);

    els.toast.textContent = mensaje;
    els.toast.className = `ios-toast ${tipo}`;
    els.toast.classList.remove("hidden");

    toastTimer = setTimeout(() => {
      els.toast.classList.add("hidden");
    }, 4000);
  }

  // F3: Mostrar alerta accesible inline
  function mostrarAlertaInline(mensaje, tipo = "error") {
    if (!els.alertSummary) return;
    els.alertSummary.textContent = mensaje;
    els.alertSummary.className = `auth-alert-summary ${tipo === "success" ? "success" : ""}`;
    els.alertSummary.classList.remove("hidden");
  }

  function ocultarAlertaInline() {
    if (!els.alertSummary) return;
    els.alertSummary.classList.add("hidden");
    els.alertSummary.textContent = "";
  }

  // F2: Control de estado busy del botón
  function setBotonBusy(btn, isBusy, defaultText = "Ingresar") {
    if (!btn) return;
    const spinner = btn.querySelector(".btn-spinner");
    const textSpan = btn.querySelector(".btn-text");

    if (isBusy) {
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      if (spinner) spinner.classList.remove("hidden");
      if (textSpan) textSpan.textContent = "Procesando...";
    } else {
      btn.disabled = false;
      btn.removeAttribute("aria-busy");
      if (spinner) spinner.classList.add("hidden");
      if (textSpan) textSpan.textContent = defaultText;
    }
  }

  function limpiarErroresCampos(form) {
    if (!form) return;
    const inputs = form.querySelectorAll(".ios-input-field");
    inputs.forEach((input) => {
      input.removeAttribute("aria-invalid");
    });
  }

  // F15: Títulos dinámicos según modo
  function cambiarModoAuth(modo) {
    ocultarAlertaInline();
    if (modo === "register") {
      els.tabBtnLogin.classList.remove("active");
      els.tabBtnLogin.setAttribute("aria-selected", "false");
      els.tabBtnRegister.classList.add("active");
      els.tabBtnRegister.setAttribute("aria-selected", "true");

      els.viewLogin.classList.add("hidden");
      els.viewRegister.classList.remove("hidden");
      els.storyReel?.classList.add("hidden");
      document.title = "TucanGo · Registro universitario";
    } else {
      els.tabBtnRegister.classList.remove("active");
      els.tabBtnRegister.setAttribute("aria-selected", "false");
      els.tabBtnLogin.classList.add("active");
      els.tabBtnLogin.setAttribute("aria-selected", "true");

      els.viewRegister.classList.add("hidden");
      els.viewLogin.classList.remove("hidden");
      els.storyReel?.classList.remove("hidden");
      document.title = "TucanGo · Iniciar sesión";
      els.inputLoginId?.focus();
    }
  }

  function cambiarRolRegistro(rol) {
    ocultarAlertaInline();
    const btns = document.querySelectorAll("[data-reg-role]");
    btns.forEach((btn) => {
      const activo = btn.dataset.regRole === rol;
      btn.classList.toggle("active", activo);
      btn.setAttribute("aria-checked", activo ? "true" : "false");
    });

    if (rol === "motorista") {
      els.formRegEstudiante.classList.add("hidden");
      els.wizardTucanContainer?.classList.remove("hidden");
    } else {
      els.wizardTucanContainer?.classList.add("hidden");
      els.formRegEstudiante.classList.remove("hidden");
    }
  }

  // F4: Login rápido y redirección instantánea
  async function ejecutarLogin(identificador, password) {
    ocultarAlertaInline();
    limpiarErroresCampos(els.formLoginManual);
    setBotonBusy(els.btnLoginSubmit, true, "Ingresar");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador, password })
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          const retryHeader = res.headers.get("Retry-After");
          const msg = retryHeader
            ? `Demasiados intentos. Intenta en ${retryHeader} segundos.`
            : data.error || "Demasiados intentos.";
          throw new Error(msg);
        }
        throw new Error(data.error || "Credenciales inválidas.");
      }

      // F4: Redirección inmediata a /app sin retardos artificiales
      window.location.replace("/app");
    } catch (err) {
      setBotonBusy(els.btnLoginSubmit, false, "Ingresar");
      mostrarAlertaInline(err.message, "error");
      if (els.inputLoginPassword) {
        els.inputLoginPassword.setAttribute("aria-invalid", "true");
        els.inputLoginPassword.focus();
      }
    }
  }

  async function verificarSesionActual() {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();

      if (data.autenticado && data.usuario) {
        if (els.activeSessionBox && els.authViews) {
          els.activeSessionBox.classList.remove("hidden");
          els.authViews.classList.add("hidden");

          if (els.activeUserName) els.activeUserName.textContent = data.usuario.nombre;
          if (els.activeUserDetail) els.activeUserDetail.textContent = data.usuario.detalle;
          if (els.activeUserInitials) {
            const partes = (data.usuario.nombre || "").split(" ");
            const iniciales = partes.length >= 2 ? partes[0][0] + partes[1][0] : partes[0][0] || "U";
            els.activeUserInitials.textContent = iniciales.toUpperCase();
          }
        }
      } else {
        if (els.activeSessionBox) els.activeSessionBox.classList.add("hidden");
        if (els.authViews) els.authViews.classList.remove("hidden");
      }
    } catch {
      if (els.authViews) els.authViews.classList.remove("hidden");
    }
  }

  // F14: Monitoreo de conectividad offline/online
  function inicializarConectividad() {
    function actualizarEstadoRed() {
      if (!navigator.onLine) {
        els.networkBanner?.classList.remove("hidden");
      } else {
        els.networkBanner?.classList.add("hidden");
      }
    }
    window.addEventListener("online", actualizarEstadoRed);
    window.addEventListener("offline", actualizarEstadoRed);
    actualizarEstadoRed();
  }

  function inicializarEventos() {
    if (els.tabBtnLogin) {
      els.tabBtnLogin.addEventListener("click", () => cambiarModoAuth("login"));
    }
    if (els.tabBtnRegister) {
      els.tabBtnRegister.addEventListener("click", () => cambiarModoAuth("register"));
    }
    if (els.linkGoRegister) {
      els.linkGoRegister.addEventListener("click", () => cambiarModoAuth("register"));
    }
    if (els.linkGoLogin) {
      els.linkGoLogin.addEventListener("click", () => cambiarModoAuth("login"));
    }

    // Toggle visibilidad de contraseña
    if (els.btnToggleLoginPass && els.inputLoginPassword) {
      els.btnToggleLoginPass.addEventListener("click", () => {
        const esPass = els.inputLoginPassword.type === "password";
        els.inputLoginPassword.type = esPass ? "text" : "password";
        els.btnToggleLoginPass.setAttribute(
          "aria-label",
          esPass ? "Ocultar contraseña" : "Mostrar contraseña"
        );
        const eyeUse = document.getElementById("icon-login-pass-eye");
        if (eyeUse) {
          eyeUse.setAttribute(
            "href",
            `/assets/icons/iconly-sprite.svg#${esPass ? "iconly-hide" : "iconly-show"}`
          );
        }
      });
    }

    // Formulario de login
    if (els.formLoginManual) {
      els.formLoginManual.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = els.inputLoginId ? els.inputLoginId.value.trim() : "";
        const pass = els.inputLoginPassword ? els.inputLoginPassword.value : "";
        if (!id) {
          mostrarAlertaInline("Ingresa tu usuario, cédula, correo o placa.", "error");
          els.inputLoginId?.setAttribute("aria-invalid", "true");
          els.inputLoginId?.focus();
          return;
        }
        if (!pass) {
          mostrarAlertaInline("Ingresa tu contraseña.", "error");
          els.inputLoginPassword?.setAttribute("aria-invalid", "true");
          els.inputLoginPassword?.focus();
          return;
        }
        ejecutarLogin(id, pass);
      });
    }

    // Selector de rol en registro
    const regRoleBtns = document.querySelectorAll("[data-reg-role]");
    regRoleBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        cambiarRolRegistro(btn.dataset.regRole);
      });
    });

    // F11: Registro de estudiante con confirmación de clave y redirección F12
    if (els.formRegEstudiante) {
      els.formRegEstudiante.addEventListener("submit", async (e) => {
        e.preventDefault();
        ocultarAlertaInline();
        limpiarErroresCampos(els.formRegEstudiante);

        const pass = els.regEstPassword?.value || "";
        const passConfirm = els.regEstPasswordConfirm?.value || "";

        if (pass.length < 10) {
          mostrarAlertaInline("La contraseña debe tener al menos 10 caracteres.", "error");
          els.regEstPassword?.setAttribute("aria-invalid", "true");
          els.regEstPassword?.focus();
          return;
        }

        if (pass !== passConfirm) {
          mostrarAlertaInline("Las contraseñas no coinciden. Por favor verifícalas.", "error");
          els.regEstPasswordConfirm?.setAttribute("aria-invalid", "true");
          els.regEstPasswordConfirm?.focus();
          return;
        }

        const correo = els.regEstCorreo?.value.trim().toLowerCase() || "";
        if (!correo.endsWith("@uniamazonia.edu.co") && !correo.endsWith("@udla.edu.co")) {
          mostrarAlertaInline("Debes ingresar un correo institucional (@uniamazonia.edu.co).", "error");
          els.regEstCorreo?.setAttribute("aria-invalid", "true");
          els.regEstCorreo?.focus();
          return;
        }

        const payload = {
          identificacion: els.regEstId?.value.trim() || "",
          codigoEstudiantil: els.regEstCod?.value.trim() || "",
          nombre: els.regEstNombre?.value.trim() || "",
          telefono: els.regEstTel?.value.trim() || "",
          correoInstitucional: correo,
          carrera: els.regEstCarrera?.value.trim() || "",
          barrioResidencia: els.regEstBarrio?.value.trim() || "Sin especificar",
          password: pass
        };

        setBotonBusy(els.btnRegEstSubmit, true, "Crear cuenta de estudiante");

        try {
          const res = await fetch("/api/estudiantes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "No se pudo registrar el estudiante");
          }

          setBotonBusy(els.btnRegEstSubmit, false, "Crear cuenta de estudiante");
          els.formRegEstudiante.reset();

          // F12: Redirigir a pestaña de login con aviso de éxito y credencial precargada
          cambiarModoAuth("login");
          mostrarAlertaInline("¡Cuenta creada exitosamente! Ingresa con tus credenciales.", "success");
          if (els.inputLoginId) {
            els.inputLoginId.value = payload.identificacion;
          }
          if (els.inputLoginPassword) {
            els.inputLoginPassword.focus();
          }
        } catch (err) {
          setBotonBusy(els.btnRegEstSubmit, false, "Crear cuenta de estudiante");
          mostrarAlertaInline(err.message, "error");
        }
      });
    }

    // ==================== WIZARD ONBOARDING TUCÁN (ESTILO NEQUI / DIDI) ====================
    function irAPasoWizard(pasoNum) {
      ocultarAlertaInline();
      const paneles = document.querySelectorAll("[data-step-panel]");
      paneles.forEach((p) => {
        p.classList.toggle("hidden", Number(p.dataset.stepPanel) !== pasoNum);
      });

      const indicadores = document.querySelectorAll("[data-step-indicator]");
      indicadores.forEach((ind) => {
        const n = Number(ind.dataset.stepIndicator);
        ind.classList.toggle("active", n === pasoNum);
        ind.classList.toggle("completed", n < pasoNum);
      });
    }

    function validarPasoWizard(pasoActual) {
      if (pasoActual === 1) {
        const id = els.regTucanId?.value.trim() || "";
        const nombre = els.regTucanNombre?.value.trim() || "";
        const tel = els.regTucanTel?.value.trim() || "";
        const correo = els.regTucanCorreo?.value.trim().toLowerCase() || "";
        const pass = els.regTucanPassword?.value || "";
        const passConfirm = els.regTucanPasswordConfirm?.value || "";

        if (!id || !nombre || !tel) {
          mostrarAlertaInline("Completa tu cédula, nombre completo y teléfono celular.", "error");
          return false;
        }
        if (!correo.endsWith("@uniamazonia.edu.co") && !correo.endsWith("@udla.edu.co")) {
          mostrarAlertaInline("Debes ingresar un correo institucional (@uniamazonia.edu.co).", "error");
          els.regTucanCorreo?.focus();
          return false;
        }
        if (pass.length < 10) {
          mostrarAlertaInline("La contraseña debe tener al menos 10 caracteres.", "error");
          els.regTucanPassword?.focus();
          return false;
        }
        if (pass !== passConfirm) {
          mostrarAlertaInline("Las contraseñas no coinciden.", "error");
          els.regTucanPasswordConfirm?.focus();
          return false;
        }
      } else if (pasoActual === 2) {
        if (!wizardPhotos.face) {
          mostrarAlertaInline("Por favor sube una fotografía de perfil para tu verificación facial.", "error");
          return false;
        }
      } else if (pasoActual === 3) {
        const placa = els.regTucanPlaca?.value.trim() || "";
        const marca = els.regTucanMarca?.value.trim() || "";
        const modelo = els.regTucanModelo?.value.trim() || "";
        const cc = parseInt(els.regTucanCc?.value.trim() || "0", 10);
        if (!placa || !marca || !modelo || cc < 50) {
          mostrarAlertaInline("Completa los datos técnicos de tu motocicleta (placa, marca, modelo, cilindraje).", "error");
          return false;
        }
      }
      return true;
    }

    document.querySelectorAll(".btn-next-step").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextStep = Number(btn.dataset.next);
        const currentStep = nextStep - 1;
        if (validarPasoWizard(currentStep)) {
          irAPasoWizard(nextStep);
        }
      });
    });

    document.querySelectorAll(".btn-prev-step").forEach((btn) => {
      btn.addEventListener("click", () => {
        const prevStep = Number(btn.dataset.prev);
        irAPasoWizard(prevStep);
      });
    });

    // Gestión de subida y vista previa de fotografías
    function setupPhotoUpload(triggerBtnId, inputId, imgId, placeholderId, keyName) {
      const trigger = document.getElementById(triggerBtnId);
      const fileInput = document.getElementById(inputId);
      const imgEl = document.getElementById(imgId);
      const placeholderEl = document.getElementById(placeholderId);

      function applyPreview(dataUrl) {
        wizardPhotos[keyName] = dataUrl;
        if (imgEl) {
          imgEl.src = dataUrl;
          imgEl.classList.remove("hidden");
        }
        if (placeholderEl) placeholderEl.classList.add("hidden");
      }

      trigger?.addEventListener("click", () => fileInput?.click());
      fileInput?.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (typeof ev.target?.result === "string") {
            applyPreview(ev.target.result);
          }
        };
        reader.readAsDataURL(file);
      });
    }

    setupPhotoUpload("btn-trigger-face", "input-file-face", "img-preview-face", "placeholder-face", "face");
    setupPhotoUpload("btn-trigger-moto", "input-file-moto", "img-preview-moto", "placeholder-moto", "moto");

    if (els.formWizardTucan) {
      els.formWizardTucan.addEventListener("submit", async (e) => {
        e.preventDefault();
        ocultarAlertaInline();

        const numeroSoat = els.regTucanSoat?.value.trim() || "";
        const numeroLicencia = els.regTucanLicencia?.value.trim() || "";
        const compromisoAceptado = els.regTucanCompromisoCheck?.checked;

        if (!numeroSoat || numeroSoat.length < 6) {
          mostrarAlertaInline("Ingresa un número de póliza SOAT válido (mínimo 6 caracteres).", "error");
          els.regTucanSoat?.focus();
          return;
        }

        if (!numeroLicencia || numeroLicencia.length < 5) {
          mostrarAlertaInline("Ingresa tu número de licencia de conducción categoría A2.", "error");
          els.regTucanLicencia?.focus();
          return;
        }

        if (!compromisoAceptado) {
          mostrarAlertaInline("Debes aceptar el Código de Honor y las políticas de revocación para continuar.", "error");
          els.regTucanCompromisoCheck?.focus();
          return;
        }

        const payload = {
          identificacion: els.regTucanId?.value.trim() || "",
          nombre: els.regTucanNombre?.value.trim() || "",
          telefono: els.regTucanTel?.value.trim() || "",
          correoInstitucional: els.regTucanCorreo?.value.trim().toLowerCase() || "",
          password: els.regTucanPassword?.value || "",
          placa: (els.regTucanPlaca?.value.trim() || "").toUpperCase(),
          marca: els.regTucanMarca?.value.trim() || "",
          modelo: els.regTucanModelo?.value.trim() || "",
          cilindraje: parseInt(els.regTucanCc?.value.trim() || "150", 10),
          numeroSoat,
          soatVigente: true,
          fotoRostroUrl: wizardPhotos.face,
          fotoMotoUrl: wizardPhotos.moto,
          fotoLicenciaUrl: numeroLicencia,
          compromisoAceptado: true
        };

        setBotonBusy(els.btnSubmitWizardTucan, true, "Enviar a Auditoría de Administración");

        try {
          const res = await fetch("/api/tucanes/registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "No se pudo completar el registro como Tucán");
          }

          setBotonBusy(els.btnSubmitWizardTucan, false, "Enviar a Auditoría de Administración");
          if (els.pendingTucanNombre) els.pendingTucanNombre.textContent = payload.nombre;
          if (els.pendingTucanPlaca) els.pendingTucanPlaca.textContent = payload.placa;

          irAPasoWizard(5);
          mostrarToast("¡Solicitud de Licencia Tucán enviada a auditoría!", "success");
        } catch (err) {
          setBotonBusy(els.btnSubmitWizardTucan, false, "Enviar a Auditoría de Administración");
          mostrarAlertaInline(err.message, "error");
        }
      });
    }

    els.btnPendingGoLogin?.addEventListener("click", () => {
      els.formWizardTucan?.reset();
      irAPasoWizard(1);
      cambiarModoAuth("login");
    });

    // Logout
    if (els.btnLogout) {
      els.btnLogout.addEventListener("click", async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
          if (els.activeSessionBox) els.activeSessionBox.classList.add("hidden");
          if (els.authViews) els.authViews.classList.remove("hidden");
          mostrarAlertaInline("Sesión cerrada correctamente.", "success");
        } catch {
          window.location.reload();
        }
      });
    }
  }

  function iniciarStoryReel() {
    const reel = els.storyReel;
    if (!reel) return;

    const slides = Array.from(reel.querySelectorAll(".story-slide"));
    const dots = Array.from(reel.querySelectorAll(".story-dot"));
    if (slides.length === 0) return;

    let indiceActual = 0;
    let timerId = null;
    let pausado = false;

    function activarSlide(nuevoIndice) {
      indiceActual = ((nuevoIndice % slides.length) + slides.length) % slides.length;
      slides.forEach((slide, idx) => {
        slide.classList.toggle("active", idx === indiceActual);
      });
      dots.forEach((dot, idx) => {
        const esActivo = idx === indiceActual;
        dot.classList.toggle("active", esActivo);
        dot.setAttribute("aria-current", esActivo ? "true" : "false");
      });
    }

    function reiniciarAutoplay() {
      if (timerId) window.clearInterval(timerId);
      timerId = window.setInterval(() => {
        if (!pausado && !reel.classList.contains("hidden")) {
          activarSlide(indiceActual + 1);
        }
      }, 4200);
    }

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const idx = Number(dot.dataset.storyIdx);
        if (Number.isInteger(idx)) {
          activarSlide(idx);
          reiniciarAutoplay();
        }
      });
    });

    reel.addEventListener("mouseenter", () => {
      pausado = true;
    });
    reel.addEventListener("mouseleave", () => {
      pausado = false;
    });
    reel.addEventListener("focusin", () => {
      pausado = true;
    });
    reel.addEventListener("focusout", () => {
      pausado = false;
    });

    activarSlide(0);
    reiniciarAutoplay();
  }

  inicializarConectividad();
  verificarSesionActual();
  inicializarEventos();
  iniciarStoryReel();
})();
