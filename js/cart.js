// cart.js - Gestión del carrito de compras, animación fly-to-cart, badges y pasarela de pago

const Cart = {
  items: [], // [{producto, cantidad}]
  descuentoPorcentaje: 0,
  codigoAplicado: "",
  totalActual: 0,

  init() {
    this.setupListeners();
    this.loadCartFromSession();
    this.updateBadge();
  },

  setupListeners() {
    // Abrir/Cerrar Cart Drawer
    const cartToggle = document.getElementById("cart-toggle-nav");
    const cartClose = document.getElementById("cart-close-btn");
    const cartBack = document.getElementById("btn-cart-empty-back");
    const overlay = document.getElementById("sidebar-overlay");

    if (cartToggle) {
      cartToggle.addEventListener("click", (e) => {
        e.preventDefault();
        this.openCart();
      });
    }

    if (cartClose) cartClose.addEventListener("click", () => this.closeCart());
    if (cartBack) cartBack.addEventListener("click", () => this.closeCart());

    // Cupones
    const applyPromoBtn = document.getElementById("btn-apply-promo");
    if (applyPromoBtn) {
      applyPromoBtn.addEventListener("click", () => this.applyPromoCode());
    }

    // Pagar / Finalizar Compra
    const payBtn = document.getElementById("btn-checkout-pay");
    if (payBtn) {
      payBtn.addEventListener("click", () => this.checkout());
    }
  },

  loadCartFromSession() {
    const savedCart = sessionStorage.getItem("ct_cart");
    if (savedCart) {
      this.items = JSON.parse(savedCart);
    }
  },

  saveCartToSession() {
    sessionStorage.setItem("ct_cart", JSON.stringify(this.items));
  },

  // --- 1. ABRIR Y CERRAR DRAWER ---
  openCart() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("sidebar-overlay");

    if (drawer) drawer.classList.add("open");
    if (overlay) overlay.classList.add("open");

    // Cerrar sidebar si está abierta
    if (typeof App !== 'undefined') App.closeSidebar();

    this.renderCart();
  },

  closeCart() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("sidebar-overlay");
    const sidebar = document.getElementById("app-sidebar");

    if (drawer) drawer.classList.remove("open");
    
    // Solo cerrar overlay si el menú lateral tampoco está abierto
    const isSidebarOpen = sidebar && sidebar.classList.contains("open");
    if (overlay && !isSidebarOpen) overlay.classList.remove("open");
  },

  // --- 2. AÑADIR PRODUCTO Y ANIMACIÓN VOLADORA ---
  async addToCart(productId, event = null, talla = null, color = null) {
    if (event) {
      event.stopPropagation();
    }
    const productos = await DB.getProductos();
    const producto = productos.find(p => p.id === productId);
    
    if (!producto) return;

    const finalTalla = talla || "M";
    const finalColor = color || "Negro";

    // Verificar si el item ya está en el carrito con la misma talla y color
    const itemExistente = this.items.find(item => 
      item.producto.id === productId && 
      (item.talla || "M") === finalTalla && 
      (item.color || "Negro") === finalColor
    );

    if (itemExistente) {
      itemExistente.cantidad++;
    } else {
      this.items.push({ 
        producto, 
        cantidad: 1, 
        talla: finalTalla, 
        color: finalColor 
      });
    }

    this.saveCartToSession();
    this.updateBadge();

    // Si se gatilló desde un click (evento), lanzar animación fly-to-cart
    if (event) {
      // Intentar encontrar la card o el botón
      const card = event.target.closest(".product-card");
      const button = event.target.closest("button");
      
      // Aplicar bounce de impacto a la tarjeta del producto
      if (card) {
        card.classList.add("card-bounce-anim");
        card.addEventListener("animationend", () => {
          card.classList.remove("card-bounce-anim");
        }, { once: true });
      }

      this.animateFlyToCart(producto.imagen, button || event.target);
      UI.showToast(`Añadido: ${producto.nombre} (${finalTalla} / ${finalColor})`, "success", 2000);
    } else {
      // Si se añade directo (ej. scanner), notificar de igual forma
      this.animateBadgePop();
    }

    this.renderCart();
  },

  animateFlyToCart(imageSrc, triggerElement) {
    const cartIcon = document.getElementById("cart-toggle-nav");
    if (!cartIcon || !triggerElement) return;

    // Obtener rectángulos de origen y destino
    const startRect = triggerElement.getBoundingClientRect();
    const endRect = cartIcon.getBoundingClientRect();

    // Crear el elemento volador
    const flyer = document.createElement("div");
    flyer.className = "flying-item";
    flyer.style.backgroundImage = `url(${imageSrc})`;
    flyer.style.top = `${startRect.top}px`;
    flyer.style.left = `${startRect.left}px`;

    // Configurar coordenadas del arco
    const flyX = endRect.left - startRect.left + (endRect.width / 2) - (startRect.width / 2);
    const flyY = endRect.top - startRect.top + (endRect.height / 2) - (startRect.height / 2);

    flyer.style.setProperty("--fly-x", `${flyX}px`);
    flyer.style.setProperty("--fly-y", `${flyY}px`);

    document.body.appendChild(flyer);

    // Eliminar tras animación y hacer pop al badge
    flyer.addEventListener("animationend", () => {
      flyer.remove();
      this.animateBadgePop();
    });
  },

  animateBadgePop() {
    const badge = document.getElementById("cart-badge-count");
    if (badge) {
      badge.classList.add("badge-pop");
      badge.addEventListener("animationend", () => {
        badge.classList.remove("badge-pop");
      }, { once: true });
    }
  },

  updateBadge() {
    const badge = document.getElementById("cart-badge-count");
    if (!badge) return;

    const totalItems = this.items.reduce((sum, item) => sum + item.cantidad, 0);
    badge.innerText = totalItems;
    
    if (totalItems === 0) {
      badge.style.display = "none";
    } else {
      badge.style.display = "flex";
    }
  },

  // --- 3. CAMBIAR CANTIDADES Y ELIMINAR ---
  updateQuantity(itemKey, newQty) {
    if (newQty <= 0) {
      this.removeItemWithAnim(itemKey);
      return;
    }

    const item = this.items.find(i => {
      const key = i.producto.id + "_" + (i.talla || "M") + "_" + (i.color || "Negro");
      return key === itemKey;
    });
    if (item) {
      item.cantidad = newQty;
      this.saveCartToSession();
      this.updateBadge();
      this.renderCart();
    }
  },

  removeItemWithAnim(itemKey) {
    const itemEl = document.querySelector(`.cart-item[data-key="${itemKey}"]`);
    if (itemEl) {
      // Iniciar colapso y desvanecimiento
      itemEl.style.opacity = "0";
      itemEl.style.maxHeight = "0";
      itemEl.style.padding = "0";
      itemEl.style.margin = "0";
      itemEl.style.border = "none";

      setTimeout(() => {
        this.items = this.items.filter(i => {
          const key = i.producto.id + "_" + (i.talla || "M") + "_" + (i.color || "Negro");
          return key !== itemKey;
        });
        this.saveCartToSession();
        this.updateBadge();
        this.renderCart();
      }, 400); // Duración de transición
    } else {
      this.items = this.items.filter(i => {
        const key = i.producto.id + "_" + (i.talla || "M") + "_" + (i.color || "Negro");
        return key !== itemKey;
      });
      this.saveCartToSession();
      this.updateBadge();
      this.renderCart();
    }
  },

  // --- 4. CUPONES DE DESCUENTO ---
  applyPromoCode() {
    const input = document.getElementById("cart-promo-code");
    const msg = document.getElementById("promo-msg");

    if (!input || !msg) return;

    const code = input.value.trim().toUpperCase();

    if (code === "") {
      msg.className = "promo-feedback-msg error";
      msg.innerText = "Por favor ingresa un código.";
      return;
    }

    if (code === "VIP20") {
      this.descuentoPorcentaje = 20;
      this.codigoAplicado = code;
      msg.className = "promo-feedback-msg success";
      msg.innerText = "Código VIP20 aplicado (20% de descuento).";
      UI.showToast("Cupón VIP20 de 20% aplicado", "success");
    } else if (code === "CT10") {
      this.descuentoPorcentaje = 10;
      this.codigoAplicado = code;
      msg.className = "promo-feedback-msg success";
      msg.innerText = "Código CT10 aplicado (10% de descuento).";
      UI.showToast("Cupón CT10 de 10% aplicado", "success");
    } else {
      this.descuentoPorcentaje = 0;
      this.codigoAplicado = "";
      msg.className = "promo-feedback-msg error";
      msg.innerText = "Código inválido o expirado.";
      UI.showToast("Código promocional inválido", "error");
    }

    this.calculateTotals();
  },

  // --- 5. CALCULAR CON EFECTO DE CONTADOR DINÁMICO (Slot Machine/Roll) ---
  calculateTotals() {
    const subtotal = this.items.reduce((sum, item) => sum + (item.producto.price || item.producto.precio) * item.cantidad, 0);
    const descuento = subtotal * (this.descuentoPorcentaje / 100);
    const total = subtotal - descuento;

    // Desglose en UI
    document.getElementById("cart-summary-subtotal").innerText = `$${subtotal.toFixed(2)}`;

    const discountRow = document.getElementById("discount-summary-row");
    if (this.descuentoPorcentaje > 0) {
      document.getElementById("discount-percent-label").innerText = this.descuentoPorcentaje;
      document.getElementById("cart-summary-discount").innerText = `-$${descuento.toFixed(2)}`;
      if (discountRow) discountRow.classList.remove("hidden");
    } else {
      if (discountRow) discountRow.classList.add("hidden");
    }

    // Animar total (efecto rodante digital)
    this.animateTotalValue(this.totalActual, total);
    this.totalActual = total;
  },

  animateTotalValue(oldVal, newVal) {
    const display = document.getElementById("cart-summary-total");
    if (!display) return;

    const duration = 500; // ms
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Interpolación lineal
      const currentVal = oldVal + (newVal - oldVal) * progress;
      display.innerText = currentVal.toFixed(2);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        display.innerText = newVal.toFixed(2);
      }
    };

    requestAnimationFrame(updateCount);
  },

  // --- 6. RENDERIZACIÓN DE PRODUCTOS EN CARRITO ---
  renderCart() {
    const container = document.getElementById("cart-items-container");
    const footer = document.getElementById("cart-footer-details");

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="empty-cart-state" id="empty-cart-state">
          <i data-lucide="shopping-cart" class="empty-cart-icon"></i>
          <p class="empty-cart-text">El carrito está vacío</p>
          <button class="btn btn-primary btn-sm btn-catalog-back" onclick="Cart.closeCart()">Volver al Catálogo</button>
        </div>
      `;
      if (footer) footer.classList.add("hidden");
      this.updateBadge();
      
      // Volver a renderizar iconos vacíos de Lucide
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    if (footer) footer.classList.remove("hidden");

    let html = "";
    this.items.forEach(item => {
      const p = item.producto;
      const precioUnitario = p.price || p.precio;
      const talla = item.talla || "M";
      const color = item.color || "Negro";
      const itemKey = `${p.id}_${talla}_${color}`;
      
      html += `
        <div class="cart-item" data-key="${itemKey}">
          <img src="${p.imagen}" alt="${p.nombre}" class="cart-item-img">
          <div class="cart-item-info">
            <h3 class="cart-item-name">${p.nombre}</h3>
            <div class="cart-item-meta" style="font-size: 0.75rem; color: var(--color-texto-muted); margin-bottom: 5px;">
              Talla: <span style="font-weight: 700; color: var(--color-texto);">${talla}</span> | Color: <span style="font-weight: 700; color: var(--color-texto);">${color}</span>
            </div>
            <span class="cart-item-price">$${precioUnitario.toFixed(2)}</span>
            <div class="cart-item-qty-control">
              <button class="qty-btn" onclick="Cart.updateQuantity('${itemKey}', ${item.cantidad - 1})">-</button>
              <span class="cart-item-qty">${item.cantidad}</span>
              <button class="qty-btn" onclick="Cart.updateQuantity('${itemKey}', ${item.cantidad + 1})">+</button>
            </div>
          </div>
          <button class="cart-item-remove-btn" onclick="Cart.removeItemWithAnim('${itemKey}')">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      `;
    });

    container.innerHTML = html;
    this.calculateTotals();

    // Actualizar iconos de Lucide
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // --- 7. FINALIZAR COMPRA (CHECKOUT) ---
  checkout() {
    if (this.items.length === 0) {
      UI.showToast("El carrito está vacío", "warning");
      return;
    }

    const payBtn = document.getElementById("btn-checkout-pay");
    if (!payBtn) return;

    // Bloquear botón y morph a procesando
    payBtn.disabled = true;
    payBtn.innerHTML = `
      <span class="btn-spinner" style="display:inline-block; width:18px; height:18px; border:2px solid rgba(255,255,255,0.2); border-top-color:#fff; border-radius:50%; animation: spinner-rotate 0.8s infinite linear;"></span>
      <span>PROCESANDO TRANSFERENCIA...</span>
    `;

    setTimeout(async () => {
      // Registrar la venta en la Base de Datos Local
      const session = DB.getSesionActiva() || { nombre: "Cliente General", usuario: "guest" };
      const saleId = `VT-${Date.now().toString().slice(-6)}`;
      const now = new Date();
      const dateStr = now.toLocaleDateString();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const desgloseProductos = this.items.map(item => `${item.producto.nombre} x${item.cantidad}`).join(", ");
      
      const venta = {
        id: saleId,
        vendedor: session.nombre,
        fecha: dateStr,
        hora: timeStr,
        productos: desgloseProductos,
        total: this.totalActual,
        cupon: this.codigoAplicado || "Ninguno",
        detallesItems: this.items.map(item => ({
          nombre: item.producto.nombre,
          cantidad: item.cantidad,
          categoria: item.producto.categoria,
          precio: item.producto.price || item.producto.precio
        }))
      };

      await DB.registrarVenta(venta);

      // Simular ticket de venta para mostrar en el modal
      const ticketHTML = `
        <div style="font-family: monospace; font-size: 0.85rem; color:#fff; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 6px; border: 1px dashed rgba(255,255,255,0.15);">
          <div style="text-align: center; font-weight: bold; margin-bottom: 15px;">C&TEES - TICKET DE VENTA<br>CBTA 197</div>
          <p><strong>FOLIO:</strong> ${venta.id}</p>
          <p><strong>FECHA:</strong> ${venta.fecha} ${venta.hora}</p>
          <p><strong>ATENDIDO POR:</strong> ${venta.vendedor}</p>
          <hr style="border: none; border-top: 1px dashed rgba(255,255,255,0.1); margin: 10px 0;">
          <ul style="list-style: none; padding-left: 0;">
            ${this.items.map(item => `
              <li style="display:flex; justify-content:space-between;">
                <span>${item.producto.nombre.substring(0,20)} (x${item.cantidad})</span>
                <span>$${((item.producto.price || item.producto.precio) * item.cantidad).toFixed(2)}</span>
              </li>
            `).join("")}
          </ul>
          <hr style="border: none; border-top: 1px dashed rgba(255,255,255,0.1); margin: 10px 0;">
          <div style="display:flex; justify-content:space-between; font-weight: bold; color: var(--color-acento2);">
            <span>TOTAL PAGADO:</span>
            <span>$${venta.total.toFixed(2)}</span>
          </div>
          ${venta.cupon !== "Ninguno" ? `<p style="font-size: 0.75rem; color:#2ecc71; text-align:center; margin-top:10px;">Cupón aplicado: ${venta.cupon}</p>` : ""}
        </div>
      `;

      // Cerrar Carrito, limpiar y notificar
      this.closeCart();
      this.items = [];
      this.descuentoPorcentaje = 0;
      this.codigoAplicado = "";
      this.saveCartToSession();
      this.updateBadge();

      // Reset de botón de pago
      payBtn.disabled = false;
      payBtn.innerHTML = `<span class="btn-text">FINALIZAR COMPRA</span>`;

      // Limpiar cupones de input en UI
      const promoInput = document.getElementById("cart-promo-code");
      const promoMsg = document.getElementById("promo-msg");
      if (promoInput) promoInput.value = "";
      if (promoMsg) promoMsg.style.display = "none";

      // Mostrar Ticket
      UI.showModal("COMPRA PROCESADA EXITOSAMENTE", ticketHTML);
      UI.showToast("Venta completada con éxito", "success");

      // Si estamos en la sección de historial, actualizarla de inmediato
      if (typeof HistoryScreen !== 'undefined' && App.activeScreenId === "history") {
        HistoryScreen.loadHistoryScreen();
      }

    }, 2000);
  }
};

// Inicializar al cargar
document.addEventListener("DOMContentLoaded", () => {
  Cart.init();
});
