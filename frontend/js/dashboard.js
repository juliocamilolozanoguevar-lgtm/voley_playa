window.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('btnRefreshDashboard')?.addEventListener('click', cargarDashboard);
  document.getElementById('tabReportes')?.addEventListener('shown.bs.tab', cargarReportes);
  await cargarDashboard();
});

async function cargarDashboard() {
  const alertBox = document.getElementById('dashboardAlert');
  const today = new Date().toISOString().slice(0, 10);

  if (alertBox) {
    alertBox.classList.add('d-none');
  }

  try {
    // Cargar datos en paralelo
    const [resumen, clientes, canchas, reservas] = await Promise.all([
      window.VoleyApi.fetchJson('/dashboard/resumen'),
      window.VoleyApi.fetchJson('/clientes'),
      window.VoleyApi.fetchJson('/canchas'),
      window.VoleyApi.fetchJson('/reservas'),
    ]);

    // Filtrar reservas de hoy
    const reservasHoy = (reservas || []).filter((r) => r.fecha === today);

    // Actualizar métricas
    actualizarTexto('ingresosHoy', formatearMoneda(resumen?.ingresosHoy || 0));
    actualizarTexto('totalReservasHoy', reservasHoy.length);
    actualizarTexto('totalClientes', (clientes || []).length);
    actualizarTexto('totalCanchas', (canchas || []).length);
  } catch (error) {
    mostrarAlerta('dashboardAlert', error.message || 'No se pudo cargar el dashboard.', 'danger');
  }
}

async function cargarReportes() {
  try {
    const [reservas, clientes, pagos] = await Promise.all([
      window.VoleyApi.fetchJson('/reservas'),
      window.VoleyApi.fetchJson('/clientes'),
      window.VoleyApi.fetchJson('/pagos').catch(() => []),
    ]);

    renderReservasPorFecha(reservas);
    renderTopClientes(reservas, clientes);
    renderReservasPorCancha(reservas);
    renderIngresosPorMetodo(pagos);
  } catch (error) {
    mostrarAlerta('dashboardAlert', error.message || 'No se pudo cargar los reportes.', 'danger');
  }
}

function renderReservasPorFecha(reservas) {
  const container = document.getElementById('reporteReservasPorFecha');
  if (!container) return;

  const grupos = reservas.reduce((acc, reserva) => {
    const fecha = reserva.fecha || 'Sin fecha';
    acc[fecha] = (acc[fecha] || 0) + 1;
    return acc;
  }, {});

  const html = Object.entries(grupos)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, total]) => `
      <div class="d-flex justify-content-between align-items-center border-bottom py-2">
        <span>${escapeHtml(fecha)}</span>
        <span class="badge bg-primary">${total}</span>
      </div>
    `)
    .join('') || '<p class="text-muted mb-0">No hay reservas.</p>';

  container.innerHTML = html;
}

function renderTopClientes(reservas, clientes) {
  const container = document.getElementById('reporteTopClientes');
  if (!container) return;

  const cuentas = reservas.reduce((acc, reserva) => {
    const id = reserva.cliente?.idCliente || 'sin-id';
    const nombre = `${reserva.cliente?.nombre || ''} ${reserva.cliente?.apellido || ''}`.trim() || reserva.cliente?.dni || 'Cliente desconocido';
    const monto = reserva.pago?.monto || 0;
    acc[id] = acc[id] || { nombre, total: 0, gastado: 0 };
    acc[id].total += 1;
    acc[id].gastado += Number(monto);
    return acc;
  }, {});

  const top = Object.values(cuentas)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const html = top
    .map((cliente) => `
      <div class="d-flex justify-content-between align-items-center border-bottom py-2">
        <div>
          <span>${escapeHtml(cliente.nombre)}</span>
          <br>
          <small class="text-muted">${cliente.total} reservas • ${formatearMoneda(cliente.gastado)}</small>
        </div>
        <span class="badge bg-success">${cliente.total}</span>
      </div>
    `)
    .join('') || '<p class="text-muted mb-0">No hay datos de clientes.</p>';

  container.innerHTML = html;
}

function renderReservasPorCancha(reservas) {
  const container = document.getElementById('reporteReservasPorCancha');
  if (!container) return;

  const totales = reservas.reduce((acc, reserva) => {
    const nombre = reserva.cancha?.nombreCancha || 'Cancha desconocida';
    acc[nombre] = (acc[nombre] || 0) + 1;
    return acc;
  }, {});

  const html = Object.entries(totales)
    .sort(([, a], [, b]) => b - a)
    .map(([cancha, total]) => `
      <div class="d-flex justify-content-between align-items-center border-bottom py-2">
        <span>${escapeHtml(cancha)}</span>
        <span class="badge bg-info">${total}</span>
      </div>
    `)
    .join('') || '<p class="text-muted mb-0">No hay datos de canchas.</p>';

  container.innerHTML = html;
}

function renderIngresosPorMetodo(pagos) {
  const container = document.getElementById('reporteIngresosPorMetodo');
  if (!container) return;

  const totales = (pagos || []).reduce((acc, pago) => {
    const metodo = pago.metodoPago || 'Sin método';
    acc[metodo] = (acc[metodo] || 0) + Number(pago.monto || 0);
    return acc;
  }, {});

  const html = Object.entries(totales)
    .sort(([, a], [, b]) => b - a)
    .map(([metodo, total]) => `
      <div class="d-flex justify-content-between align-items-center border-bottom py-2">
        <span>${escapeHtml(metodo)}</span>
        <span class="badge bg-secondary">${formatearMoneda(total)}</span>
      </div>
    `)
    .join('') || '<p class="text-muted mb-0">No hay ingresos registrados.</p>';

  container.innerHTML = html;
}

function actualizarTexto(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.textContent = valor;
  }
}

function mostrarAlerta(id, mensaje, tipo) {
  const alerta = document.getElementById(id);
  if (!alerta) return;
  alerta.className = `alert app-alert alert-${tipo} rounded-4`;
  alerta.textContent = mensaje;
  alerta.classList.remove('d-none');
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatearMoneda(valor) {
  const amount = Number(valor || 0);
  return `S/. ${amount.toFixed(2)}`;
}
