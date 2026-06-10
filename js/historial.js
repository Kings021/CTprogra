// historial.js - Lógica del historial de ventas, gráficas por categoría, timeline y contadores animados

const HistoryScreen = {
  observer: null,

  async loadHistoryScreen() {
    const ventas = await DB.getVentas();
    this.renderStats(ventas);
    this.renderChart(ventas);
    this.renderTimeline(ventas);
    this.setupControls();
  },

  // --- 1. CONTADORES ESTADÍSTICOS ANIMADOS (Count Up) ---
  renderStats(ventas) {

    const totalRevenue = ventas.reduce((sum, v) => sum + v.total, 0);
    const highestSale = ventas.reduce((max, v) => v.total > max ? v.total : max, 0);
    
    // Contar total de prendas vendidas
    let totalItems = 0;
    ventas.forEach(v => {
      if (v.detallesItems) {
        totalItems += v.detallesItems.reduce((sum, item) => sum + item.cantidad, 0);
      } else {
        // Fallback por si los detalles no se registraron bien
        totalItems += 1;
      }
    });

    // Animar contadores
    this.animateNumber("stat-total-revenue", 0, totalRevenue, true);
    this.animateNumber("stat-highest-sale", 0, highestSale, true);
    this.animateNumber("stat-total-items", 0, totalItems, false);
  },

  animateNumber(elementId, startVal, endVal, isCurrency = false) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const duration = 1000; // 1 segundo
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing out cuadrático
      const easeProgress = progress * (2 - progress);
      const currentVal = startVal + (endVal - startVal) * easeProgress;

      if (isCurrency) {
        el.innerText = `$${Math.floor(currentVal).toLocaleString()}`;
      } else {
        el.innerText = Math.floor(currentVal).toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        if (isCurrency) {
          el.innerText = `$${endVal.toFixed(2)}`;
        } else {
          el.innerText = endVal.toString();
        }
      }
    };

    requestAnimationFrame(step);
  },

  // --- 2. GRÁFICA DE BARRAS DINÁMICA (ELEVACIÓN DE BARRAS DESDE EL SUELO) ---
  renderChart(ventas) {
    const container = document.getElementById("category-chart");
    if (!container) return;

    const categorias = ["Camisetas", "Pants", "Chamarras", "Gorras", "Shorts", "Sudaderas"];
    
    // Inicializar contadores por categoría
    const statsCategorias = {};
    categorias.forEach(cat => statsCategorias[cat] = 0);

    // Sumar cantidades vendidas
    ventas.forEach(v => {
      if (v.detallesItems) {
        v.detallesItems.forEach(item => {
          if (statsCategorias.hasOwnProperty(item.categoria)) {
            statsCategorias[item.categoria] += item.cantidad;
          }
        });
      }
    });

    // Encontrar el valor máximo para escalar la gráfica
    const maxQty = Math.max(...Object.values(statsCategorias), 0);

    let html = "";
    categorias.forEach(cat => {
      const qty = statsCategorias[cat];
      // Altura inicial 0 para gatillar transición de CSS
      html += `
        <div class="chart-bar-wrapper">
          <div class="chart-bar" data-qty="${qty}" style="height: 0px;">
            <span class="chart-bar-val">${qty}</span>
          </div>
          <span class="chart-bar-lbl" title="${cat}">${cat}</span>
        </div>
      `;
    });

    container.innerHTML = html;

    // Gatillar elevación en la próxima recarga del hilo de renderizado
    setTimeout(() => {
      const bars = container.querySelectorAll(".chart-bar");
      bars.forEach(bar => {
        const qty = parseInt(bar.getAttribute("data-qty"));
        const percent = maxQty > 0 ? (qty / maxQty) * 100 : 0;
        // Limitar un mínimo de 4% para que se dibuje una base si tiene productos
        const heightPercent = qty > 0 ? Math.max(percent, 5) : 0;
        bar.style.height = `${heightPercent}%`;
      });
    }, 100);
  },

  // --- 3. TIMELINE VERTICAL E INTERSECTION OBSERVER ---
  renderTimeline(ventas) {
    const container = document.getElementById("history-timeline");
    const noHistory = document.getElementById("no-history-state");
    if (!container) return;

    // Ordenar ventas por fecha/hora descendente (más recientes primero)
    const ventasOrdenadas = [...ventas].reverse();

    if (ventasOrdenadas.length === 0) {
      if (noHistory) noHistory.classList.remove("hidden");
      // Mantener la línea vertical oculta
      container.classList.add("empty-timeline");
      // Limpiar contenedor de items viejos excepto el estado vacío
      container.querySelectorAll(".timeline-item").forEach(item => item.remove());
      return;
    }

    if (noHistory) noHistory.classList.add("hidden");
    container.classList.remove("empty-timeline");

    // Limpiar items anteriores
    container.querySelectorAll(".timeline-item").forEach(item => item.remove());

    let html = "";
    ventasOrdenadas.forEach((v, idx) => {
      html += `
        <div class="timeline-item" data-idx="${idx}">
          <div class="timeline-item-time">${v.fecha} - ${v.hora}</div>
          <div class="timeline-item-details">
            <div class="timeline-item-info-col">
              <span class="timeline-item-title">${v.id} | Atendido por ${v.vendedor}</span>
              <span class="timeline-item-desc">${v.productos}</span>
              <span style="font-size:0.7rem; color:var(--color-texto-muted);">Cupón: ${v.cupon}</span>
            </div>
            <div class="timeline-item-value-col">
              $${v.total.toFixed(2)}
            </div>
          </div>
        </div>
      `;
    });

    // Inyectar items de forma segura antes del no-history wrapper
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    
    // Insertar todos los elementos creados
    while (tempDiv.firstChild) {
      container.appendChild(tempDiv.firstChild);
    }

    // Configurar IntersectionObserver para animar elementos al hacer scroll
    this.setupScrollObserver();
  },

  setupScrollObserver() {
    const items = document.querySelectorAll(".timeline-item");
    
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          this.observer.unobserve(entry.target); // Dejar de observar una vez animado
        }
      });
    }, {
      root: null, // viewport
      threshold: 0.1, // Gatillar cuando el 10% del item es visible
      rootMargin: "0px 0px -50px 0px" // Reducir la zona de trigger inferior
    });

    items.forEach(item => {
      this.observer.observe(item);
    });
  },

  // --- 4. EXPORTAR Y LIMPIAR CONTROLES ---
  setupControls() {
    const exportBtn = document.getElementById("btn-export-history");
    const clearBtn = document.getElementById("btn-clear-history");

    if (exportBtn) {
      exportBtn.onclick = () => this.exportHistory();
    }

    if (clearBtn) {
      clearBtn.onclick = () => this.confirmClearHistory();
    }
  },

  async exportHistory() {
    const ventas = await DB.getVentas();
    if (ventas.length === 0) {
      UI.showToast("No hay datos para exportar", "warning");
      return;
    }

    let report = "=========================================\n";
    report += "         REPORTE DE VENTAS C&TEES        \n";
    report += "                CBTA 197                 \n";
    report += `Generado el: ${new Date().toLocaleString()}\n`;
    report += "=========================================\n\n";

    ventas.forEach(v => {
      report += `TICKET: ${v.id}\n`;
      report += `FECHA: ${v.fecha} ${v.hora}\n`;
      report += `ATENDIDO POR: ${v.vendedor}\n`;
      report += `PRODUCTOS: ${v.productos}\n`;
      report += `CUPON: ${v.cupon}\n`;
      report += `TOTAL: $${v.total.toFixed(2)}\n`;
      report += "-----------------------------------------\n";
    });

    const totalRevenue = ventas.reduce((sum, v) => sum + v.total, 0);
    report += `\nRESUMEN GENERAL:\n`;
    report += `VENTAS TOTALES REGISTRADAS: ${ventas.length}\n`;
    report += `INGRESOS BRUTOS ACUMULADOS: $${totalRevenue.toFixed(2)}\n`;
    report += "=========================================\n";

    // Mostrar modal con el texto del reporte para fácil copiado
    const modalHTML = `
      <p style="margin-bottom:15px; color:var(--color-texto-muted);">Copia el siguiente resumen estructurado de transacciones para guardarlo en un archivo de texto o enviarlo.</p>
      <textarea readonly style="width:100%; height:250px; background:rgba(0,0,0,0.3); border:var(--border-glow); border-radius:4px; padding:10px; color:#fff; font-family:monospace; font-size:0.8rem; resize:none; outline:none; scrollbar-width:thin;">${report}</textarea>
      <button class="btn btn-primary btn-sm btn-full-width" style="margin-top:15px;" onclick="HistoryScreen.copyReportToClipboard(this)">
        <i data-lucide="copy" style="width:14px; height:14px;"></i> Copiar al Portapapeles
      </button>
    `;

    UI.showModal("EXPORTACIÓN DEL HISTORIAL", modalHTML);
  },

  copyReportToClipboard(btn) {
    const textarea = btn.previousElementSibling;
    if (textarea) {
      textarea.select();
      document.execCommand("copy");
      UI.showToast("Reporte copiado al portapapeles", "success");
      
      btn.innerHTML = `<i data-lucide="check" style="width:14px; height:14px;"></i> ¡Copiado!`;
      if (window.lucide) window.lucide.createIcons();
      
      setTimeout(() => {
        btn.innerHTML = `<i data-lucide="copy" style="width:14px; height:14px;"></i> Copiar al Portapapeles`;
        if (window.lucide) window.lucide.createIcons();
      }, 2000);
    }
  },

  async confirmClearHistory() {
    const ventas = await DB.getVentas();
    if (ventas.length === 0) {
      UI.showToast("El historial ya está vacío", "info");
      return;
    }

    UI.showModal(
      "CONFIRMACIÓN REQUERIDA",
      "<p>¿Estás completamente seguro de que deseas eliminar todas las ventas del historial? Esta acción no se puede deshacer.</p>",
      `
        <button class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
        <button class="btn btn-primary btn-clear" onclick="HistoryScreen.clearHistoryConfirmed()">Sí, Eliminar todo</button>
      `
    );
  },

  async clearHistoryConfirmed() {
    await DB.limpiarHistorial();
    UI.closeModal();
    await this.loadHistoryScreen(); // Recargar datos
    UI.showToast("Historial de ventas vaciado con éxito", "success");
  }
};
