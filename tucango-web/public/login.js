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
    regEstUsuario: document.getElementById("reg-est-usuario"),
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
    cedula: "",
    moto: "",
    soat: "",
    licencia: ""
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

    // ==================== REGISTRO DE ESTUDIANTE: VALIDACIÓN POR CAMPO ====================
    const DOMINIOS_ESTUDIANTE = ["uniamazonia.edu.co", "udla.edu.co"];

    function soloDigitos(valor, maximo) {
      return (valor || "").replace(/\D/g, "").slice(0, maximo);
    }

    // El nombre solo admite letras, espacios, apóstrofes y guiones.
    function filtrarNombre(valor) {
      return (valor || "")
        .replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]/g, "")
        .replace(/\s{2,}/g, " ")
        .replace(/^\s+/, "");
    }

    // Marca y modelo admiten letras, números, espacios, paréntesis y guiones.
    function filtrarTextoVehiculo(valor) {
      return (valor || "")
        .replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ() .-]/g, "")
        .replace(/\s{2,}/g, " ")
        .replace(/^\s+/, "");
    }

    function derivarUsuarioDesdeCorreo(correo) {
      const local = (correo || "")
        .split("@")[0]
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "");
      return /^[a-z0-9][a-z0-9._-]{2,29}$/.test(local) ? local : "";
    }

    function obtenerMensajeErrorEstudiante(input) {
      if (!input) return "";
      const valor = (input.value || "").trim();

      switch (input.id) {
        case "reg-est-id":
          if (!valor) return "La cédula es obligatoria.";
          if (!/^\d{6,10}$/.test(valor)) return "La cédula debe tener entre 6 y 10 dígitos, sin letras ni espacios.";
          return "";
        case "reg-est-cod":
          if (!valor) return "El código estudiantil es obligatorio.";
          if (!/^\d{6,12}$/.test(valor)) return "El código debe tener entre 6 y 12 dígitos.";
          return "";
        case "reg-est-nombre":
          if (!valor) return "El nombre es obligatorio.";
          if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{3,80}$/.test(valor)) {
            return "Escribe tu nombre completo: solo letras, espacios, apóstrofes o guiones.";
          }
          return "";
        case "reg-est-tel":
          if (!valor) return "El teléfono es obligatorio.";
          if (!/^3\d{9}$/.test(valor)) return "Debe ser un celular colombiano de 10 dígitos que empiece por 3.";
          return "";
        case "reg-est-correo": {
          if (!valor) return "El correo institucional es obligatorio.";
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) return "El correo no tiene un formato válido.";
          const dominio = valor.split("@").pop().toLowerCase();
          if (!DOMINIOS_ESTUDIANTE.includes(dominio)) {
            return "Usa tu correo @uniamazonia.edu.co o @udla.edu.co.";
          }
          return "";
        }
        case "reg-est-usuario":
          if (!valor) return "El usuario es obligatorio.";
          if (!/^[a-z0-9][a-z0-9._-]{2,29}$/.test(valor.toLowerCase())) {
            return "Entre 3 y 30 caracteres: letras, números, punto, guion o guion bajo.";
          }
          return "";
        case "reg-est-carrera":
          if (!valor) return "Selecciona tu programa académico.";
          return "";
        case "reg-est-barrio":
          if (!valor) return "Selecciona tu barrio o sector.";
          return "";
        case "reg-est-password":
          if (!valor) return "La contraseña es obligatoria.";
          if (valor.length < 10) return "La contraseña debe tener al menos 10 caracteres.";
          if (!/[A-Z]/.test(valor) || !/[a-z]/.test(valor) || !/\d/.test(valor)) {
            return "Incluye al menos una mayúscula, una minúscula y un número.";
          }
          return "";
        case "reg-est-password-confirm":
          if (!valor) return "Confirma tu contraseña.";
          if (valor !== (els.regEstPassword?.value || "")) return "Las contraseñas no coinciden.";
          return "";
        default:
          return "";
      }
    }

    function aplicarEstadoEstudiante(input, mostrarError) {
      if (!input) return true;
      const mensaje = obtenerMensajeErrorEstudiante(input);
      const errSpan = document.getElementById(`${input.id}-error`);
      input.classList.remove("is-valid", "is-invalid");

      if (mensaje && mostrarError) {
        input.classList.add("is-invalid");
        input.setAttribute("aria-invalid", "true");
        if (errSpan) errSpan.textContent = mensaje;
        return false;
      }

      if (!mensaje && (input.value || "").trim()) {
        input.classList.add("is-valid");
        input.setAttribute("aria-invalid", "false");
      } else {
        input.removeAttribute("aria-invalid");
      }
      if (errSpan) errSpan.textContent = "";
      return !mensaje;
    }

    let usuarioEstudianteManual = false;

    async function cargarBarriosFlorencia() {
      const select = els.regEstBarrio;
      if (!select || select.dataset.cargado === "true") return;
      try {
        const data = await fetch("/api/catalogos/barrios", { cache: "no-store" }).then((r) => r.json());
        const comunas = data.comunas || [];
        if (comunas.length === 0) return;

        select.innerHTML = "";
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Selecciona tu barrio";
        select.appendChild(placeholder);

        for (const grupo of comunas) {
          const optgroup = document.createElement("optgroup");
          optgroup.label = grupo.comuna;
          for (const barrio of grupo.barrios) {
            const opcion = document.createElement("option");
            opcion.value = barrio;
            opcion.textContent = barrio;
            optgroup.appendChild(opcion);
          }
          select.appendChild(optgroup);
        }
        select.dataset.cargado = "true";
        aplicarEstadoEstudiante(select, false);
      } catch {
        select.innerHTML = "";
        const fallo = document.createElement("option");
        fallo.value = "";
        fallo.textContent = "No se pudo cargar la lista. Recarga la página.";
        select.appendChild(fallo);
      }
    }

    // F11: Registro de estudiante con validación inmediata por campo
    if (els.formRegEstudiante) {
      const camposEstudiante = Array.from(
        els.formRegEstudiante.querySelectorAll("input.ios-input-field, select.ios-input-field")
      );

      camposEstudiante.forEach((input) => {
        input.addEventListener("input", () => {
          if (input.id === "reg-est-id") input.value = soloDigitos(input.value, 10);
          if (input.id === "reg-est-cod") input.value = soloDigitos(input.value, 12);
          if (input.id === "reg-est-tel") input.value = soloDigitos(input.value, 10);
          if (input.id === "reg-est-nombre") input.value = filtrarNombre(input.value);
          if (input.id === "reg-est-correo") input.value = input.value.replace(/\s+/g, "").toLowerCase();
          if (input.id === "reg-est-usuario") {
            input.value = input.value.toLowerCase().replace(/[^a-z0-9._-]/g, "");
            usuarioEstudianteManual = input.value.trim().length > 0;
          }

          if (input.id === "reg-est-correo" && !usuarioEstudianteManual && els.regEstUsuario) {
            els.regEstUsuario.value = derivarUsuarioDesdeCorreo(input.value);
            aplicarEstadoEstudiante(els.regEstUsuario, false);
          }

          if (input.id === "reg-est-password") {
            actualizarMedidorFuerza(
              input.value,
              "est-pass-strength-bar",
              "est-pass-strength-label"
            );
            if (els.regEstPasswordConfirm?.dataset.dirty === "true") {
              aplicarEstadoEstudiante(els.regEstPasswordConfirm, true);
            }
          }

          // Feedback inmediato: el usuario ve el error mientras escribe.
          aplicarEstadoEstudiante(input, true);
        });

        input.addEventListener("blur", () => {
          input.dataset.dirty = "true";
          aplicarEstadoEstudiante(input, true);
        });

        input.addEventListener("change", () => {
          input.dataset.dirty = "true";
          aplicarEstadoEstudiante(input, true);
        });
      });

      cargarBarriosFlorencia();

      els.formRegEstudiante.addEventListener("submit", async (e) => {
        e.preventDefault();
        ocultarAlertaInline();

        let primerInvalido = null;
        for (const input of camposEstudiante) {
          input.dataset.dirty = "true";
          if (!aplicarEstadoEstudiante(input, true) && !primerInvalido) {
            primerInvalido = input;
          }
        }

        if (primerInvalido) {
          mostrarAlertaInline("Corrige los campos marcados en rojo antes de continuar.", "error");
          primerInvalido.focus();
          return;
        }

        const payload = {
          identificacion: els.regEstId.value.trim(),
          codigoEstudiantil: els.regEstCod.value.trim(),
          nombre: els.regEstNombre.value.trim().replace(/\s+/g, " "),
          telefono: els.regEstTel.value.trim(),
          correoInstitucional: els.regEstCorreo.value.trim().toLowerCase(),
          usuario: els.regEstUsuario.value.trim().toLowerCase(),
          carrera: els.regEstCarrera.value,
          barrioResidencia: els.regEstBarrio.value.trim(),
          password: els.regEstPassword.value
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
          usuarioEstudianteManual = false;
          camposEstudiante.forEach((input) => {
            input.classList.remove("is-valid", "is-invalid");
            input.removeAttribute("aria-invalid");
            const errSpan = document.getElementById(`${input.id}-error`);
            if (errSpan) errSpan.textContent = "";
            delete input.dataset.dirty;
          });
          actualizarMedidorFuerza("", "est-pass-strength-bar", "est-pass-strength-label");

          // F12: Redirigir a la pestaña de login con el usuario precargado
          cambiarModoAuth("login");
          mostrarAlertaInline(
            `¡Cuenta creada! Ingresa con tu usuario ${payload.usuario}.`,
            "success"
          );
          if (els.inputLoginId) {
            els.inputLoginId.value = payload.usuario;
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

    // ==================== VALIDACIÓN EN TIEMPO REAL (MDN CONSTRAINT VALIDATION API) ====================
    // Los helpers viven en el alcance del módulo: el bloque que ata los listeners
    // corre al cargar la página, fuera de validarPasoWizard, y los necesita.
    const customMessages = {
      "reg-tucan-id": "Ingresa una cédula válida de 6 a 10 dígitos numéricos.",
      "reg-tucan-nombre": "Ingresa tu nombre completo (mínimo 3 caracteres).",
      "reg-tucan-tel": "Ingresa un celular/WhatsApp colombiano válido de 10 dígitos (ej. 3201234567).",
      "reg-tucan-correo": "Ingresa un correo electrónico personal válido (ej. andres@gmail.com).",
      "reg-tucan-password": "La contraseña debe tener al menos 10 caracteres.",
      "reg-tucan-password-confirm": "Las contraseñas no coinciden.",
      "reg-tucan-placa": "Formato de placa colombiana inválido (ej. AMZ-77G o AMZ77G).",
      "reg-tucan-marca": "Ingresa la marca de la motocicleta (mínimo 2 caracteres).",
      "reg-tucan-modelo": "Ingresa la línea o modelo (mínimo 2 caracteres).",
      "reg-tucan-cc": "El cilindraje debe estar entre 50 y 1500 cc.",
      "reg-tucan-soat": "Ingresa un número de póliza SOAT válido (mínimo 6 caracteres).",
      "reg-tucan-licencia": "Ingresa un número de licencia de conducción válido (mínimo 5 caracteres)."
    };

    // El Tucán no es estudiante: su correo de contacto debe ser personal.
    const DOMINIOS_INSTITUCIONALES = ["uniamazonia.edu.co"];

    function esCorreoInstitucional(valor) {
      const correo = (valor || "").trim().toLowerCase();
      const arroba = correo.lastIndexOf("@");
      if (arroba === -1) return false;
      const dominio = correo.slice(arroba + 1);
      return DOMINIOS_INSTITUCIONALES.some((d) => dominio === d);
    }

    function obtenerMensajeErrorCampo(inputEl) {
      if (!inputEl) return "";
      const v = inputEl.validity;
      if (v.valueMissing) return "Este campo es obligatorio.";
      if (inputEl.id === "reg-tucan-correo") {
        const val = inputEl.value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) {
          return customMessages["reg-tucan-correo"];
        }
        if (esCorreoInstitucional(val)) {
          return "Usa tu correo personal: el correo @uniamazonia.edu.co es exclusivo de estudiantes.";
        }
      }
      if (inputEl.id === "reg-tucan-password-confirm") {
        if (inputEl.value !== (els.regTucanPassword?.value || "")) {
          return customMessages["reg-tucan-password-confirm"];
        }
      }
      if (v.typeMismatch || v.patternMismatch || v.tooShort || v.tooLong || v.rangeUnderflow || v.rangeOverflow) {
        return customMessages[inputEl.id] || inputEl.validationMessage;
      }
      return "";
    }

    function validarCampoEnTiempoReal(inputEl) {
      if (!inputEl) return true;
      const errSpan = document.getElementById(`${inputEl.id}-error`);
      const msg = obtenerMensajeErrorCampo(inputEl);

      if (msg) {
        inputEl.classList.remove("is-valid");
        inputEl.classList.add("is-invalid");
        inputEl.setAttribute("aria-invalid", "true");
        if (errSpan) errSpan.textContent = msg;
        return false;
      } else {
        inputEl.classList.remove("is-invalid");
        inputEl.classList.add("is-valid");
        inputEl.setAttribute("aria-invalid", "false");
        if (errSpan) errSpan.textContent = "";
        return true;
      }
    }

    function actualizarMedidorFuerza(pass, barId = "tucan-pass-strength-bar", labelId = "tucan-pass-strength-label") {
      const bar = document.getElementById(barId);
      const label = document.getElementById(labelId);
      if (!bar || !label) return;

      let score = 0;
      if (pass.length >= 10) score++;
      if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
      if (/[0-9]/.test(pass)) score++;
      if (/[^A-Za-z0-9]/.test(pass)) score++;

      if (!pass) {
        bar.style.width = "0%";
        label.textContent = "Seguridad: --";
      } else if (score <= 1 || pass.length < 10) {
        bar.style.width = "33%";
        bar.style.backgroundColor = "#E30613";
        label.textContent = "Seguridad: Débil";
      } else if (score === 2 || score === 3) {
        bar.style.width = "68%";
        bar.style.backgroundColor = "#D97706";
        label.textContent = "Seguridad: Media";
      } else {
        bar.style.width = "100%";
        bar.style.backgroundColor = "#006837";
        label.textContent = "Seguridad: Fuerte";
      }
    }

    function validarPasoWizard(pasoActual) {
      if (pasoActual === 1) {
        const camposPaso1 = [
          els.regTucanId,
          els.regTucanNombre,
          els.regTucanTel,
          els.regTucanCorreo,
          els.regTucanPassword,
          els.regTucanPasswordConfirm
        ];
        let primerInvalido = null;
        for (const c of camposPaso1) {
          if (c) c.dataset.dirty = "true";
          if (!validarCampoEnTiempoReal(c) && !primerInvalido) {
            primerInvalido = c;
          }
        }
        if (primerInvalido) {
          mostrarAlertaInline("Corrige los campos marcados en rojo antes de continuar.", "error");
          primerInvalido.focus();
          return false;
        }
      } else if (pasoActual === 2) {
        if (!wizardPhotos.face) {
          mostrarAlertaInline("Por favor sube o toma tu Selfie de reconocimiento facial.", "error");
          return false;
        }
        if (!wizardPhotos.cedula) {
          mostrarAlertaInline("Por favor escanea o sube la fotografía de tu Cédula de Ciudadanía.", "error");
          return false;
        }
      } else if (pasoActual === 3) {
        const camposPaso3 = [
          els.regTucanPlaca,
          els.regTucanMarca,
          els.regTucanModelo,
          els.regTucanCc
        ];
        let primerInvalido = null;
        for (const c of camposPaso3) {
          if (c) c.dataset.dirty = "true";
          if (!validarCampoEnTiempoReal(c) && !primerInvalido) {
            primerInvalido = c;
          }
        }
        if (primerInvalido) {
          mostrarAlertaInline("Corrige los datos técnicos de tu motocicleta.", "error");
          primerInvalido.focus();
          return false;
        }
        if (!wizardPhotos.moto) {
          mostrarAlertaInline("Adjunta una fotografía lateral de tu motocicleta.", "error");
          return false;
        }
      }
      return true;
    }

    if (els.formWizardTucan) {
      els.formWizardTucan.querySelectorAll("input.ios-input-field").forEach((inputEl) => {
        inputEl.addEventListener("blur", () => {
          inputEl.dataset.dirty = "true";
          validarCampoEnTiempoReal(inputEl);
        });
        inputEl.addEventListener("input", () => {
          if (inputEl.id === "reg-tucan-id") inputEl.value = soloDigitos(inputEl.value, 10);
          if (inputEl.id === "reg-tucan-tel") inputEl.value = soloDigitos(inputEl.value, 10);
          if (inputEl.id === "reg-tucan-cc") inputEl.value = soloDigitos(inputEl.value, 4);
          if (inputEl.id === "reg-tucan-nombre") inputEl.value = filtrarNombre(inputEl.value);
          if (inputEl.id === "reg-tucan-marca") inputEl.value = filtrarNombre(inputEl.value);
          if (inputEl.id === "reg-tucan-modelo") inputEl.value = filtrarTextoVehiculo(inputEl.value);
          if (inputEl.id === "reg-tucan-correo") {
            inputEl.value = inputEl.value.replace(/\s+/g, "").toLowerCase();
          }
          if (inputEl.id === "reg-tucan-placa") {
            inputEl.value = inputEl.value
              .toUpperCase()
              .replace(/[^A-Z0-9-]/g, "")
              .slice(0, 7);
          }
          if (inputEl.id === "reg-tucan-soat" || inputEl.id === "reg-tucan-licencia") {
            inputEl.value = inputEl.value
              .toUpperCase()
              .replace(/[^A-Z0-9-]/g, "")
              .slice(0, 30);
          }
          if (inputEl.id === "reg-tucan-password") {
            actualizarMedidorFuerza(inputEl.value);
            if (els.regTucanPasswordConfirm?.dataset.dirty === "true") {
              validarCampoEnTiempoReal(els.regTucanPasswordConfirm);
            }
          }
          if (inputEl.dataset.dirty === "true" || inputEl.classList.contains("is-invalid")) {
            validarCampoEnTiempoReal(inputEl);
          }
        });
      });
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

    // Detección de dispositivo móvil / táctil para mostrar botón directo de cámara
    const esDispositivoMovil =
      window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
    document.querySelectorAll(".btn-mobile-camera").forEach((btn) => {
      btn.classList.toggle("hidden", !esDispositivoMovil);
    });

    // Calidad por tipo de foto: la selfie se comprime fuerte, pero los documentos
    // (cédula, SOAT, licencia) necesitan resolución suficiente para que el
    // Administrador pueda leer el número y verificar la vigencia.
    const CALIDAD_FOTO = {
      face: { maxWidth: 640, quality: 0.72 },
      cedula: { maxWidth: 1280, quality: 0.82 },
      moto: { maxWidth: 1024, quality: 0.78 },
      soat: { maxWidth: 1280, quality: 0.82 },
      licencia: { maxWidth: 1280, quality: 0.82 }
    };

    // Compresión en <canvas> antes de enviar la imagen como data URL
    function comprimirImagenFile(file, { maxWidth = 960, quality = 0.75 } = {}) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Error leyendo la imagen"));
        reader.onload = (ev) => {
          const img = new Image();
          img.onerror = () => reject(new Error("Formato de imagen no soportado"));
          img.onload = () => {
            const scale = img.width > maxWidth ? maxWidth / img.width : 1;
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", quality));
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    // Gestión de subida, cámara móvil y vista previa de fotografías
    function setupPhotoUpload(triggerBtnId, cameraBtnId, fileInputId, cameraInputId, imgId, placeholderId, keyName) {
      const trigger = document.getElementById(triggerBtnId);
      const camBtn = document.getElementById(cameraBtnId);
      const fileInput = document.getElementById(fileInputId);
      const camInput = document.getElementById(cameraInputId);
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

      async function handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
          const compressed = await comprimirImagenFile(file, CALIDAD_FOTO[keyName]);
          applyPreview(compressed);
        } catch (err) {
          mostrarAlertaInline(err.message, "error");
        }
      }

      trigger?.addEventListener("click", () => fileInput?.click());
      camBtn?.addEventListener("click", () => camInput?.click());
      fileInput?.addEventListener("change", handleFileSelect);
      camInput?.addEventListener("change", handleFileSelect);
    }

    setupPhotoUpload("btn-trigger-face", "btn-camera-face", "input-file-face", "input-camera-face", "img-preview-face", "placeholder-face", "face");
    setupPhotoUpload("btn-trigger-cedula", "btn-camera-cedula", "input-file-cedula", "input-camera-cedula", "img-preview-cedula", "placeholder-cedula", "cedula");
    setupPhotoUpload("btn-trigger-moto", "btn-camera-moto", "input-file-moto", "input-camera-moto", "img-preview-moto", "placeholder-moto", "moto");
    setupPhotoUpload("btn-trigger-soat", "btn-camera-soat", "input-file-soat", "input-camera-soat", "img-preview-soat", "placeholder-soat", "soat");
    setupPhotoUpload("btn-trigger-licencia", "btn-camera-licencia", "input-file-licencia", "input-camera-licencia", "img-preview-licencia", "placeholder-licencia", "licencia");

    // En móvil el selector abre la galería; el botón debe decirlo sin ambigüedad
    if (esDispositivoMovil) {
      document.querySelectorAll(".btn-gallery-label").forEach((label) => {
        label.textContent = "Elegir de la galería";
      });
    }

    if (els.formWizardTucan) {
      els.formWizardTucan.addEventListener("submit", async (e) => {
        e.preventDefault();
        ocultarAlertaInline();

        if (els.regTucanSoat) els.regTucanSoat.dataset.dirty = "true";
        if (els.regTucanLicencia) els.regTucanLicencia.dataset.dirty = "true";

        const soatValido = validarCampoEnTiempoReal(els.regTucanSoat);
        const licValida = validarCampoEnTiempoReal(els.regTucanLicencia);
        const compromisoAceptado = els.regTucanCompromisoCheck?.checked;

        if (!soatValido || !licValida) {
          mostrarAlertaInline("Verifica el número de póliza SOAT y tu licencia de conducción.", "error");
          (!soatValido ? els.regTucanSoat : els.regTucanLicencia)?.focus();
          return;
        }

        if (!wizardPhotos.soat || !wizardPhotos.licencia) {
          mostrarAlertaInline(
            "Adjunta una foto legible de tu póliza SOAT y de tu licencia de conducción para completar tu hoja de vida.",
            "error"
          );
          return;
        }

        if (!compromisoAceptado) {
          mostrarAlertaInline("Debes aceptar las Políticas de Privacidad, Consentimientos y Código de Honor Tucán.", "error");
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
          numeroSoat: els.regTucanSoat?.value.trim() || "",
          soatVigente: true,
          numeroLicencia: els.regTucanLicencia?.value.trim() || "",
          fotoRostroUrl: wizardPhotos.face,
          fotoCedulaUrl: wizardPhotos.cedula,
          fotoMotoUrl: wizardPhotos.moto,
          fotoSoatUrl: wizardPhotos.soat,
          fotoLicenciaUrl: wizardPhotos.licencia,
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
          mostrarToast("¡Solicitud de Licencia Tucán enviada! Pronto te contactaremos.", "success");
        } catch (err) {
          setBotonBusy(els.btnSubmitWizardTucan, false, "Enviar a Auditoría de Administración");
          mostrarAlertaInline(err.message, "error");
        }
      });
    }

    function reiniciarFotosWizard() {
      wizardPhotos = { face: "", cedula: "", moto: "", soat: "", licencia: "" };
      [
        ["img-preview-face", "placeholder-face"],
        ["img-preview-cedula", "placeholder-cedula"],
        ["img-preview-moto", "placeholder-moto"],
        ["img-preview-soat", "placeholder-soat"],
        ["img-preview-licencia", "placeholder-licencia"]
      ].forEach(([imgId, placeholderId]) => {
        const imgEl = document.getElementById(imgId);
        const placeholderEl = document.getElementById(placeholderId);
        if (imgEl) {
          imgEl.src = "";
          imgEl.classList.add("hidden");
        }
        if (placeholderEl) placeholderEl.classList.remove("hidden");
      });
    }

    els.btnPendingGoLogin?.addEventListener("click", () => {
      els.formWizardTucan?.reset();
      reiniciarFotosWizard();
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
