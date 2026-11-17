// TucanGo · Lógica de Autenticación y Registro Móvil (Duolingo & iOS Style)
(function () {
  "use strict";

  // Elementos DOM
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

    // Login rápido y manual
    accountCardsList: document.getElementById("account-cards-list"),
    formLoginManual: document.getElementById("form-login-manual"),
    inputLoginId: document.getElementById("input-login-id"),
    btnLoginSubmit: document.getElementById("btn-login-submit"),

    // Registro
    formRegEstudiante: document.getElementById("form-reg-estudiante"),
    formRegMotorista: document.getElementById("form-reg-motorista"),

    // Toast
    toast: document.getElementById("portal-toast")
  };

  let loginRoleSeleccionado = "pasajero";
  let regRoleSeleccionado = "estudiante";
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
    regRoleSeleccionado = rol;
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

  async function ejecutarLogin(identificador, rol) {
    try {
      mostrarToast("Iniciando sesión segura...", "info");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador, rol })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo iniciar sesión");
      }

      mostrarToast(`¡Bienvenido, ${data.nombre}! Redirigiendo...`, "success");

      // Redirigir inmediatamente a la app con la sesión activa
      setTimeout(() => {
        window.location.href = "/app";
      }, 400);
    } catch (err) {
      mostrarToast(err.message, "error");
    }
  }

  // Inicializar estado de sesión
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
      // Si falla la verificación, mostrar formulario normalmente
      if (els.authViews) els.authViews.classList.remove("hidden");
    }
  }

  // Event Listeners
  function inicializarEventos() {
    // Switch de modo (Login vs Registro)
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

    // Cuentas rápidas estilo Duolingo
    if (els.accountCardsList) {
      els.accountCardsList.addEventListener("click", (e) => {
        const card = e.target.closest(".account-card");
        if (!card) return;
        const id = card.dataset.accountId;
        const rol = card.dataset.accountRole;
        if (id && rol) {
          ejecutarLogin(id, rol);
        }
      });
    }

    // Selector de rol para login manual
    const loginRoleBtns = document.querySelectorAll("[data-login-role]");
    loginRoleBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        loginRoleBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        loginRoleSeleccionado = btn.dataset.loginRole;
        if (els.inputLoginId) {
          els.inputLoginId.placeholder =
            loginRoleSeleccionado === "motorista" ? "Ej. 2001 o GNX-45F" : "Ej. 1001 o c.rivera@uniamazonia.edu.co";
        }
      });
    });

    // Formulario de login manual
    if (els.formLoginManual) {
      els.formLoginManual.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = els.inputLoginId ? els.inputLoginId.value.trim() : "";
        if (!id) {
          mostrarToast("Ingresa tu cédula, código o placa", "error");
          return;
        }
        ejecutarLogin(id, loginRoleSeleccionado);
      });
    }

    // Selector de rol para registro
    const regRoleBtns = document.querySelectorAll("[data-reg-role]");
    regRoleBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        cambiarRolRegistro(btn.dataset.regRole);
      });
    });

    // Formulario de registro de estudiante
    if (els.formRegEstudiante) {
      els.formRegEstudiante.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
          identificacion: document.getElementById("reg-est-id")?.value.trim(),
          codigoEstudiantil: document.getElementById("reg-est-cod")?.value.trim(),
          nombre: document.getElementById("reg-est-nombre")?.value.trim(),
          telefono: document.getElementById("reg-est-tel")?.value.trim(),
          correoInstitucional: document.getElementById("reg-est-correo")?.value.trim(),
          carrera: document.getElementById("reg-est-carrera")?.value.trim()
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

          mostrarToast("¡Registro exitoso! Iniciando sesión...", "success");
          // Iniciar sesión automáticamente
          await ejecutarLogin(payload.identificacion, "pasajero");
        } catch (err) {
          mostrarToast(err.message, "error");
        }
      });
    }

    // Formulario de registro de motorista + moto
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

          mostrarToast("¡Registro exitoso! Iniciando sesión...", "success");
          // Iniciar sesión automáticamente
          await ejecutarLogin(payload.identificacion, "motorista");
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

  // Arranque
  verificarSesionActual();
  inicializarEventos();
})();
