// TucanGo · Lógica de Autenticación General y Registro de Roles (Duolingo & iOS Style)
(function () {
  "use strict";

  const els = {
    activeSessionBox: document.getElementById("portal-active-session"),
    activeUserName: document.getElementById("active-user-name"),
    activeUserDetail: document.getElementById("active-user-detail"),
    activeUserInitials: document.getElementById("active-user-initials"),
    btnLogout: document.getElementById("btn-logout-portal"),
    authViews: document.getElementById("portal-auth-views"),

    // Tabs principales
    tabBtnLogin: document.getElementById("tab-btn-login"),
    tabBtnRegister: document.getElementById("tab-btn-register"),
    viewLogin: document.getElementById("view-login"),
    viewRegister: document.getElementById("view-register"),
    linkGoRegister: document.getElementById("link-go-register"),
    linkGoLogin: document.getElementById("link-go-login"),

    // Login general y cuentas por defecto
    accountCardsList: document.getElementById("account-cards-list"),
    formLoginManual: document.getElementById("form-login-manual"),
    inputLoginId: document.getElementById("input-login-id"),
    inputLoginPassword: document.getElementById("input-login-password"),
    btnToggleLoginPass: document.getElementById("btn-toggle-login-pass"),
    btnLoginSubmit: document.getElementById("btn-login-submit"),

    // Registro
    formRegEstudiante: document.getElementById("form-reg-estudiante"),
    formRegMotorista: document.getElementById("form-reg-motorista"),

    // Toast
    toast: document.getElementById("portal-toast")
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
    }, 3500);
  }

  function cambiarModoAuth(modo) {
    if (modo === "register") {
      els.tabBtnLogin.classList.remove("active");
      els.tabBtnLogin.setAttribute("aria-selected", "false");
      els.tabBtnRegister.classList.add("active");
      els.tabBtnRegister.setAttribute("aria-selected", "true");

      els.viewLogin.classList.add("hidden");
      els.viewRegister.classList.remove("hidden");
    } else {
      els.tabBtnRegister.classList.remove("active");
      els.tabBtnRegister.setAttribute("aria-selected", "false");
      els.tabBtnLogin.classList.add("active");
      els.tabBtnLogin.setAttribute("aria-selected", "true");

      els.viewRegister.classList.add("hidden");
      els.viewLogin.classList.remove("hidden");
    }
  }

  function cambiarRolRegistro(rol) {
    const btns = document.querySelectorAll("[data-reg-role]");
    btns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.regRole === rol);
    });

    if (rol === "motorista") {
      els.formRegEstudiante.classList.add("hidden");
      els.formRegMotorista.classList.remove("hidden");
    } else {
      els.formRegMotorista.classList.add("hidden");
      els.formRegEstudiante.classList.remove("hidden");
    }
  }

  async function ejecutarLogin(identificador, password, rol) {
    try {
      mostrarToast("Verificando credenciales...", "info");

      const payload = { identificador, password };
      if (rol) payload.rol = rol;

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Credenciales inválidas");
      }

      mostrarToast(`¡Bienvenido, ${data.nombre}!`, "success");
      setTimeout(() => {
        window.location.href = "/app";
      }, 350);
    } catch (err) {
      mostrarToast(err.message, "error");
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

    // Mostrar / ocultar contraseña
    if (els.btnToggleLoginPass && els.inputLoginPassword) {
      els.btnToggleLoginPass.addEventListener("click", () => {
        const esPass = els.inputLoginPassword.type === "password";
        els.inputLoginPassword.type = esPass ? "text" : "password";
      });
    }

    // Autocompletar credenciales desde Cuentas por Defecto
    if (els.accountCardsList) {
      els.accountCardsList.addEventListener("click", (e) => {
        const card = e.target.closest(".account-card");
        if (!card) return;
        const user = card.dataset.defaultUser;
        const pass = card.dataset.defaultPass;
        if (user && pass && els.inputLoginId && els.inputLoginPassword) {
          els.inputLoginId.value = user;
          els.inputLoginPassword.value = pass;
          mostrarToast(`Credenciales de ${user} cargadas`, "info");
          els.btnLoginSubmit?.focus();
        }
      });
    }

    // Formulario general de login con usuario + contraseña
    if (els.formLoginManual) {
      els.formLoginManual.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = els.inputLoginId ? els.inputLoginId.value.trim() : "";
        const pass = els.inputLoginPassword ? els.inputLoginPassword.value : "";
        if (!id || !pass) {
          mostrarToast("Ingresa tu usuario y contraseña", "error");
          return;
        }
        ejecutarLogin(id, pass);
      });
    }

    // Selector de rol para registro
    const regRoleBtns = document.querySelectorAll("[data-reg-role]");
    regRoleBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        cambiarRolRegistro(btn.dataset.regRole);
      });
    });

    // Registro Estudiante
    if (els.formRegEstudiante) {
      els.formRegEstudiante.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
          identificacion: document.getElementById("reg-est-id")?.value.trim(),
          codigoEstudiantil: document.getElementById("reg-est-cod")?.value.trim(),
          nombre: document.getElementById("reg-est-nombre")?.value.trim(),
          telefono: document.getElementById("reg-est-tel")?.value.trim(),
          correoInstitucional: document.getElementById("reg-est-correo")?.value.trim(),
          carrera: document.getElementById("reg-est-carrera")?.value.trim(),
          password: document.getElementById("reg-est-password")?.value || ""
        };

        try {
          mostrarToast("Registrando cuenta de estudiante...", "info");
          const res = await fetch("/api/estudiantes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "No se pudo registrar el estudiante");
          }

          mostrarToast("¡Cuenta creada! Iniciando sesión...", "success");
          await ejecutarLogin(payload.identificacion, payload.password, "pasajero");
        } catch (err) {
          mostrarToast(err.message, "error");
        }
      });
    }

    // Registro Motorista + Moto
    if (els.formRegMotorista) {
      els.formRegMotorista.addEventListener("submit", async (e) => {
        e.preventDefault();

        const soatOk = document.getElementById("reg-mot-soat-ok")?.checked;
        if (!soatOk) {
          mostrarToast("Debes certificar tener SOAT vigente para registrarte", "error");
          return;
        }

        const payload = {
          identificacion: document.getElementById("reg-mot-id")?.value.trim(),
          nombre: document.getElementById("reg-mot-nombre")?.value.trim(),
          telefono: document.getElementById("reg-mot-tel")?.value.trim(),
          correoInstitucional: document.getElementById("reg-mot-correo")?.value.trim(),
          password: document.getElementById("reg-mot-password")?.value || "",
          placa: document.getElementById("reg-mot-placa")?.value.trim().toUpperCase(),
          marca: document.getElementById("reg-mot-marca")?.value.trim(),
          modelo: document.getElementById("reg-mot-modelo")?.value.trim(),
          cilindraje: parseInt(document.getElementById("reg-mot-cc")?.value.trim() || "150", 10),
          numeroSoat: document.getElementById("reg-mot-soat")?.value.trim(),
          soatVigente: true
        };

        try {
          mostrarToast("Registrando motorista y verificando SOAT...", "info");
          const res = await fetch("/api/motoristas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "No se pudo registrar el motorista");
          }

          mostrarToast("¡Motorista registrado! Iniciando sesión...", "success");
          await ejecutarLogin(payload.identificacion, payload.password, "motorista");
        } catch (err) {
          mostrarToast(err.message, "error");
        }
      });
    }

    // Cerrar sesión
    if (els.btnLogout) {
      els.btnLogout.addEventListener("click", async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
          if (els.activeSessionBox) els.activeSessionBox.classList.add("hidden");
          if (els.authViews) els.authViews.classList.remove("hidden");
          mostrarToast("Sesión finalizada", "info");
        } catch {
          window.location.reload();
        }
      });
    }
  }

  verificarSesionActual();
  inicializarEventos();
})();
