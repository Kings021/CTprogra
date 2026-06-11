// scanner.js - Simulación interactiva del escáner de códigos de barras

const Scanner = {
  isScanning: false,
  html5QrCode: null,
  isCameraActive: false,
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

    // Auto-enfocar el input del escáner real para facilitar el escaneo directo
    const realInput = document.getElementById("real-scanner-input");
    if (realInput) {
      realInput.value = "";
      setTimeout(() => {
        realInput.focus();
      }, 100);

      // Evento para procesar entrada manual o escáner enfocado
      if (!realInput.dataset.listenerActive) {
        realInput.dataset.listenerActive = "true";
        realInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const barcode = realInput.value.trim();
            if (barcode) {
              this.simulateScan(barcode);
              realInput.value = "";
            }
          }
        });
      }
    }
  },

  async toggleCamera() {
    if (this.isCameraActive) {
      await this.stopCameraScanner();
    } else {
      await this.startCameraScanner();
    }
  },

  async startCameraScanner() {
    const viewport = document.getElementById("scanner-viewport");
    if (!viewport) return;

    let readerDiv = document.getElementById("camera-reader");
    if (!readerDiv) {
      readerDiv = document.createElement("div");
      readerDiv.id = "camera-reader";
      readerDiv.style.width = "100%";
      readerDiv.style.height = "100%";
      readerDiv.style.position = "absolute";
      readerDiv.style.top = "0";
      readerDiv.style.left = "0";
      readerDiv.style.zIndex = "1";
      viewport.appendChild(readerDiv);
    }

    const placeholder = viewport.querySelector(".scanner-placeholder-content");

    const btnText = document.getElementById("btn-camera-text");
    if (btnText) btnText.textContent = "Detener Cámara";

    try {
      this.html5QrCode = new Html5Qrcode("camera-reader");
      
      await this.html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: (width, height) => {
            const boxWidth = Math.min(width * 0.8, 280);
            const boxHeight = Math.min(height * 0.4, 130);
            return { width: boxWidth, height: boxHeight };
          },
          aspectRatio: 1.0,
          formatsToSupport: [ 
            Html5QrcodeSupportedFormats.QR_CODE, 
            Html5QrcodeSupportedFormats.EAN_13, 
            Html5QrcodeSupportedFormats.EAN_8, 
            Html5QrcodeSupportedFormats.CODE_128, 
            Html5QrcodeSupportedFormats.UPC_A, 
            Html5QrcodeSupportedFormats.UPC_E 
          ]
        },
        (decodedText) => {
          this.stopCameraScanner();
          this.simulateScan(decodedText);
        },
        (errorMessage) => {
          // Ignorar errores continuos de lectura
        }
      );

      this.isCameraActive = true;
      
      if (placeholder) {
        placeholder.style.position = "absolute";
        placeholder.style.bottom = "20px";
        placeholder.style.left = "50%";
        placeholder.style.transform = "translateX(-50%)";
        placeholder.style.zIndex = "10";
        const icon = placeholder.querySelector(".scanner-icon-main");
        const p = placeholder.querySelector("p");
        if (icon) icon.style.display = "none";
        if (p) p.style.display = "none";
      }

    } catch (err) {
      console.error("No se pudo iniciar la cámara:", err);
      UI.showToast("Permiso denegado o cámara no disponible", "error");
      await this.stopCameraScanner();
    }
  },

  async stopCameraScanner() {
    const viewport = document.getElementById("scanner-viewport");
    const placeholder = viewport?.querySelector(".scanner-placeholder-content");
    if (placeholder) {
      placeholder.style.position = "";
      placeholder.style.bottom = "";
      placeholder.style.left = "";
      placeholder.style.transform = "";
      placeholder.style.zIndex = "";
      const icon = placeholder.querySelector(".scanner-icon-main");
      const p = placeholder.querySelector("p");
      if (icon) icon.style.display = "";
      if (p) p.style.display = "";
    }

    const btnText = document.getElementById("btn-camera-text");
    if (btnText) btnText.textContent = "Activar Cámara";

    this.isCameraActive = false;

    if (this.html5QrCode) {
      try {
        await this.html5QrCode.stop();
      } catch (e) {
        console.warn("Error stopping html5QrCode:", e);
      }
      this.html5QrCode = null;
    }

    const readerDiv = document.getElementById("camera-reader");
    if (readerDiv) {
      readerDiv.remove();
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

    setTimeout(async () => {
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
      const productos = await DB.getProductos();
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

// --- Detección global de escáner de códigos de barras (lector USB/Bluetooth) ---
let globalBarcodeBuffer = "";
let lastKeypressTime = 0;

window.addEventListener("keydown", (e) => {
  // Ignorar si el usuario está en medio de presionar teclas de control o similares
  if (e.ctrlKey || e.altKey || e.metaKey) return;

  const now = Date.now();
  const timeDiff = now - lastKeypressTime;
  lastKeypressTime = now;

  // Si el usuario está escribiendo en el input de registro de productos, login, etc., omitimos el lector global
  const activeEl = document.activeElement;
  const isWritingInOtherInput = activeEl && 
    (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA") && 
    activeEl.id !== "real-scanner-input" &&
    activeEl.id !== "catalog-search-input";

  if (isWritingInOtherInput) {
    globalBarcodeBuffer = "";
    return;
  }

  // Los escáneres reales simulan pulsaciones de teclas extremadamente veloces (< 50ms).
  // Si la pausa entre teclas es mayor a 50ms, reseteamos el buffer de código.
  if (timeDiff > 50 && globalBarcodeBuffer.length > 0) {
    globalBarcodeBuffer = "";
  }

  // Si es la tecla Enter, procesamos lo acumulado
  if (e.key === "Enter") {
    if (globalBarcodeBuffer.length >= 3) {
      e.preventDefault();
      const code = globalBarcodeBuffer;
      globalBarcodeBuffer = "";
      
      // Si no estamos en la pantalla del escáner, navegamos a ella para mostrar la animación
      if (typeof App !== "undefined" && App.activeScreenId !== "scanner") {
        App.navigateTo("scanner");
      }
      
      setTimeout(() => {
        Scanner.simulateScan(code);
      }, 150);
    } else {
      globalBarcodeBuffer = "";
    }
    return;
  }

  // Acumular solo caracteres imprimibles sencillos
  if (e.key.length === 1) {
    globalBarcodeBuffer += e.key;
  }
});

