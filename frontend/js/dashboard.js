let reportesCache = {
  dias: [],
  semanas: [],
  meses: [],
};
let rangoActivo = "dias";

document.addEventListener("DOMContentLoaded", async () => {
  bindReportFilters();
  document.getElementById("btnRefrescarDashboard")?.addEventListener("click", async () => {
    await cargarDashboard();
  });
  await cargarDashboard();
});

async function cargarDashboard() {
  const alerta = document.getElementById("dashboardAlert");
  if (alerta) {
    alerta.classList.add("d-none");
  }

  try {
    const resumen = await window.VoleyApi.fetchJson("/dashboard/resumen");

    actualizarTexto("totalReservasHoy", `${resumen.totalReservasHoy ?? 0}`);
    actualizarTexto("horasOcupadas", `${resumen.horasOcupadasHoy ?? 0} H`);
    actualizarTexto("montoGenerado", formatearMoneda(resumen.montoGeneradoTotal));
    actualizarTexto("clientesHabituales", `${resumen.clientesHabituales ?? 0}`);
    actualizarTexto("ingresosHoy", formatearMoneda(resumen.ingresosHoy));
    actualizarTexto("totalClientes", `${resumen.totalClientes ?? 0}`);
    actualizarTexto("totalCanchas", `${resumen.totalCanchas ?? 0}`);
    actualizarTexto("reporteDiaConMasHoras", resumen.diaMayorHoras || "Sin datos");
    actualizarTexto("reporteMontoDiaMayorHoras", formatearMoneda(resumen.montoDiaMayorHoras));

    reportesCache = {
      dias: resumen.dias || [],
      semanas: resumen.semanas || [],
      meses: resumen.meses || [],
    };

    renderizarReportes();
    renderizarGraficosActivos();
  } catch (error) {
    actualizarTexto("totalReservasHoy", "0");
    actualizarTexto("horasOcupadas", "0 H");
    actualizarTexto("montoGenerado", "S/. 0.00");
    actualizarTexto("clientesHabituales", "0");
    actualizarTexto("ingresosHoy", "S/. 0.00");
    actualizarTexto("totalClientes", "0");
    actualizarTexto("totalCanchas", "0");
    actualizarTexto("reporteDiaConMasHoras", "Sin datos");
    actualizarTexto("reporteMontoDiaMayorHoras", "S/. 0.00");
    reportesCache = { dias: [], semanas: [], meses: [] };
    renderizarReportes();
    renderizarGraficosActivos();
    mostrarAlerta("dashboardAlert", error.message || "No se pudo conectar con el backend.", "danger");
  }
}

function bindReportFilters() {
  document.querySelectorAll("[data-report-range]").forEach((button) => {
    button.addEventListener("click", () => {
      rangoActivo = button.dataset.reportRange || "dias";
      document.querySelectorAll("[data-report-range]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderizarReportes();
      renderizarGraficosActivos();
    });
  });
}

function renderizarReportes() {
  const reportes = reportesCache[rangoActivo] || [];
  const list = document.getElementById("reportSummaryList");
  if (!list) {
    return;
  }

  if (!reportes.length) {
    list.innerHTML = `<p class="mb-0">No hay datos disponibles para este periodo.</p>`;
    return;
  }

  list.innerHTML = reportes
    .map(
      (item) => `
        <div class="report-detail-card rounded-3 p-3 mb-3 bg-white shadow-sm">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>${escapeHtml(item.label)}</strong>
              <p class="mb-1 small text-secondary">Horas ocupadas: ${item.totalHoras}</p>
            </div>
            <div class="text-end">
              <span class="d-block small text-secondary">Ingresos</span>
              <strong>${formatearMoneda(item.totalIngresos)}</strong>
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

function renderizarGrafico(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  const data = items.length
    ? items.map((item) => ({ label: item.label, total: item.totalHoras }))
    : [
        { label: "Lun", total: 0 },
        { label: "Mar", total: 0 },
        { label: "Mie", total: 0 },
        { label: "Jue", total: 0 },
        { label: "Vie", total: 0 },
        { label: "Sab", total: 0 },
        { label: "Dom", total: 0 },
      ];

  const maximo = Math.max(...data.map((item) => Number(item.total) || 0), 1);

  container.innerHTML = data
    .map((item) => {
      const total = Number(item.total) || 0;
      const height = Math.max((total / maximo) * 100, total > 0 ? 12 : 8);
      return `
        <div class="chart-bar-item">
          <div class="chart-bar-track">
            <div class="chart-bar" style="--chart-height: ${height}%"></div>
          </div>
          <span class="chart-bar-label">${escapeHtml(item.label || "")}</span>
          <span class="chart-bar-value">${total}</span>
        </div>
      `;
    })
    .join("");
}

function renderizarGraficosActivos() {
  renderizarGrafico("reportChart", reportesCache[rangoActivo] || []);
}

function formatearMoneda(valor) {
  const numero = Number(valor || 0);
  return `S/. ${numero.toFixed(2)}`;
}

function actualizarTexto(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.textContent = valor;
  }
}

function mostrarAlerta(id, mensaje, tipo) {
  const alerta = document.getElementById(id);
  if (!alerta) {
    return;
  }

  alerta.className = `alert app-alert alert-${tipo} rounded-4`;
  alerta.textContent = mensaje;
  alerta.classList.remove("d-none");
}

function limpiarAlerta(id) {
  const alerta = document.getElementById(id);
  if (!alerta) {
    return;
  }

  alerta.textContent = "";
  alerta.classList.add("d-none");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
