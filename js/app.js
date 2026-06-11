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
        this.navigateTo("home", false);
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
        const target = link.getAttribute("data-target");
        if (target) {
          e.preventDefault();
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
          this.navigateTo("home");
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

    // Detener cámara si cambiamos de pantalla
    if (typeof Scanner !== 'undefined' && Scanner.stopCameraScanner) {
      Scanner.stopCameraScanner();
    }

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
    if (screenId === "home") {
      this.loadLookbookImages();
    }
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
    if (screenId === "home") text = "Inicio";
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
  },

  // --- 6. GESTIÓN DE IMÁGENES LOOKBOOK ---
  loadLookbookImages() {
    const urls = DB.getLookbookUrls();
    const mapping = {
      "home-hero-img": urls.hero,
      "home-img-camisetas": urls.camisetas,
      "home-img-sudaderas": urls.sudaderas,
      "home-img-pants": urls.pants,
      "home-img-chamarras": urls.chamarras,
      "home-img-gorras": urls.gorras,
      "home-img-shorts": urls.shorts
    };
    for (const [id, url] of Object.entries(mapping)) {
      const img = document.getElementById(id);
      if (img && url) {
        img.src = url;
      }
    }
  }
};

// Catalog Logic
const Catalog = {
  activeCategory: "Todos",
  searchQuery: "",
  sortType: "none",
  hasLoadedOnce: false,
  listenersSetup: false,

  filterByCategoryAndNavigate(category) {
    this.activeCategory = category;
    const container = document.getElementById("categories-filter-container");
    if (container) {
      container.querySelectorAll(".category-btn").forEach(btn => {
        if (btn.getAttribute("data-category") === category) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }
    // Forzar desvanecer renderizado viejo y refrescar catálogo
    this.renderCatalog(true);
    App.navigateTo("catalog");
  },

  getCarouselImages(p) {
    const defaultSlides = {
      "Camisetas": [
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=700&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=700&auto=format&fit=crop&q=80"
      ],
      "Sudaderas": [
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=700&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=700&auto=format&fit=crop&q=80"
      ],
      "Pants": [
        "https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=700&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=700&auto=format&fit=crop&q=80"
      ],
      "Chamarras": [
        "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=700&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&auto=format&fit=crop&q=80"
      ],
      "Gorras": [
        "https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?w=700&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1534215754734-18e55d13ce35?w=700&auto=format&fit=crop&q=80"
      ],
      "Shorts": [
        "https://images.unsplash.com/photo-1539185441755-769473a23570?w=700&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=700&auto=format&fit=crop&q=80"
      ]
    };
    const categorySlides = defaultSlides[p.categoria] || [
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=700&auto=format&fit=crop&q=80"
    ];
    return [p.imagen, ...categorySlides];
  },

  async showProductDetail(productId) {
    const productos = await DB.getProductos();
    const p = productos.find(prod => prod.id === productId);
    if (!p) return;

    // Agrandar modal para detalles
    const modal = document.getElementById("general-modal");
    const content = modal?.querySelector(".modal-content");
    if (content) {
      content.style.maxWidth = "900px";
    }

    // Registrar funciones globales para interactividad
    window.moveModalCarousel = (direction) => {
      const track = document.getElementById("modal-carousel-track");
      if (!track) return;
      const slides = track.querySelectorAll(".carousel-slide");
      let activeIndex = parseInt(track.getAttribute("data-active-index") || "0");
      
      activeIndex += direction;
      if (activeIndex < 0) activeIndex = slides.length - 1;
      if (activeIndex >= slides.length) activeIndex = 0;
      
      track.setAttribute("data-active-index", activeIndex);
      track.style.transform = `translateX(-${activeIndex * (100 / slides.length)}%)`;
      
      const dots = document.querySelectorAll(".carousel-dot");
      dots.forEach((dot, idx) => {
        if (idx === activeIndex) {
          dot.classList.add("active");
          dot.style.background = "var(--color-acento)";
        } else {
          dot.classList.remove("active");
          dot.style.background = "#ccc";
        }
      });
    };

    window.selectModalSize = (size, btn) => {
      const parent = btn.parentElement;
      parent.querySelectorAll(".size-select-btn").forEach(b => {
        b.classList.remove("active");
        b.style.background = "transparent";
        b.style.borderColor = "#ccc";
        b.style.color = "var(--color-texto)";
      });
      btn.classList.add("active");
      btn.style.background = "var(--color-acento)";
      btn.style.borderColor = "var(--color-acento)";
      btn.style.color = "#fff";
    };

    window.selectModalColor = (colorName, btn) => {
      const parent = btn.closest('.color-swatches-row');
      parent.querySelectorAll('.color-swatch-btn').forEach(b => {
        b.classList.remove('active');
        b.style.outline = 'none';
        b.style.outlineOffset = '0px';
        b.style.transform = 'scale(1)';
      });
      btn.classList.add('active');
      btn.style.outline = '2.5px solid var(--color-acento)';
      btn.style.outlineOffset = '3px';
      btn.style.transform = 'scale(1.18)';
      const label = document.getElementById('color-selected-label');
      if (label) label.textContent = colorName;
    };

    const images = this.getCarouselImages(p);
    const title = p.nombre.toUpperCase();
    const bodyHTML = `
      <div class="product-detail-modal-layout" style="display: flex; gap: 30px; align-items: start; flex-wrap: wrap; text-align: left;">
        <div class="product-detail-img-wrap" style="flex: 1; min-width: 250px; background: var(--color-secundario); border: var(--border-glow); padding: 10px; position: relative;">
          <!-- Carousel Container -->
          <div class="modal-carousel-container" style="position: relative; overflow: hidden; width: 100%; height: 320px;">
            <!-- Carousel Track -->
            <div id="modal-carousel-track" data-active-index="0" style="display: flex; transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); width: 300%; height: 100%; transform: translateX(0%);">
              <div class="carousel-slide" style="width: 33.333%; height: 100%; flex-shrink: 0;"><img src="${images[0]}" alt="${p.nombre}" style="width: 100%; height: 100%; object-fit: cover;"></div>
              <div class="carousel-slide" style="width: 33.333%; height: 100%; flex-shrink: 0;"><img src="${images[1]}" alt="${p.nombre}" style="width: 100%; height: 100%; object-fit: cover;"></div>
              <div class="carousel-slide" style="width: 33.333%; height: 100%; flex-shrink: 0;"><img src="${images[2]}" alt="${p.nombre}" style="width: 100%; height: 100%; object-fit: cover;"></div>
            </div>
            
            <!-- Floating Arrows -->
            <button onclick="moveModalCarousel(-1)" style="position: absolute; top: 50%; left: 10px; transform: translateY(-50%); width: 32px; height: 32px; border-radius: 50%; border: var(--border-glow); background: rgba(255,255,255,0.85); color: var(--color-texto); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; z-index: 10;"><i data-lucide="chevron-left" style="width:18px; height:18px;"></i></button>
            <button onclick="moveModalCarousel(1)" style="position: absolute; top: 50%; right: 10px; transform: translateY(-50%); width: 32px; height: 32px; border-radius: 50%; border: var(--border-glow); background: rgba(255,255,255,0.85); color: var(--color-texto); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; z-index: 10;"><i data-lucide="chevron-right" style="width:18px; height:18px;"></i></button>
            
            <!-- Indicators / Dots -->
            <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; z-index: 10;">
              <span class="carousel-dot active" style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-acento); transition: 0.2s; display: inline-block;"></span>
              <span class="carousel-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #ccc; transition: 0.2s; display: inline-block;"></span>
              <span class="carousel-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #ccc; transition: 0.2s; display: inline-block;"></span>
            </div>
          </div>
        </div>
        <div class="product-detail-info" style="flex: 1.2; min-width: 250px; display: flex; flex-direction: column; gap: 15px;">
          <span style="font-family: var(--font-body); font-size: 0.75rem; font-weight: 700; letter-spacing: 2px; color: var(--color-texto-muted); text-transform: uppercase;">${p.categoria}</span>
          <h2 style="font-family: var(--font-title); font-size: 1.6rem; font-weight: 800; color: var(--color-texto); line-height: 1.1; margin: 0;">${p.nombre}</h2>
          <span style="font-family: var(--font-title); font-size: 1.4rem; font-weight: 700; color: var(--color-acento);">$${p.precio || p.price} MXN</span>
          
          <!-- Selección de Talla -->
          <div class="selector-group" style="margin-top: 5px;">
            <span style="font-family: var(--font-body); font-size: 0.8rem; font-weight: 700; color: var(--color-texto); display: block; margin-bottom: 8px;">TALLA</span>
            <div style="display: flex; gap: 8px;">
              <button class="size-select-btn active" onclick="selectModalSize('S', this)" style="width: 40px; height: 40px; border: 1.5px solid var(--color-acento); background: var(--color-acento); color: #fff; font-family: var(--font-body); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: 0.2s;">S</button>
              <button class="size-select-btn" onclick="selectModalSize('M', this)" style="width: 40px; height: 40px; border: 1.5px solid #ccc; background: transparent; color: var(--color-texto); font-family: var(--font-body); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: 0.2s;">M</button>
              <button class="size-select-btn" onclick="selectModalSize('L', this)" style="width: 40px; height: 40px; border: 1.5px solid #ccc; background: transparent; color: var(--color-texto); font-family: var(--font-body); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: 0.2s;">L</button>
              <button class="size-select-btn" onclick="selectModalSize('XL', this)" style="width: 40px; height: 40px; border: 1.5px solid #ccc; background: transparent; color: var(--color-texto); font-family: var(--font-body); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: 0.2s;">XL</button>
            </div>
          </div>

          <!-- Selección de Color Dinámica -->
          <div class="selector-group" style="margin-top: 5px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-family: var(--font-body); font-size: 0.8rem; font-weight: 700; color: var(--color-texto); text-transform: uppercase; letter-spacing: 1px;">Color</span>
              <span id="color-selected-label" style="font-family: var(--font-body); font-size: 0.8rem; font-weight: 600; color: var(--color-acento); transition: 0.2s;">${(p.colores && p.colores[0]) ? p.colores[0].nombre : '—'}</span>
            </div>
            <div class="color-swatches-row" style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
              ${(p.colores || []).map((c, i) => `
                <button
                  class="color-swatch-btn${i === 0 ? ' active' : ''}"
                  title="${c.nombre}"
                  onclick="selectModalColor('${c.nombre}', this)"
                  style="
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: ${c.hex};
                    border: 2px solid rgba(255,255,255,0.18);
                    cursor: pointer;
                    transition: transform 0.18s ease, outline 0.18s ease;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.28);
                    ${i === 0 ? 'outline: 2.5px solid var(--color-acento); outline-offset: 3px; transform: scale(1.18);' : ''}
                    flex-shrink: 0;
                  "
                ></button>
              `).join('')}
            </div>
          </div>

          <div style="border-top: 1px solid rgba(0,0,0,0.08); padding-top: 15px; margin-top: 5px;">
            <p style="font-family: var(--font-body); font-size: 0.9rem; line-height: 1.6; color: var(--color-texto-muted); margin-bottom: 10px;">
              ${p.descripcion || "Sin descripción disponible."}
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 10px; font-size: 0.8rem; color: var(--color-texto-muted);">
            <i data-lucide="barcode" style="width: 16px; height: 16px;"></i>
            <span>Código de Barras: <strong>${p.codigoBarras}</strong></span>
          </div>
        </div>
      </div>
    `;

    const footerHTML = `
      <button class="btn btn-outline" onclick="UI.closeModal()">Cerrar</button>
      <button class="btn btn-primary" onclick="const size = document.querySelector('.size-select-btn.active')?.innerText || 'M'; const color = document.getElementById('color-selected-label')?.textContent || '${(p.colores && p.colores[0]) ? p.colores[0].nombre : 'N/A'}'; Cart.addToCart('${p.id}', null, size, color); UI.closeModal();">
        <i data-lucide="shopping-cart" style="width:16px; height:16px; display:inline-block; vertical-align:middle; margin-right:8px;"></i>
        Añadir al Carrito
      </button>
    `;

    UI.showModal(title, bodyHTML, footerHTML);
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

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
        <div class="product-card stagger-item visible" data-id="${p.id}" onclick="Catalog.showProductDetail('${p.id}')" style="transition-delay: ${idx * 0.03}s;">
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
  uploadedImageBase64: "",

  initAdminScreen() {
    this.setupListeners();
    this.renderPreview();
    this.setupImageTab();
  },

  switchTab(tabId) {
    const tabProd = document.getElementById("admin-tab-prod");
    const tabImages = document.getElementById("admin-tab-images");
    const panelProd = document.getElementById("admin-panel-prod");
    const panelImages = document.getElementById("admin-panel-images");

    if (tabId === "prod") {
      tabProd?.classList.add("active");
      tabImages?.classList.remove("active");
      if (panelProd) {
        panelProd.style.display = "";
        panelProd.classList.add("active");
      }
      if (panelImages) {
        panelImages.style.display = "none";
        panelImages.classList.remove("active");
      }
    } else if (tabId === "images") {
      tabProd?.classList.remove("active");
      tabImages?.classList.add("active");
      if (panelProd) {
        panelProd.style.display = "none";
        panelProd.classList.remove("active");
      }
      if (panelImages) {
        panelImages.style.display = "";
        panelImages.classList.add("active");
      }
    }
  },

  async setupImageTab() {
    // 1. Cargar URLs de Lookbook y llenar los inputs
    const lookbook = DB.getLookbookUrls();
    const mapping = {
      "edit-img-hero": lookbook.hero,
      "edit-img-camisetas": lookbook.camisetas,
      "edit-img-sudaderas": lookbook.sudaderas,
      "edit-img-pants": lookbook.pants,
      "edit-img-chamarras": lookbook.chamarras,
      "edit-img-gorras": lookbook.gorras,
      "edit-img-shorts": lookbook.shorts
    };
    for (const [id, val] of Object.entries(mapping)) {
      const input = document.getElementById(id);
      if (input) {
        input.value = val || "";
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    // 2. Cargar prendas en el select
    const select = document.getElementById("edit-prod-select");
    if (select) {
      const currentSelected = select.value;
      select.innerHTML = '<option value="" disabled selected hidden></option>';
      
      const productos = await DB.getProductos();
      productos.forEach(p => {
        const option = document.createElement("option");
        option.value = p.id;
        option.textContent = `${p.nombre} (${p.codigoBarras})`;
        select.appendChild(option);
      });

      if (currentSelected && productos.some(p => p.id === currentSelected)) {
        select.value = currentSelected;
      } else {
        select.value = "";
      }
      this.loadSelectedProductImage();
    }
  },

  async loadSelectedProductImage() {
    const select = document.getElementById("edit-prod-select");
    const productId = select?.value;
    const preview = document.getElementById("selected-prod-img-preview");
    const placeholder = document.getElementById("selected-prod-img-placeholder");
    const urlInput = document.getElementById("edit-prod-image-url");

    if (!productId) {
      if (preview) preview.style.display = "none";
      if (placeholder) placeholder.style.display = "";
      if (urlInput) {
        urlInput.value = "";
        urlInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      return;
    }

    const productos = await DB.getProductos();
    const prod = productos.find(p => p.id === productId);
    if (prod) {
      if (preview) {
        preview.src = prod.imagen;
        preview.style.display = "block";
      }
      if (placeholder) placeholder.style.display = "none";
      if (urlInput) {
        urlInput.value = prod.imagen;
        urlInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else {
      if (preview) preview.style.display = "none";
      if (placeholder) placeholder.style.display = "";
      if (urlInput) {
        urlInput.value = "";
        urlInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  },

  saveLookbook() {
    const urls = {
      hero: document.getElementById("edit-img-hero")?.value.trim(),
      camisetas: document.getElementById("edit-img-camisetas")?.value.trim(),
      sudaderas: document.getElementById("edit-img-sudaderas")?.value.trim(),
      pants: document.getElementById("edit-img-pants")?.value.trim(),
      chamarras: document.getElementById("edit-img-chamarras")?.value.trim(),
      gorras: document.getElementById("edit-img-gorras")?.value.trim(),
      shorts: document.getElementById("edit-img-shorts")?.value.trim()
    };

    if (Object.values(urls).some(url => !url)) {
      UI.showToast("Todos los campos de Lookbook son requeridos", "warning");
      return;
    }

    DB.saveLookbookUrls(urls);
    if (typeof App.loadLookbookImages === 'function') {
      App.loadLookbookImages();
    }
    UI.showToast("Portadas del Lookbook actualizadas correctamente", "success");
  },

  async saveProductImage() {
    const select = document.getElementById("edit-prod-select");
    const productId = select?.value;
    const newUrl = document.getElementById("edit-prod-image-url")?.value.trim();

    if (!productId) {
      UI.showToast("Selecciona una prenda válida", "warning");
      return;
    }
    if (!newUrl) {
      UI.showToast("Por favor ingresa la nueva URL de la imagen", "warning");
      return;
    }

    const success = await DB.updateProductImage(productId, newUrl);
    if (success) {
      UI.showToast("Imagen de prenda actualizada correctamente", "success");
      if (typeof Catalog !== 'undefined') {
        Catalog.hasLoadedOnce = false;
      }
      this.loadSelectedProductImage();
    } else {
      UI.showToast("No se pudo actualizar la imagen", "error");
    }
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

    // Formulario Lookbook Submit
    const lookbookForm = document.getElementById("admin-lookbook-form");
    if (lookbookForm) {
      lookbookForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveLookbook();
      });
    }

    // Formulario Producto Image Submit
    const prodImgForm = document.getElementById("admin-prod-images-form");
    if (prodImgForm) {
      prodImgForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveProductImage();
      });
    }

    // Lector de archivo de imagen local y Drag-and-drop
    const fileInput = document.getElementById("admin-prod-image-file");
    const dropzone = document.getElementById("admin-prod-file-dropzone");
    const uploadStatus = document.getElementById("file-upload-status");

    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.uploadedImageBase64 = event.target.result;
            // Limpiar el input de la URL si se sube archivo
            if (imageInput) {
              imageInput.value = "";
              imageInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (uploadStatus) uploadStatus.textContent = file.name;
            if (dropzone) {
              dropzone.style.borderColor = "#2ecc71";
              dropzone.style.background = "rgba(46, 204, 113, 0.05)";
            }
            this.renderPreview();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (dropzone && fileInput) {
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.style.borderColor = "var(--color-acento)";
          dropzone.style.background = "rgba(0,0,0,0.05)";
        }, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          if (eventName === 'dragleave') {
            dropzone.style.borderColor = "#ccc";
            dropzone.style.background = "rgba(0,0,0,0.01)";
          }
        }, false);
      });

      dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
          fileInput.files = files;
          fileInput.dispatchEvent(new Event('change'));
        }
      }, false);
    }

    if (imageInput) {
      imageInput.addEventListener("input", () => {
        if (imageInput.value.trim()) {
          this.uploadedImageBase64 = "";
          if (fileInput) fileInput.value = "";
          if (uploadStatus) uploadStatus.textContent = "Seleccionar archivo...";
          if (dropzone) {
            dropzone.style.borderColor = "#ccc";
            dropzone.style.background = "rgba(0,0,0,0.01)";
          }
        }
      });
    }

    this.listenersSetup = true;
  },

  renderPreview() {
    const name = document.getElementById("admin-prod-name")?.value || "Nombre de la Prenda";
    const category = document.getElementById("admin-prod-category")?.value || "CATEGORÍA";
    const price = parseFloat(document.getElementById("admin-prod-price")?.value) || 0;
    const barcode = document.getElementById("admin-prod-barcode")?.value || "0000000";
    const imageInputVal = document.getElementById("admin-prod-image")?.value.trim();
    const image = this.uploadedImageBase64 || imageInputVal || "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=500&auto=format&fit=crop";

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
    const image = this.uploadedImageBase64 || document.getElementById("admin-prod-image")?.value.trim();

    if (!name || !category || isNaN(price) || !barcode || !image) {
      UI.showToast("Todos los campos son obligatorios (incluyendo la imagen)", "warning");
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
    this.uploadedImageBase64 = "";
    const uploadStatus = document.getElementById("file-upload-status");
    if (uploadStatus) uploadStatus.textContent = "Seleccionar archivo...";
    const dropzone = document.getElementById("admin-prod-file-dropzone");
    if (dropzone) {
      dropzone.style.borderColor = "#ccc";
      dropzone.style.background = "rgba(0,0,0,0.01)";
    }
    
    // Forzar actualización de etiquetas flotantes vacías disparando eventos
    form.querySelectorAll("input").forEach(input => {
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    this.renderPreview();

    // Actualizar estado del catálogo para forzar recarga en el próximo render
    Catalog.hasLoadedOnce = false;

    // Actualizar también la lista de prendas de la pestaña de imágenes para incluir la nueva
    this.setupImageTab();

    UI.showToast("Prenda registrada correctamente", "success");
  }
};

// Arrancar App
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});


