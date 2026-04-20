window.addEventListener('DOMContentLoaded', async () => {
  await cargarReportes();
});

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
    mostrarAlerta('reportesAlert', error.message || 'No se pudo cargar los reportes.', 'danger');
  }
}

function renderReservasPorFecha(reservas) {
  const container = document.getElementById('reservasPorFecha');
  if (!container) return;

  const grupos = reservas.reduce((acc, reserva) => {
    const fecha = reserva.fecha || 'Sin fecha';
    acc[fecha] = (acc[fecha] || 0) + 1;
    return acc;
  }, {});

  container.innerHTML = Object.entries(grupos)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, total]) => `<li class="list-group-item d-flex justify-content-between align-items-center">${escapeHtml(fecha)}<span class="badge bg-primary rounded-pill">${total}</span></li>`)
    .join('') || '<li class="list-group-item">No hay reservas.</li>';
}

function renderTopClientes(reservas, clientes) {
  const container = document.getElementById('topClientes');
  if (!container) return;

  const cuentas = reservas.reduce((acc, reserva) => {
    const id = reserva.cliente?.idCliente || 'sin-id';
    const nombre = `${reserva.cliente?.nombre || ''} ${reserva.cliente?.apellido || ''}`.trim() || reserva.cliente?.dni || 'Cliente desconocido';
    acc[id] = acc[id] || { nombre, total: 0 };
    acc[id].total += 1;
    return acc;
  }, {});

  const top = Object.values(cuentas)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  container.innerHTML = top
    .map((cliente) => `<li class="list-group-item d-flex justify-content-between align-items-center">${escapeHtml(cliente.nombre)}<span class="badge bg-success rounded-pill">${cliente.total}</span></li>`)
    .join('') || '<li class="list-group-item">No hay datos de clientes.</li>';
}

function renderReservasPorCancha(reservas) {
  const container = document.getElementById('reservasPorCancha');
  if (!container) return;

  const totales = reservas.reduce((acc, reserva) => {
    const nombre = reserva.cancha?.nombreCancha || 'Cancha desconocida';
    acc[nombre] = (acc[nombre] || 0) + 1;
    return acc;
  }, {});

  container.innerHTML = Object.entries(totales)
    .sort(([, a], [, b]) => b - a)
    .map(
      ([cancha, total]) => `<li class="list-group-item d-flex justify-content-between align-items-center">${escapeHtml(cancha)}<span class="badge bg-info rounded-pill">${total}</span></li>`
    )
    .join('') || '<li class="list-group-item">No hay datos de canchas.</li>';
}

function renderIngresosPorMetodo(pagos) {
  const container = document.getElementById('ingresosPorMetodo');
  if (!container) return;

  const totales = (pagos || []).reduce((acc, pago) => {
    const metodo = pago.metodoPago || 'Sin método';
    acc[metodo] = (acc[metodo] || 0) + Number(pago.monto || 0);
    return acc;
  }, {});

  container.innerHTML = Object.entries(totales)
    .sort(([, a], [, b]) => b - a)
    .map(
      ([metodo, total]) => `<li class="list-group-item d-flex justify-content-between align-items-center">${escapeHtml(metodo)}<span class="badge bg-secondary rounded-pill">${formatearMoneda(total)}</span></li>`
    )
    .join('') || '<li class="list-group-item">No hay ingresos registrados.</li>';
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
