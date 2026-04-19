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
  const tbody = document.getElementById("tbodyReservas");
  if (!tbody) {
    return;
  }

  tbody.innerHTML = `
    <tr class="empty-row">
      <td colspan="4">Cargando datos del dashboard...</td>
    </tr>
  `;

  try {
    const resumen = await window.VoleyApi.fetchJson("/dashboard/resumen");
    limpiarAlerta("dashboardAlert");

    actualizarTexto("ingresosMes", formatearMoneda(resumen.ingresosMes));
    actualizarTexto("reservasHoy", `${resumen.reservasHoy ?? 0}`);
    actualizarTexto("horasOcupadas", `${resumen.horasOcupadasHoy ?? 0} H`);
    actualizarTexto("canchasActivas", `${resumen.canchasActivas ?? 0}`);

    actualizarTexto("miniIngresosMes", formatearMoneda(resumen.ingresosMes));
    actualizarTexto("miniReservasHoy", `${resumen.reservasHoy ?? 0}`);
    actualizarTexto("miniHorasOcupadas", `${resumen.horasOcupadasHoy ?? 0} H`);
    actualizarTexto("miniCanchasActivas", `${resumen.canchasActivas ?? 0}`);

    actualizarTexto("reportIngresosMes", formatearMoneda(resumen.ingresosMes));
    actualizarTexto("reportDiaMasReservas", resumen.diaMasReservas || "Sin datos");
    actualizarTexto("reportHoraPico", resumen.horaPico || "Sin datos");
    actualizarTexto("reportClientesTotal", `${resumen.clientesRegistrados ?? 0}`);

    reportesCache = {
      dias: resumen.reportes?.dias || [],
      semanas: resumen.reportes?.semanas || [],
      meses: resumen.reportes?.meses || [],
    };

    renderizarReservas(resumen.reservasRecientes || []);
    renderizarGraficosActivos();
  } catch (error) {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="4">No se pudo cargar el dashboard.</td>
      </tr>
    `;

    actualizarTexto("ingresosMes", "S/. 0.00");
    actualizarTexto("reservasHoy", "0");
    actualizarTexto("horasOcupadas", "0 H");
    actualizarTexto("canchasActivas", "0");
    actualizarTexto("miniIngresosMes", "S/. 0.00");
    actualizarTexto("miniReservasHoy", "0");
    actualizarTexto("miniHorasOcupadas", "0 H");
    actualizarTexto("miniCanchasActivas", "0");
    actualizarTexto("reportIngresosMes", "S/. 0.00");
    actualizarTexto("reportDiaMasReservas", "Sin datos");
    actualizarTexto("reportHoraPico", "Sin datos");
    actualizarTexto("reportClientesTotal", "0");
    reportesCache = { dias: [], semanas: [], meses: [] };
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
      renderizarGraficosActivos();
    });
  });
}

function renderizarReservas(reservas) {
  const tbody = document.getElementById("tbodyReservas");
  if (!tbody) {
    return;
  }

  if (!reservas.length) {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="4">No hay reservas registradas.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = reservas
    .map((reserva) => {
      const badgeClass = obtenerClaseEstado(reserva.estado);
      return `
        <tr>
          <td>${escapeHtml(reserva.cliente || "Sin cliente")}</td>
          <td>${escapeHtml(reserva.cancha || "Sin cancha")}</td>
          <td>${escapeHtml(reserva.fecha || "-")}</td>
          <td><span class="status-badge ${badgeClass}">${escapeHtml(reserva.estado || "Programada")}</span></td>
        </tr>
      `;
    })
    .join("");
}

function renderizarGrafico(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  const data = items.length
    ? items
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
  renderizarGrafico("miniReportChart", reportesCache[rangoActivo] || []);
}

function obtenerClaseEstado(estado) {
  const valor = (estado || "").toLowerCase();
  if (valor.includes("final")) {
    return "status-finalizada";
  }
  if (valor.includes("pagado")) {
    return "status-confirmada";
  }
  if (valor.includes("cancelado")) {
    return "status-finalizada";
  }
  return "status-pendiente";
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
