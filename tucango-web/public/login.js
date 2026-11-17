// TucanGo · Lógica de Autenticación General y Registro de Roles (Hardened v2.8)
(function () {
  "use strict";

  // F16: Cache único de elementos del DOM
  const els = {
    // Alertas y Banners
    networkBanner: document.getElementById("network-offline-banner"),
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
    regEstPassword: document.getElementById("reg-est-password"),
    regEstPasswordConfirm: document.getElementById("reg-est-password-confirm"),

    // Registro Motorista
    formRegMotorista: document.getElementById("form-reg-motorista"),
    btnRegMotSubmit: document.getElementById("btn-reg-mot-submit"),
    regMotId: document.getElementById("reg-mot-id"),
    regMotNombre: document.getElementById("reg-mot-nombre"),
    regMotTel: document.getElementById("reg-mot-tel"),
    regMotCorreo: document.getElementById("reg-mot-correo"),
    regMotPassword: document.getElementById("reg-mot-password"),
    regMotPasswordConfirm: document.getElementById("reg-mot-password-confirm"),
    regMotPlaca: document.getElementById("reg-mot-placa"),
    regMotMarca: document.getElementById("reg-mot-marca"),
    regMotModelo: document.getElementById("reg-mot-modelo"),
    regMotCc: document.getElementById("reg-mot-cc"),
    regMotSoat: document.getElementById("reg-mot-soat"),
    regMotSoatOk: document.getElementById("reg-mot-soat-ok")
  };

  let toastTimer = null;

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
      document.title = "TucanGo · Registro universitario";
    } else {
      els.tabBtnRegister.classList.remove("active");
      els.tabBtnRegister.setAttribute("aria-selected", "false");
      els.tabBtnLogin.classList.add("active");
      els.tabBtnLogin.setAttribute("aria-selected", "true");

      els.viewRegister.classList.add("hidden");
      els.viewLogin.classList.remove("hidden");
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
      els.formRegMotorista.classList.remove("hidden");
    } else {
      els.formRegMotorista.classList.add("hidden");
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

    // F11, F13: Registro de motorista con confirmación de clave y verificación de SOAT
    if (els.formRegMotorista) {
      els.formRegMotorista.addEventListener("submit", async (e) => {
        e.preventDefault();
        ocultarAlertaInline();
        limpiarErroresCampos(els.formRegMotorista);

        const soatOk = els.regMotSoatOk?.checked;
        if (!soatOk) {
          mostrarAlertaInline("Debes certificar tener SOAT vigente y activo para registrarte.", "error");
          els.regMotSoatOk?.focus();
          return;
        }

        const pass = els.regMotPassword?.value || "";
        const passConfirm = els.regMotPasswordConfirm?.value || "";

        if (pass.length < 10) {
          mostrarAlertaInline("La contraseña debe tener al menos 10 caracteres.", "error");
          els.regMotPassword?.setAttribute("aria-invalid", "true");
          els.regMotPassword?.focus();
          return;
        }

        if (pass !== passConfirm) {
          mostrarAlertaInline("Las contraseñas no coinciden. Por favor verifícalas.", "error");
          els.regMotPasswordConfirm?.setAttribute("aria-invalid", "true");
          els.regMotPasswordConfirm?.focus();
          return;
        }

        const correo = els.regMotCorreo?.value.trim().toLowerCase() || "";
        if (!correo.endsWith("@uniamazonia.edu.co") && !correo.endsWith("@udla.edu.co")) {
          mostrarAlertaInline("Debes ingresar un correo institucional (@uniamazonia.edu.co).", "error");
          els.regMotCorreo?.setAttribute("aria-invalid", "true");
          els.regMotCorreo?.focus();
          return;
        }

        const payload = {
          identificacion: els.regMotId?.value.trim() || "",
          nombre: els.regMotNombre?.value.trim() || "",
          telefono: els.regMotTel?.value.trim() || "",
          correoInstitucional: correo,
          password: pass,
          placa: (els.regMotPlaca?.value.trim() || "").toUpperCase(),
          marca: els.regMotMarca?.value.trim() || "",
          modelo: els.regMotModelo?.value.trim() || "",
          cilindraje: parseInt(els.regMotCc?.value.trim() || "0", 10),
          numeroSoat: els.regMotSoat?.value.trim() || "",
          soatVigente: true
        };

        if (!payload.numeroSoat || payload.numeroSoat.length < 6) {
          mostrarAlertaInline("Ingresa un número de póliza SOAT válido (mínimo 6 caracteres).", "error");
          els.regMotSoat?.setAttribute("aria-invalid", "true");
          els.regMotSoat?.focus();
          return;
        }

        setBotonBusy(els.btnRegMotSubmit, true, "Registrar motorista y motocicleta");

        try {
          const res = await fetch("/api/motoristas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "No se pudo registrar el motorista");
          }

          setBotonBusy(els.btnRegMotSubmit, false, "Registrar motorista y motocicleta");
          els.formRegMotorista.reset();

          // F12: Redirigir a pestaña de login con aviso de éxito y credencial precargada
          cambiarModoAuth("login");
          mostrarAlertaInline("¡Motorista verificado con éxito! Ingresa con tu placa o identificación.", "success");
          if (els.inputLoginId) {
            els.inputLoginId.value = payload.placa || payload.identificacion;
          }
          if (els.inputLoginPassword) {
            els.inputLoginPassword.focus();
          }
        } catch (err) {
          setBotonBusy(els.btnRegMotSubmit, false, "Registrar motorista y motocicleta");
          mostrarAlertaInline(err.message, "error");
        }
      });
    }

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

  inicializarConectividad();
  verificarSesionActual();
  inicializarEventos();
})();
