// auth.js - Lógica de Login, Registro, validaciones y animaciones de morphing de botón

const Auth = {
  activeTab: "login",

  init() {
    this.setupTabs();
    this.setupForms();
  },

  // --- 1. SLIDER Y CAMBIO DE TABS ---
  setupTabs() {
    const tabLogin = document.getElementById("tab-login");
    const tabRegister = document.getElementById("tab-register");
    const slider = document.querySelector(".auth-tab-slider");
    const contentSlider = document.querySelector(".auth-content-slider");
    const formLogin = document.getElementById("login-form");
    const formRegister = document.getElementById("register-form");

    if (!tabLogin || !tabRegister || !slider || !contentSlider) return;

    tabLogin.addEventListener("click", () => {
      this.activeTab = "login";
      tabLogin.classList.add("active");
      tabRegister.classList.remove("active");
      slider.style.transform = "translateX(0%)";
      contentSlider.style.transform = "translateX(0%)";
      
      formLogin.classList.add("active");
      formRegister.classList.remove("active");
    });

    tabRegister.addEventListener("click", () => {
      this.activeTab = "register";
      tabRegister.classList.add("active");
      tabLogin.classList.remove("active");
      slider.style.transform = "translateX(100%)";
      contentSlider.style.transform = "translateX(-50%)";
      
      formRegister.classList.add("active");
      formLogin.classList.remove("active");
    });
  },

  // --- 2. VALIDACIONES Y SUBMIT DE FORMULARIOS ---
  setupForms() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    if (registerForm) {
      registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }
  },

  // Lógica de Inicio de Sesión
  handleLogin() {
    const usernameInput = document.getElementById("login-username");
    const passwordInput = document.getElementById("login-password");
    const submitBtn = document.getElementById("btn-login-submit");

    if (!usernameInput || !passwordInput || !submitBtn) return;

    const username = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    // Activar morphing: Spinner de procesamiento
    submitBtn.disabled = true;
    submitBtn.classList.add("processing");

    setTimeout(async () => {
      // Buscar usuario en base de datos local
      const usuarios = await DB.getUsuarios();
      const usuarioEncontrado = usuarios.find(u => u.usuario === username && u.contrasena === password);

      if (usuarioEncontrado) {
        // Exito de validación: Cambiar a Checkmark
        submitBtn.classList.remove("processing");
        submitBtn.classList.add("success-state");

        setTimeout(() => {
          // Guardar sesión e iniciar app
          DB.setSesionActiva(usuarioEncontrado);
          App.showAppLayout(usuarioEncontrado.nombre);
          App.navigateTo("home");
          
          // Resetear estados del formulario
          loginForm.reset();
          submitBtn.disabled = false;
          submitBtn.classList.remove("success-state");
          UI.showToast(`Bienvenido, ${usuarioEncontrado.nombre}!`, "success");
        }, 800);

      } else {
        // Fallo de validación: Volver al estado normal con feedback de error
        submitBtn.disabled = false;
        submitBtn.classList.remove("processing");
        
        // Efecto de sacudida visual (shake) en la card
        const card = document.querySelector(".auth-card");
        card.style.animation = "none";
        // Provocar reflow para reiniciar animación
        void card.offsetWidth;
        card.style.animation = "shake-card 0.5s cubic-bezier(.36,.07,.19,.97) both";

        // Agregar animación shake-card en CSS de forma temporal o reproducir efecto
        UI.showToast("Usuario o contraseña incorrectos", "error");
        
        // Reset de animación en tarjeta
        setTimeout(() => {
          card.style.animation = "none";
        }, 600);
      }
    }, 1500); // Demostración del procesamiento
  },

  // Lógica de Registro de Usuario Nuevo
  handleRegister() {
    const nameInput = document.getElementById("reg-name");
    const usernameInput = document.getElementById("reg-username");
    const passwordInput = document.getElementById("reg-password");
    const passwordConfirmInput = document.getElementById("reg-password-confirm");
    const submitBtn = document.getElementById("btn-register-submit");

    if (!nameInput || !usernameInput || !passwordInput || !passwordConfirmInput || !submitBtn) return;

    const nombre = nameInput.value.trim();
    const usuario = usernameInput.value.trim().toLowerCase();
    const contrasena = passwordInput.value;
    const confirmacion = passwordConfirmInput.value;

    // Validaciones básicas
    if (contrasena !== confirmacion) {
      UI.showToast("Las contraseñas no coinciden", "warning");
      return;
    }

    if (contrasena.length < 4) {
      UI.showToast("La contraseña debe tener al menos 4 caracteres", "warning");
      return;
    }

    // Activar morphing: Spinner
    submitBtn.disabled = true;
    submitBtn.classList.add("processing");

    setTimeout(async () => {
      // Registrar usuario en DB
      const usuariosExistentes = await DB.getUsuarios();
      const duplicado = usuariosExistentes.some(u => u.usuario === usuario);
      
      if (duplicado) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("processing");
        UI.showToast("El nombre de usuario ya está registrado", "error");
        return;
      }

      const nuevoUsuario = { nombre, usuario, contrasena };
      await DB.registrarUsuario(nuevoUsuario);

      // Exito: Cambiar a Checkmark
      submitBtn.classList.remove("processing");
      submitBtn.classList.add("success-state");

      setTimeout(() => {
        // Redirigir a login tab
        const tabLogin = document.getElementById("tab-login");
        if (tabLogin) tabLogin.click();

        // Reset del formulario
        const regForm = document.getElementById("register-form");
        if (regForm) regForm.reset();

        submitBtn.disabled = false;
        submitBtn.classList.remove("success-state");
        UI.showToast("Registro exitoso! Ya puedes iniciar sesión.", "success");
      }, 800);
    }, 1500);
  }
};

// Agregar animación de sacudida (shake-card) dinámicamente si no existe
const style = document.createElement("style");
style.innerHTML = `
@keyframes shake-card {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
`;
document.head.appendChild(style);

// Inicializar al cargar el script
document.addEventListener("DOMContentLoaded", () => {
  Auth.init();
});
