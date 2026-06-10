// scanner.js - Simulación interactiva del escáner de códigos de barras

const Scanner = {
  isScanning: false,
  barcodeDemoData: [
    { label: "Oversized T-Shirt", code: "7501001" },
    { label: "Cargo Pants", code: "7501003" },
    { label: "Bomber Jacket", code: "7501005" },
    { label: "Neon Beanie", code: "7501008" },
    { label: "Peach Hoodie", code: "7501011" }
  ],

  initScannerScreen() {
    this.renderDemoButtons();
    
    // Asegurar que el visor se limpie si no se está escaneando
    const resultContainer = document.getElementById("scanned-result");
    if (resultContainer && !this.isScanning) {
      resultContainer.classList.add("hidden");
    }
  },

  renderDemoButtons() {
    const grid = document.getElementById("barcode-demo-grid");
    if (!grid) return;

    let html = "";
    this.barcodeDemoData.forEach(item => {
      html += `
        <button class="barcode-btn" onclick="Scanner.simulateScan('${item.code}')">
          <i data-lucide="scan"></i>
          <span>${item.label}</span>
          <small>${item.code}</small>
        </button>
      `;
    });

    grid.innerHTML = html;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  simulateScan(barcode) {
    if (this.isScanning) return;

    this.isScanning = true;

    // Resetear visualización anterior
    const resultContainer = document.getElementById("scanned-result");
    if (resultContainer) resultContainer.classList.add("hidden");

    const viewport = document.getElementById("scanner-viewport");
    const laser = viewport.querySelector(".scanner-laser");
    
    // Aumentar velocidad y vibración del láser
    if (laser) {
      laser.style.animationDuration = "0.8s"; // Escaneo rápido
    }

    // Efecto de carga simulada de enfoque
    UI.showToast("Leyendo código de barras...", "info", 1000);

    setTimeout(() => {
      // 1. Sonido beep
      UI.playBeep();

      // 2. Efecto Flash Verde
      const flash = document.getElementById("scanner-flash");
      if (flash) {
        flash.classList.add("scanner-flash-active");
        flash.addEventListener("animationend", () => {
          flash.classList.remove("scanner-flash-active");
        }, { once: true });
      }

      // 3. Vibración (Física si es móvil, visual de UI si es escritorio)
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      if (viewport) {
        viewport.style.animation = "none";
        void viewport.offsetWidth;
        viewport.style.animation = "scanner-shake 0.3s ease-in-out";
        setTimeout(() => {
          viewport.style.animation = "";
        }, 300);
      }

      // 4. Buscar producto
      const productos = DB.getProductos();
      const producto = productos.find(p => p.codigoBarras === barcode);

      if (producto) {
        // Añadir automáticamente al carrito
        Cart.addToCart(producto.id);

        // Mostrar resultado con efecto materialización
        this.displayResult(producto);
        UI.showToast(`Prenda identificada: ${producto.nombre}`, "success");
      } else {
        UI.showToast(`Código de barras ${barcode} no registrado en el sistema`, "error");
      }

      // Restaurar velocidad normal del láser
      if (laser) {
        laser.style.animationDuration = "3s";
      }

      this.isScanning = false;
    }, 1200); // Duración de escaneo
  },

  displayResult(producto) {
    const resultContainer = document.getElementById("scanned-result");
    const img = document.getElementById("scanned-img");
    const name = document.getElementById("scanned-name");
    const cat = document.getElementById("scanned-category");
    const price = document.getElementById("scanned-price");
    const val = document.getElementById("scanned-code-val");

    if (!resultContainer || !img || !name || !cat || !price || !val) return;

    img.src = producto.imagen;
    img.alt = producto.nombre;
    name.innerText = producto.nombre;
    cat.innerText = producto.categoria;
    price.innerText = `$${(producto.precio || producto.price).toFixed(2)}`;
    val.innerText = producto.codigoBarras;

    // Quitar hidden e inyectar animación spring
    resultContainer.classList.remove("hidden");
    resultContainer.classList.add("materialize-anim");
    
    resultContainer.addEventListener("animationend", () => {
      resultContainer.classList.remove("materialize-anim");
    }, { once: true });
  }
};

// Agregar animación shake de la viewport dinámicamente
const scannerStyle = document.createElement("style");
scannerStyle.innerHTML = `
@keyframes scanner-shake {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-3px, 2px); }
  50% { transform: translate(3px, -2px); }
  75% { transform: translate(-2px, -2px); }
}
`;
document.head.appendChild(scannerStyle);
