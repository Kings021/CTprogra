// ui.js - Notificaciones, modales, sonidos y efectos ripple globales

const UI = {
  // Notificaciones Toast
  showToast(message, type = "info", duration = 4000) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast-item ${type}`;

    // Determinar icono según tipo
    let iconName = "info";
    if (type === "success") iconName = "check-circle";
    if (type === "warning") iconName = "alert-triangle";
    if (type === "error") iconName = "x-circle";

    toast.innerHTML = `
      <i data-lucide="${iconName}" class="toast-icon"></i>
      <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);
    
    // Inicializar icono de Lucide en el nuevo elemento
    if (window.lucide) {
      window.lucide.createIcons({
        attrs: { class: 'toast-icon' },
        nameAttr: 'data-lucide'
      });
    }

    // Temporizador de salida
    setTimeout(() => {
      toast.classList.add("exit");
      toast.addEventListener("animationend", () => {
        toast.remove();
      });
    }, duration);
  },

  // Modal General
  showModal(title, bodyHTML, footerHTML = null) {
    const modal = document.getElementById("general-modal");
    const mTitle = document.getElementById("modal-title");
    const mBody = document.getElementById("modal-body");
    const mFooter = document.getElementById("modal-footer");

    if (!modal) return;

    mTitle.innerText = title;
    mBody.innerHTML = bodyHTML;

    if (footerHTML) {
      mFooter.innerHTML = footerHTML;
      mFooter.classList.remove("hidden");
    } else {
      mFooter.innerHTML = `<button class="btn btn-outline" onclick="UI.closeModal()">Cerrar</button>`;
    }

    modal.classList.remove("hidden");
    modal.querySelector(".modal-content").classList.add("modal-content-pop");

    // Desactivar scroll en el body
    document.body.style.overflow = "hidden";
  },

  closeModal() {
    const modal = document.getElementById("general-modal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    }
  },

  // Efecto Ripple para clics en botones
  createRipple(event, element) {
    // Eliminar ripples anteriores si existen
    const existingRipples = element.querySelectorAll(".ripple");
    existingRipples.forEach(r => r.remove());

    const circle = document.createElement("span");
    const diameter = Math.max(element.clientWidth, element.clientHeight);
    const radius = diameter / 2;

    const rect = element.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    element.appendChild(circle);
  },

  // Generador de Sonido Beep con Web Audio API (Para el Escáner)
  playBeep() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = "sine";
      oscillator.frequency.value = 880; // Frecuencia del beep clásico (Nota La5)
      
      // Control de volumen rápido (Fade Out suave para evitar pops de audio)
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn("AudioContext bloqueado o no soportado por el navegador:", e);
    }
  }
};

// Configurar cierre de modal básico en carga
document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("close-modal-btn");
  const modalClose = document.getElementById("btn-modal-close");
  const modalBackdrop = document.getElementById("general-modal");

  const closeHandler = () => UI.closeModal();

  if (closeBtn) closeBtn.addEventListener("click", closeHandler);
  if (modalClose) modalClose.addEventListener("click", closeHandler);
  
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) {
        UI.closeModal();
      }
    });
  }

  // Vincular eventos ripple a todos los botones que se carguen inicialmente
  document.body.addEventListener("click", (e) => {
    const target = e.target.closest(".btn, .nav-link, .category-btn, .barcode-btn, .auth-tab-btn");
    if (target) {
      UI.createRipple(e, target);
    }
  });
});
