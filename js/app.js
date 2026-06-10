// app.js - Router SPA, navegación de pantallas con transiciones, Splash Screen e iniciador de la app

const App = {
  activeScreenId: "catalog",

  init() {
    this.runSplashScreen();
    this.setupNavigation();
    this.setupHeaderScroll();
    
    // Iniciar iconos de Lucide inicialmente
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // --- 1. SIMULACIÓN DE SPLASH SCREEN REAL ---
  runSplashScreen() {
    const splash = document.getElementById("splash-screen");
    const loaderBar = document.getElementById("loader-bar");
    const loaderPercent = document.getElementById("loader-percent");

    if (!splash) return;

    let progress = 0;
    const intervalTime = 30; // ms
    const increment = 1;     // Porcentaje por ciclo

    const loadingInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 3) + 1; // Incrementos aleatorios para simular carga real
      if (progress >= 100) {
        progress = 100;
        clearInterval(loadingInterval);
        
        // Finalizar y dar salida animada
        setTimeout(() => {
          this.exitSplashScreen(splash);
        }, 300);
      }
      
      if (loaderBar) loaderBar.style.width = `${progress}%`;
      if (loaderPercent) loaderPercent.innerText = `${progress}%`;
    }, intervalTime);
  },

  exitSplashScreen(splash) {
    splash.classList.add("exit-animation");

    // Esperar a que la cortina en diagonal termine de abrirse (800ms)
    setTimeout(() => {
      splash.style.display = "none";
      document.body.classList.remove("loading-state");

      // Comprobar sesión
      const usuarioLogueado = DB.getSesionActiva();
      if (usuarioLogueado) {
        this.showAppLayout(usuarioLogueado.nombre);
        this.navigateTo("catalog", false);
      } else {
        this.hideAppLayout();
        this.navigateTo("auth", false);
      }
    }, 800);
  },

  // Mostrar / Ocultar el Header y Contenedores Principales
  showAppLayout(userName) {
    const header = document.getElementById("app-header");
    const container = document.getElementById("spa-container");
    const userDisplay = document.getElementById("user-name-display");

    if (header) header.classList.remove("hidden");
    if (container) container.classList.remove("hidden");
    if (userDisplay) userDisplay.innerText = userName;

    // Control de visibilidad del menú para Administradores
    const activeUser = DB.getSesionActiva();
    const isAdmin = activeUser && activeUser.usuario === "admin";
    
    const adminLinks = document.querySelectorAll('.nav-link[data-target="admin"], .nav-link[data-target="history"]');
    adminLinks.forEach(link => {
      const parentLi = link.closest("li");
      if (parentLi) {
        parentLi.style.display = isAdmin ? "" : "none";
      }
    });
  },

  hideAppLayout() {
    const header = document.getElementById("app-header");
    const container = document.getElementById("spa-container");

    if (header) header.classList.add("hidden");
    if (container) container.classList.remove("hidden"); // El contenedor de Auth también vive dentro del spa-container
  },

  // --- 2. LOGICA DE NAVEGACION SPA ---
  setupNavigation() {
    // Enlaces de la Sidebar
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = link.getAttribute("data-target");
        if (target) {
          this.navigateTo(target);
          this.closeSidebar();
        }
      });
    });

    // Logo Home click
    const logoHome = document.getElementById("brand-logo-home");
    if (logoHome) {
      logoHome.addEventListener("click", (e) => {
        e.preventDefault();
        if (DB.getSesionActiva()) {
          this.navigateTo("catalog");
        }
      });
    }

    // Sidebar Toggles
    const toggleBtn = document.getElementById("sidebar-toggle");
    const closeBtn = document.getElementById("sidebar-close-btn");
    const overlay = document.getElementById("sidebar-overlay");

    if (toggleBtn) toggleBtn.addEventListener("click", () => this.openSidebar());
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeSidebar());
    if (overlay) overlay.addEventListener("click", () => {
      this.closeSidebar();
      if (typeof Cart !== 'undefined') Cart.closeCart();
    });

    // Cerrar sesión
    const logoutBtn = document.getElementById("sidebar-logout-btn");
    const profileBtn = document.getElementById("user-profile-nav");

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.logout());
    }

    if (profileBtn) {
      profileBtn.addEventListener("click", () => {
        // Al hacer click en el usuario en nav, preguntar si quiere salir
        const activeUser = DB.getSesionActiva();
        if (activeUser) {
          UI.showModal(
            "CERRAR SESIÓN",
            `<p>¿Deseas cerrar la sesión del usuario <strong>${activeUser.nombre}</strong> (@${activeUser.usuario})?</p>`,
            `
              <button class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
              <button class="btn btn-primary" onclick="App.logout(); UI.closeModal();">Sí, Salir</button>
            `
          );
        }
      });
    }
  },

  navigateTo(screenId, animate = true) {
    const targetScreen = document.getElementById(`screen-${screenId}`);
    const activeScreen = document.getElementById(`screen-${this.activeScreenId}`);

    if (!targetScreen) return;

    // Control de seguridad: Acceso exclusivo de administrador para Admin e Historial
    if (screenId === "admin" || screenId === "history") {
      const activeUser = DB.getSesionActiva();
      if (!activeUser || activeUser.usuario !== "admin") {
        UI.showToast("Acceso restringido: Se requieren privilegios de Administrador", "error");
        return;
      }
    }
    
    // Si ya estamos en esta pantalla, no hacer nada (excepto si es inicial)
    if (this.activeScreenId === screenId && activeScreen && activeScreen.classList.contains("active")) {
      return;
    }

    // Cerrar el carrito por si acaso
    if (typeof Cart !== 'undefined') Cart.closeCart();

    const switchScreens = () => {
      // Remover clase activa de todas las pantallas
      document.querySelectorAll(".spa-screen").forEach(screen => {
        screen.classList.remove("active", "screen-reveal-in", "screen-sweep-out");
      });

      // Ocultar elementos stagger anteriores
      document.querySelectorAll(".stagger-item").forEach(item => {
        item.classList.remove("visible");
      });

      // Activar nueva pantalla
      targetScreen.classList.add("active");
      this.activeScreenId = screenId;

      // Actualizar links activos de navegación
      document.querySelectorAll(".nav-link").forEach(link => {
        if (link.getAttribute("data-target") === screenId) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });

      // Actualizar Breadcrumbs
      this.updateBreadcrumbs(screenId);

      // Gatillar animación geométrica clip-path si es animado
      if (animate) {
        targetScreen.classList.add("screen-reveal-in");
      }

      // Activar stagger animations en cascada
      setTimeout(() => {
        targetScreen.querySelectorAll(".stagger-item").forEach(item => {
          item.classList.add("visible");
        });
      }, 50);

      // Cargar / Inicializar componentes de pantallas específicas
      this.onScreenLoaded(screenId);
    };

    if (animate && activeScreen && activeScreen.classList.contains("active")) {
      // Animación de salida de la pantalla actual
      activeScreen.classList.add("screen-sweep-out");
      setTimeout(() => {
        switchScreens();
      }, 400); // Duración de sweep-out
    } else {
      switchScreens();
    }
  },

  onScreenLoaded(screenId) {
    // Gatillo para pantallas específicas
    if (screenId === "catalog" && typeof Catalog !== 'undefined') {
      Catalog.renderCatalog();
    }
    if (screenId === "scanner" && typeof Scanner !== 'undefined') {
      Scanner.initScannerScreen();
    }
    if (screenId === "history" && typeof HistoryScreen !== 'undefined') {
      HistoryScreen.loadHistoryScreen();
    }
    if (screenId === "admin" && typeof Admin !== 'undefined') {
      Admin.initAdminScreen();
    }

    // Recargar iconos lucide inyectados
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  updateBreadcrumbs(screenId) {
    const container = document.getElementById("breadcrumbs");
    if (!container) return;

    let text = "Inicio";
    if (screenId === "catalog") text = "Inicio > Catálogo";
    if (screenId === "scanner") text = "Inicio > Escáner";
    if (screenId === "history") text = "Inicio > Historial";
    if (screenId === "admin") text = "Inicio > Registro Stock";
    if (screenId === "auth") text = "Autenticación";

    container.innerHTML = `<span class="breadcrumb-item">${text}</span>`;
  },

  // --- 3. CONTROLES DEL SIDEBAR ---
  openSidebar() {
    const sidebar = document.getElementById("app-sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    if (sidebar) sidebar.classList.add("open");
    if (overlay) overlay.classList.add("open");
  },

  closeSidebar() {
    const sidebar = document.getElementById("app-sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    if (sidebar) sidebar.classList.remove("open");
    // Solo cerrar overlay si el carrito no está abierto también
    const cart = document.getElementById("cart-drawer");
    const isCartOpen = cart && cart.classList.contains("open");
    
    if (overlay && !isCartOpen) overlay.classList.remove("open");
  },

  // --- 4. EFECTOS EN HEADER AL HACER SCROLL ---
  setupHeaderScroll() {
    const header = document.getElementById("app-header");
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
  },

  // --- 5. LOGOUT ---
  logout() {
    DB.eliminarSesion();
    this.hideAppLayout();
    this.navigateTo("auth");
    UI.showToast("Sesión cerrada correctamente", "info");
  }
};

// Catalog Logic
const Catalog = {
  activeCategory: "Todos",
  searchQuery: "",
  sortType: "none",
  hasLoadedOnce: false,
  listenersSetup: false,

  init() {
    if (this.listenersSetup) return;
    
    // Búsqueda en tiempo real
    const searchInput = document.getElementById("catalog-search-input");
    const clearSearchBtn = document.getElementById("clear-search-btn");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim();
        if (clearSearchBtn) {
          clearSearchBtn.style.display = this.searchQuery ? "flex" : "none";
        }
        this.renderCatalog(false); // Renderizar sin simular delay de carga
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        this.searchQuery = "";
        clearSearchBtn.style.display = "none";
        this.renderCatalog(false);
      });
    }

    // Filtro por Categorías (FLIP)
    const filterContainer = document.getElementById("categories-filter-container");
    if (filterContainer) {
      filterContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".category-btn");
        if (!btn) return;

        // Cambiar botón activo
        filterContainer.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        this.activeCategory = btn.getAttribute("data-category");
        this.renderCatalog(true); // Usar FLIP
      });
    }

    // Selector de Ordenamiento
    const sortSelect = document.getElementById("catalog-sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.sortType = e.target.value;
        this.renderCatalog(true); // Usar FLIP
      });
    }

    this.listenersSetup = true;
  },

  async renderCatalog(useFlip = false) {
    this.init();
    
    const grid = document.getElementById("products-grid");
    if (!grid) return;

    // Obtener y filtrar productos
    let productos = await DB.getProductos();

    // Filtro Categoría
    if (this.activeCategory !== "Todos") {
      productos = productos.filter(p => p.categoria === this.activeCategory);
    }

    // Filtro Búsqueda
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      productos = productos.filter(p => 
        p.nombre.toLowerCase().includes(q) || 
        p.categoria.toLowerCase().includes(q) ||
        p.codigoBarras.includes(q)
      );
    }

    // Ordenar
    if (this.sortType === "price-asc") {
      productos.sort((a, b) => (a.precio || a.price) - (b.precio || b.price));
    } else if (this.sortType === "price-desc") {
      productos.sort((a, b) => (b.precio || b.price) - (a.precio || a.price));
    } else if (this.sortType === "name-asc") {
      productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    // Simular carga con Skeleton por primera vez
    if (!this.hasLoadedOnce) {
      grid.innerHTML = `
        <div class="skeleton-card"><div class="skeleton-image shimmer"></div><div class="skeleton-info"><div class="skeleton-line title shimmer"></div><div class="skeleton-line text shimmer"></div><div class="skeleton-line price shimmer"></div></div></div>
        <div class="skeleton-card"><div class="skeleton-image shimmer"></div><div class="skeleton-info"><div class="skeleton-line title shimmer"></div><div class="skeleton-line text shimmer"></div><div class="skeleton-line price shimmer"></div></div></div>
        <div class="skeleton-card"><div class="skeleton-image shimmer"></div><div class="skeleton-info"><div class="skeleton-line title shimmer"></div><div class="skeleton-line text shimmer"></div><div class="skeleton-line price shimmer"></div></div></div>
        <div class="skeleton-card"><div class="skeleton-image shimmer"></div><div class="skeleton-info"><div class="skeleton-line title shimmer"></div><div class="skeleton-line text shimmer"></div><div class="skeleton-line price shimmer"></div></div></div>
      `;
      this.hasLoadedOnce = true;
      setTimeout(() => {
        this.drawCards(productos, grid, false);
      }, 1000);
      return;
    }

    // FLIP Animation: Registrar posiciones previas
    let firstRects = [];
    if (useFlip) {
      const cards = Array.from(grid.querySelectorAll(".product-card"));
      firstRects = cards.map(card => ({
        id: card.getAttribute("data-id"),
        rect: card.getBoundingClientRect()
      }));
    }

    this.drawCards(productos, grid, useFlip, firstRects);
  },

  drawCards(productos, grid, useFlip, firstRects = []) {
    if (productos.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-texto-muted);">
          <i data-lucide="package-open" style="width: 48px; height: 48px; margin-bottom: 10px; stroke-width: 1;"></i>
          <p>No se encontraron prendas con los filtros activos.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    let html = "";
    productos.forEach((p, idx) => {
      // Resaltado de texto
      let displayName = p.nombre;
      if (this.searchQuery) {
        const regex = new RegExp(`(${this.searchQuery})`, "gi");
        displayName = p.nombre.replace(regex, `<span class="highlight-text" style="background: rgba(245, 166, 35, 0.25); text-shadow: 0 0 5px rgba(245, 166, 35, 0.5); border-radius: 2px; padding: 0 2px;">$1</span>`);
      }

      html += `
        <div class="product-card stagger-item visible" data-id="${p.id}" style="transition-delay: ${idx * 0.03}s;">
          <div class="product-card-img-wrapper">
            <img src="${p.imagen}" alt="${p.nombre}" class="product-card-img" loading="lazy">
            <div class="product-card-overlay">
              <button class="btn btn-primary btn-add-cart-floating" onclick="Cart.addToCart('${p.id}', event)">
                <i data-lucide="shopping-cart"></i>
                <span>Añadir</span>
              </button>
            </div>
          </div>
          <div class="product-card-info">
            <span class="product-card-category">${p.categoria}</span>
            <h3 class="product-card-name">${displayName}</h3>
            <div class="product-card-price-row">
              <span class="product-card-price">$${p.precio || p.price}</span>
              <span class="product-card-barcode-badge"><i data-lucide="barcode" style="width:10px; height:10px; display:inline-block; vertical-align:middle;"></i> ${p.codigoBarras}</span>
            </div>
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;

    // Habilitar Lucide Icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Habilitar Tilt 3D
    grid.querySelectorAll(".product-card").forEach(card => {
      if (typeof Anim !== 'undefined') Anim.applyTilt(card);
    });

    // FLIP: Invert & Play
    if (useFlip && firstRects.length > 0) {
      requestAnimationFrame(() => {
        const newCards = Array.from(grid.querySelectorAll(".product-card"));
        newCards.forEach(card => {
          const id = card.getAttribute("data-id");
          const first = firstRects.find(f => f.id === id);

          if (first) {
            const lastRect = card.getBoundingClientRect();
            const dx = first.rect.left - lastRect.left;
            const dy = first.rect.top - lastRect.top;

            if (dx !== 0 || dy !== 0) {
              // Invert
              card.style.transform = `translate(${dx}px, ${dy}px) scale(0.95)`;
              card.style.transition = "none";

              // Force reflow
              void card.offsetWidth;

              // Play
              card.style.transition = "transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)";
              card.style.transform = "translate(0px, 0px) scale(1)";
            }
          }
        });
      });
    }
  }
};

// Admin Screen Logic
const Admin = {
  listenersSetup: false,

  initAdminScreen() {
    this.setupListeners();
    this.renderPreview();
  },

  setupListeners() {
    if (this.listenersSetup) return;

    const form = document.getElementById("admin-product-form");
    const nameInput = document.getElementById("admin-prod-name");
    const categorySelect = document.getElementById("admin-prod-category");
    const priceInput = document.getElementById("admin-prod-price");
    const barcodeInput = document.getElementById("admin-prod-barcode");
    const imageInput = document.getElementById("admin-prod-image");

    if (!form) return;

    // Escuchas para actualizar la vista previa en tiempo real
    const inputs = [nameInput, categorySelect, priceInput, barcodeInput, imageInput];
    inputs.forEach(input => {
      if (input) {
        input.addEventListener("input", () => this.renderPreview());
        input.addEventListener("change", () => this.renderPreview());
      }
    });

    // Botones de sugerencias de imágenes
    const suggestions = document.querySelectorAll(".btn-suggestion-url");
    suggestions.forEach(btn => {
      btn.addEventListener("click", () => {
        const url = btn.getAttribute("data-url");
        if (imageInput) {
          imageInput.value = url;
          // Disparar evento placeholder-shown manual
          imageInput.dispatchEvent(new Event('input', { bubbles: true }));
          this.renderPreview();
        }
      });
    });

    // Formulario Submit
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveProduct(form);
    });

    this.listenersSetup = true;
  },

  renderPreview() {
    const name = document.getElementById("admin-prod-name")?.value || "Nombre de la Prenda";
    const category = document.getElementById("admin-prod-category")?.value || "CATEGORÍA";
    const price = parseFloat(document.getElementById("admin-prod-price")?.value) || 0;
    const barcode = document.getElementById("admin-prod-barcode")?.value || "0000000";
    const image = document.getElementById("admin-prod-image")?.value || "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=500&auto=format&fit=crop";

    const container = document.getElementById("admin-card-preview-container");
    if (!container) return;

    container.innerHTML = `
      <div class="product-card" style="width: 100%;">
        <div class="product-card-img-wrapper">
          <img src="${image}" alt="${name}" class="product-card-img">
          <div class="product-card-overlay">
            <button class="btn btn-primary btn-add-cart-floating" type="button" disabled>
              <i data-lucide="shopping-cart"></i>
              <span>Vista Previa</span>
            </button>
          </div>
        </div>
        <div class="product-card-info">
          <span class="product-card-category">${category}</span>
          <h3 class="product-card-name">${name}</h3>
          <div class="product-card-price-row">
            <span class="product-card-price">$${price.toFixed(2)}</span>
            <span class="product-card-barcode-badge"><i data-lucide="barcode" style="width:10px; height:10px; display:inline-block; vertical-align:middle;"></i> ${barcode}</span>
          </div>
        </div>
      </div>
    `;

    // Recargar iconos lucide en la vista previa
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Activar Tilt en la vista previa
    const previewCard = container.querySelector(".product-card");
    if (previewCard && typeof Anim !== 'undefined') {
      Anim.applyTilt(previewCard);
    }
  },

  async saveProduct(form) {
    const name = document.getElementById("admin-prod-name")?.value.trim();
    const category = document.getElementById("admin-prod-category")?.value;
    const price = parseFloat(document.getElementById("admin-prod-price")?.value);
    const barcode = document.getElementById("admin-prod-barcode")?.value.trim();
    const image = document.getElementById("admin-prod-image")?.value.trim();

    if (!name || !category || isNaN(price) || !barcode || !image) {
      UI.showToast("Todos los campos son obligatorios", "warning");
      return;
    }

    // Validar si el código de barras ya existe
    const productos = await DB.getProductos();
    const existeCodigo = productos.some(p => p.codigoBarras === barcode);

    if (existeCodigo) {
      UI.showToast("El código de barras ya existe en el catálogo", "error");
      return;
    }

    const nuevoProducto = {
      id: `prod-${Date.now()}`,
      nombre: name,
      categoria: category,
      precio: price,
      codigoBarras: barcode,
      imagen: image,
      descripcion: `Nueva prenda ${name} registrada en el catálogo de streetwear.`
    };

    // Guardar en base de datos local y nube
    await DB.guardarProducto(nuevoProducto);

    // Resetear formulario y preview
    form.reset();
    
    // Forzar actualización de etiquetas flotantes vacías disparando eventos
    form.querySelectorAll("input").forEach(input => {
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    this.renderPreview();

    // Actualizar estado del catálogo para forzar recarga en el próximo render
    Catalog.hasLoadedOnce = false;

    UI.showToast("Prenda registrada correctamente", "success");
  }
};

// Arrancar App
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});


