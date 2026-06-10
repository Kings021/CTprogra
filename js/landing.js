// landing.js - Cinematic animations and horizontal scroll triggers

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons initially
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // --- 1. CURSOR PERSONALIZADO INMERSIVO ---
  const cursor = document.getElementById("landing-cursor");
  const follower = document.getElementById("landing-cursor-follower");

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  if (cursor && follower) {
    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      cursor.style.left = mouseX + "px";
      cursor.style.top = mouseY + "px";
    });

    // Interpolación suave para el seguidor
    function updateFollower() {
      const dx = mouseX - followerX;
      const dy = mouseY - followerY;

      followerX += dx * 0.12;
      followerY += dy * 0.12;

      follower.style.left = followerX + "px";
      follower.style.top = followerY + "px";

      requestAnimationFrame(updateFollower);
    }
    updateFollower();

    // Eventos hover para interactivos
    const addHoverTargets = () => {
      const targets = document.querySelectorAll(".hover-target, a, button, .showcase-card");
      targets.forEach(target => {
        target.addEventListener("mouseenter", () => {
          document.body.classList.add("cursor-on-interactive");
        });
        target.addEventListener("mouseleave", () => {
          document.body.classList.remove("cursor-on-interactive");
        });
      });
    };
    addHoverTargets();
    // Re-evaluar hover targets dinámicamente si se agregan más tarde
    window.addEventListener("DOMNodeInserted", addHoverTargets);
  }

  // --- 2. INTRO PRELOADER Y LOGO REVEAL ---
  const loader = document.getElementById("landing-loader");
  const loaderFill = document.getElementById("loader-fill");
  const loaderPercent = document.getElementById("loader-percent");

  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 4) + 1;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      runRevealSequence();
    }
    if (loaderFill) loaderFill.style.width = `${progress}%`;
    if (loaderPercent) loaderPercent.innerText = progress;
  }, 25);

  function runRevealSequence() {
    const tl = gsap.timeline({
      onComplete: () => {
        if (loader) loader.style.display = "none";
        document.body.classList.remove("loading-active");
        
        // Re-iniciar ScrollTriggers para recalcular posiciones tras quitar el loader
        ScrollTrigger.refresh();
      }
    });

    // 1. Mostrar títulos de carga
    tl.to(".loader-brand-title", { duration: 0.6, y: 0, opacity: 1, ease: "power3.out" })
      .to(".loader-brand-subtitle", { duration: 0.4, y: 0, opacity: 1, ease: "power3.out" }, "-=0.2")
      
      // 2. Desvanecer barra y textos
      .to(".loader-progress-wrap", { duration: 0.4, opacity: 0, ease: "power2.in" }, "+=0.2")
      .to(".loader-logo-wrap", { duration: 0.6, scale: 0.95, opacity: 0, ease: "power2.in" })
      
      // 3. Desplazar cortina de preloader
      .to(loader, { duration: 0.8, yPercent: -100, ease: "power4.inOut" })
      
      // 4. Revelar Hero Content
      .to(".landing-nav", { duration: 0.8, y: 0, opacity: 1, ease: "power3.out" }, "-=0.3")
      .to(".hero-bg-image", { duration: 1.6, scale: 1, ease: "power3.out" }, "-=0.8")
      .to(".hero-subline", { duration: 0.6, y: 0, opacity: 1, ease: "power3.out" }, "-=1.2")
      .to(".hero-main-title", { duration: 0.8, y: 0, opacity: 1, ease: "power4.out" }, "-=1.0")
      .to(".hero-description", { duration: 0.6, y: 0, opacity: 1, ease: "power3.out" }, "-=0.8")
      .to(".hero-actions", { duration: 0.6, y: 0, opacity: 1, ease: "power3.out" }, "-=0.6")
      .to(".scroll-indicator", { duration: 0.6, y: 0, opacity: 1, ease: "power3.out" }, "-=0.4");
  }

  // --- 3. ANIMACIONES DE SCROLL (GSAP + SCROLLTRIGGER) ---
  
  // Registrar plugin de ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Parallax en Imagen de Fondo Hero
  gsap.to(".hero-bg-image", {
    scrollTrigger: {
      trigger: "#landing-hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    },
    yPercent: 15,
    ease: "none"
  });

  // Parallax en imagen editorial (Concepto)
  gsap.to(".parallax-image", {
    scrollTrigger: {
      trigger: "#landing-concept",
      start: "top bottom",
      end: "bottom top",
      scrub: true
    },
    yPercent: 10,
    ease: "none"
  });

  // Revelación suave de la imagen del concepto (overlay deslizando)
  gsap.to(".img-reveal-overlay", {
    scrollTrigger: {
      trigger: "#landing-concept",
      start: "top 75%",
      toggleActions: "play none none none"
    },
    duration: 1.2,
    xPercent: 101,
    ease: "power4.inOut"
  });

  // Fade In en cascada de los textos del Concepto
  gsap.from(".concept-title", {
    scrollTrigger: {
      trigger: "#landing-concept",
      start: "top 80%"
    },
    duration: 1.0,
    y: 40,
    opacity: 0,
    ease: "power3.out"
  });

  gsap.from(".concept-body", {
    scrollTrigger: {
      trigger: "#landing-concept",
      start: "top 75%"
    },
    duration: 1.0,
    y: 30,
    opacity: 0,
    ease: "power3.out"
  });

  // --- 4. SCROLL HORIZONTAL LOOKBOOK ---
  const scrollContainer = document.getElementById("lookbook-scroll-container");
  if (scrollContainer) {
    gsap.to(scrollContainer, {
      x: () => -(scrollContainer.scrollWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: "#landing-lookbook",
        pin: true,
        scrub: 1,
        start: "top top",
        end: () => `+=${scrollContainer.scrollWidth - window.innerWidth}`,
        invalidateOnRefresh: true
      }
    });
  }

  // --- 5. RENDER Y ANIMACIONES EN SHOWCASE GRID ---
  gsap.from(".showcase-card", {
    scrollTrigger: {
      trigger: "#landing-showcase",
      start: "top 70%"
    },
    duration: 0.8,
    y: 60,
    opacity: 0,
    stagger: 0.15,
    ease: "power3.out"
  });

  // --- 6. BOTÓN MAGNÉTICO INTERACTIVO ---
  const magneticContainer = document.getElementById("magnetic-container");
  const magneticBtn = document.getElementById("magnetic-btn");
  const magneticText = magneticBtn ? magneticBtn.querySelector(".magnetic-btn-text") : null;

  if (magneticContainer && magneticBtn) {
    magneticContainer.addEventListener("mousemove", (e) => {
      const rect = magneticContainer.getBoundingClientRect();
      // Calcular coordenadas relativas al centro del contenedor magnético
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Aplicar atracción física (desplazar botón un 35% de la distancia al mouse)
      gsap.to(magneticBtn, {
        duration: 0.3,
        x: x * 0.35,
        y: y * 0.35,
        ease: "power2.out"
      });

      // El texto se desplaza un poco más lento para crear efecto 3D
      if (magneticText) {
        gsap.to(magneticText, {
          duration: 0.3,
          x: x * 0.15,
          y: y * 0.15,
          ease: "power2.out"
        });
      }
    });

    magneticContainer.addEventListener("mouseleave", () => {
      // Retorno suave a la posición inicial
      gsap.to(magneticBtn, {
        duration: 0.6,
        x: 0,
        y: 0,
        ease: "elastic.out(1, 0.4)"
      });

      if (magneticText) {
        gsap.to(magneticText, {
          duration: 0.6,
          x: 0,
          y: 0,
          ease: "elastic.out(1, 0.4)"
        });
      }
    });
  }

  // Animación del título del footer
  gsap.from(".footer-heading", {
    scrollTrigger: {
      trigger: "#landing-footer",
      start: "top 75%"
    },
    duration: 1.0,
    y: 50,
    opacity: 0,
    ease: "power3.out"
  });

  // Animación del botón magnético de entrada (escala progresiva)
  gsap.from(".magnetic-wrap", {
    scrollTrigger: {
      trigger: "#landing-footer",
      start: "top 70%"
    },
    duration: 1.2,
    scale: 0.7,
    opacity: 0,
    ease: "back.out(1.7)"
  });
});
