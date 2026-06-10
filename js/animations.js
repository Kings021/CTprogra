// animations.js - Sistema de partículas canvas, cursor trail e inclinación 3D (Tilt)

const Anim = {
  // Configuración de Partículas
  canvas: null,
  ctx: null,
  particles: [],
  particleCount: 60,
  connectionDistance: 100,
  mouse: { x: null, y: null, radius: 150 },

  // Configuración del Cursor Personalizado
  cursor: null,
  follower: null,
  mousePos: { x: -100, y: -100 },
  followerPos: { x: -100, y: -100 },
  inertia: 0.12, // Coeficiente LERP para suavizado

  init() {
    this.initCursor();
    this.initParticles();
    this.initGlobalHovers();
    
    // Escuchar redimensionamiento de pantalla
    window.addEventListener("resize", () => {
      this.resizeCanvas();
    });
  },

  // --- 1. CURSOR PERSONALIZADO ---
  initCursor() {
    this.cursor = document.getElementById("custom-cursor");
    this.follower = document.getElementById("custom-cursor-follower");

    if (!this.cursor || !this.follower) return;

    // Detectar si es dispositivo móvil o táctil
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) {
      this.cursor.style.display = "none";
      this.follower.style.display = "none";
      return;
    }

    document.addEventListener("mousemove", (e) => {
      this.mousePos.x = e.clientX;
      this.mousePos.y = e.clientY;
      
      // Actualizar posición del puntero principal de inmediato
      this.cursor.style.left = `${e.clientX}px`;
      this.cursor.style.top = `${e.clientY}px`;
    });

    // Loop de animación suavizado para el follower (Inercia)
    const updateFollower = () => {
      this.followerPos.x += (this.mousePos.x - this.followerPos.x) * this.inertia;
      this.followerPos.y += (this.mousePos.y - this.followerPos.y) * this.inertia;

      this.follower.style.left = `${this.followerPos.x}px`;
      this.follower.style.top = `${this.followerPos.y}px`;

      requestAnimationFrame(updateFollower);
    };
    updateFollower();
  },

  // Añade clases de hover al cursor al pasar por encima de elementos interactivos
  initGlobalHovers() {
    document.body.addEventListener("mouseenter", (e) => {
      const target = e.target.closest("a, button, select, input, .product-card, .barcode-btn, .category-btn, .qty-btn");
      if (target) {
        document.body.classList.add("cursor-hover");
      }
    }, true);

    document.body.addEventListener("mouseleave", (e) => {
      const target = e.target.closest("a, button, select, input, .product-card, .barcode-btn, .category-btn, .qty-btn");
      if (target) {
        document.body.classList.remove("cursor-hover");
      }
    }, true);
  },

  // --- 2. SISTEMA DE PARTÍCULAS INTERACTIVAS (CANVAS) ---
  initParticles() {
    this.canvas = document.getElementById("particles-canvas");
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();

    // Crear partículas
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(this.createParticle());
    }

    // Seguir el mouse
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener("mouseleave", () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    // Loop de renderizado del Canvas
    const render = () => {
      this.drawParticles();
      requestAnimationFrame(render);
    };
    render();
  },

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Ajustar conteo de partículas en pantallas pequeñas
    if (window.innerWidth < 768) {
      this.particleCount = 25;
      this.connectionDistance = 70;
    } else {
      this.particleCount = 60;
      this.connectionDistance = 100;
    }
  },

  createParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 2 + 1,
      baseAlpha: Math.random() * 0.5 + 0.2
    };
  },

  drawParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const length = this.particles.length;

    for (let i = 0; i < length; i++) {
      const p = this.particles[i];

      // Mover partícula
      p.x += p.vx;
      p.y += p.vy;

      // Rebotar en bordes
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      // Dibujar punto
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(233, 69, 96, ${p.baseAlpha})`;
      this.ctx.fill();

      // Interacción con mouse
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.mouse.radius) {
          // Empujar sutilmente la partícula
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p.x += (dx / dist) * force * 1.5;
          p.y += (dy / dist) * force * 1.5;
        }
      }

      // Conexión entre partículas cercanas
      for (let j = i + 1; j < length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.connectionDistance) {
          const alpha = (this.connectionDistance - dist) / this.connectionDistance * 0.15;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          // Cambiar color sutilmente entre los dos tonos de acento
          this.ctx.strokeStyle = `rgba(245, 166, 35, ${alpha})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
  },

  // --- 3. EFECTO 3D TILT EN CARDS ---
  applyTilt(card) {
    if (!card) return;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // Posición X del cursor en la card
      const y = e.clientY - rect.top;  // Posición Y del cursor en la card

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calcular diferencia e inclinación (máximo 12 grados)
      const maxTilt = 12;
      const rotateX = -((y - centerY) / centerY) * maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener("mouseleave", () => {
      // Regresar a la normalidad de forma suave
      card.style.transition = "transform 0.5s ease";
      card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
    });

    card.addEventListener("mouseenter", () => {
      // Remover transición durante el movimiento del cursor para evitar lag
      card.style.transition = "none";
    });
  }
};

// Inicializar al cargar el script
document.addEventListener("DOMContentLoaded", () => {
  Anim.init();
});
