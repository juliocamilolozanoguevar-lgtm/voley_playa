let reservasCache = [];
let canchasCache = [];

window.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('btnBuscarCliente')?.addEventListener('click', buscarClientePorDni);
  document.getElementById('btnVerificarDisponibilidad')?.addEventListener('click', verificarDisponibilidadReserva);
  document.getElementById('reservaForm')?.addEventListener('submit', procesarReservaForm);

  await Promise.all([cargarCanchas(), cargarReservas(), cargarEstadosReservas()]);
});

async function cargarCanchas() {
  const canchaSelect = document.getElementById('reservaCancha');
  if (!canchaSelect) return;

  canchaSelect.innerHTML = '<option value="">Cargando canchas...</option>';

  try {
    canchasCache = await window.VoleyApi.fetchJson('/canchas');
    if (!canchasCache.length) {
      canchaSelect.innerHTML = '<option value="">No hay canchas registradas</option>';
      return;
    }

    canchaSelect.innerHTML = `
      <option value="">Selecciona una cancha</option>
      ${canchasCache.map((cancha) => `<option value="${cancha.idCancha}">${escapeHtml(cancha.nombreCancha)}</option>`).join('')}`;
  } catch (error) {
    canchaSelect.innerHTML = '<option value="">Error cargando canchas</option>';
    mostrarAlerta('reservaFormAlert', error.message || 'No se pudo cargar canchas.', 'danger');
  }
}

async function cargarReservas() {
  const tbody = document.getElementById('reservasTableBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr class="empty-row"><td colspan="8" class="text-center py-4">Cargando reservas...</td></tr>';

  try {
    reservasCache = await window.VoleyApi.fetchJson('/reservas');
    if (!reservasCache.length) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="8" class="text-center py-4">No hay reservas registradas.</td></tr>';
      return;
    }

    tbody.innerHTML = reservasCache
      .map((reserva) => {
        const cliente = reserva.cliente || {};
        const clienteNombre = `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() || cliente.dni || 'Cliente desconocido';
        const horario = `${reserva.horaInicio || '-'} - ${reserva.horaFin || '-'}`;
        const estado = reserva.estado ? reserva.estado.toUpperCase() : 'PENDIENTE';
        const adelanto = formatearMoneda(reserva.pago?.monto || 0);
        const reservaId = reserva.idReserva || '-';

        // Determinar qué botones mostrar según el estado
        let botonesAcciones = '';
        
        if (estado === 'PENDIENTE') {
          botonesAcciones = `
            <button type="button" class="btn btn-sm btn-outline-success btn-confirmar" data-id="${reserva.idReserva}" title="Cambiar a CONFIRMADA">
              <i class="fa-solid fa-check"></i> Confirmar
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger btn-cancelar" data-id="${reserva.idReserva}" title="Cambiar a CANCELADA">
              <i class="fa-solid fa-ban"></i> Cancelar
            </button>`;
        } else if (estado === 'CONFIRMADA') {
          botonesAcciones = `
            <button type="button" class="btn btn-sm btn-outline-danger btn-cancelar" data-id="${reserva.idReserva}" title="Cambiar a CANCELADA">
              <i class="fa-solid fa-ban"></i> Cancelar
            </button>`;
        } else if (estado === 'CANCELADA') {
          botonesAcciones = '<span class="text-muted small">Cancelada</span>';
        }

        return `
          <tr>
            <td><small class="text-muted">${escapeHtml(String(reservaId))}</small></td>
            <td><strong>${escapeHtml(clienteNombre)}</strong></td>
            <td>${escapeHtml(reserva.cancha?.nombreCancha || 'Sin cancha')}</td>
            <td>${escapeHtml(reserva.fecha || '-')}</td>
            <td><small>${escapeHtml(horario)}</small></td>
            <td>${adelanto}</td>
            <td><span class="status-badge status-${estado.toLowerCase()}">${escapeHtml(estado)}</span></td>
            <td>
              <div class="d-flex flex-wrap gap-1">
                ${botonesAcciones}
              </div>
            </td>
          </tr>`;
      })
      .join('');

    // Agregar listeners a botones de confirmar
    tbody.querySelectorAll('.btn-confirmar').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        if (!id || !confirm('¿Cambiar estado de esta reserva a CONFIRMADA?')) return;
        await actualizarEstadoReserva(id, 'CONFIRMADA');
      });
    });

    // Agregar listeners a botones de cancelar
    tbody.querySelectorAll('.btn-cancelar').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        if (!id || !confirm('¿Cambiar estado de esta reserva a CANCELADA?')) return;
        await actualizarEstadoReserva(id, 'CANCELADA');
      });
    });
  } catch (error) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="8" class="text-center py-4">No se pudo cargar la lista de reservas.</td></tr>';
    mostrarAlerta('reservaAlert', error.message || 'Error de conexión con el backend.', 'danger');
  }
}

async function cargarEstadosReservas() {
  try {
    const reservas = await window.VoleyApi.fetchJson('/reservas');
    const estados = Array.from(new Set((reservas || []).map((reserva) => (reserva.estado || 'PENDIENTE').toUpperCase())));
    const estadoSelect = document.getElementById('reservaEstado');
    if (estadoSelect) {
      estadoSelect.innerHTML = estados.map((estado) => `<option value="${estado}">${escapeHtml(estado)}</option>`).join('');
    }
  } catch (error) {
    /* no romper si no hay estados */
  }
}

async function buscarClientePorDni() {
  const dni = document.getElementById('buscarClienteDni')?.value.trim();
  if (!dni) {
    mostrarAlerta('reservaFormAlert', 'Ingresa un DNI para buscar.', 'warning');
    return;
  }

  try {
    const cliente = await window.VoleyApi.fetchJson(`/clientes/dni/${encodeURIComponent(dni)}`);
    document.getElementById('reservaClienteNombre').value = cliente.nombre || '';
    document.getElementById('reservaClienteApellido').value = cliente.apellido || '';
    mostrarAlerta('reservaFormAlert', 'Cliente encontrado en la base de datos.', 'success');
  } catch (error) {
    document.getElementById('reservaClienteNombre').value = '';
    document.getElementById('reservaClienteApellido').value = '';
    mostrarAlerta('reservaFormAlert', 'Cliente no existe. Completa nombre y apellido para crearlo.', 'info');
  }
}

async function verificarDisponibilidadReserva(event) {
  event.preventDefault();
  const canchaId = Number(document.getElementById('reservaCancha')?.value);
  const fecha = document.getElementById('reservaFecha')?.value;
  const horaInicio = document.getElementById('reservaHoraInicio')?.value;
  const horaFin = document.getElementById('reservaHoraFin')?.value;

  if (!canchaId || !fecha || !horaInicio || !horaFin) {
    mostrarAlerta('reservaFormAlert', 'Selecciona cancha, fecha y horario para verificar disponibilidad.', 'warning');
    return;
  }

  try {
    const disponibilidad = await window.VoleyApi.fetchJson(`/reservas/disponibilidad?canchaId=${canchaId}&fecha=${fecha}&horaInicio=${horaInicio}&horaFin=${horaFin}`);
    renderizarDisponibilidadReserva(disponibilidad);
    mostrarAlerta('reservaFormAlert', disponibilidad.disponible ? 'Horario disponible.' : 'Horario ocupado. Cambia la cancha o el horario.', disponibilidad.disponible ? 'success' : 'warning');
  } catch (error) {
    mostrarAlerta('reservaFormAlert', error.message || 'No se pudo verificar disponibilidad.', 'danger');
  }
}

function renderizarDisponibilidadReserva(disponibilidad) {
  const container = document.getElementById('horariosDisponibles');
  if (!container) return;

  const ocupados = disponibilidad.horariosOcupados || [];
  const libres = disponibilidad.horariosLibres || [];

  container.innerHTML = `
    <div class="d-flex flex-wrap gap-2 align-items-center">${horariosBotones(8, 22, libres, ocupados)}</div>
  `;
}

function horariosBotones(inicio, fin, libres, ocupados) {
  const slots = [];
  for (let hora = inicio; hora < fin; hora += 1) {
    const slot = `${String(hora).padStart(2, '0')}:00`;
    const ocupado = ocupados.includes(slot);
    slots.push(`
      <button type="button" class="btn btn-sm ${ocupado ? 'btn-outline-danger disabled' : 'btn-outline-success slot-button'}" data-slot="${slot}" ${ocupado ? 'disabled' : ''}>
        ${slot}
      </button>
    `);
  }
  return slots.join('');
}

document.addEventListener('click', (event) => {
  if (!event.target.matches('.slot-button')) return;
  const slot = event.target.dataset.slot;
  if (!slot) return;
  document.getElementById('reservaHoraInicio').value = slot;
});

async function procesarReservaForm(event) {
  event.preventDefault();
  const dni = document.getElementById('buscarClienteDni')?.value.trim();
  const nombre = document.getElementById('reservaClienteNombre')?.value.trim();
  const apellido = document.getElementById('reservaClienteApellido')?.value.trim();
  const canchaId = Number(document.getElementById('reservaCancha')?.value);
  const fecha = document.getElementById('reservaFecha')?.value;
  const horaInicio = document.getElementById('reservaHoraInicio')?.value;
  const horaFin = document.getElementById('reservaHoraFin')?.value;
  const monto = Number(document.getElementById('reservaMonto')?.value || 0);
  const metodoPago = document.getElementById('reservaMetodo')?.value;
  const estado = document.getElementById('reservaEstado')?.value || 'PENDIENTE';

  if (!dni || !nombre || !apellido || !canchaId || !fecha || !horaInicio || !horaFin) {
    mostrarAlerta('reservaFormAlert', 'Completa todos los campos obligatorios.', 'warning');
    return;
  }

  try {
    await window.VoleyApi.fetchJson('/reservas', {
      method: 'POST',
      body: JSON.stringify({
        clienteDni: dni,
        clienteNombre: nombre,
        clienteApellido: apellido,
        canchaId,
        fecha,
        horaInicio,
        horaFin,
        monto,
        estado,
        metodoPago,
      }),
    });

    mostrarAlerta('reservaFormAlert', 'Reserva registrada correctamente.', 'success');
    await cargarReservas();
    cargarEstadosReservas();
    document.getElementById('reservaForm')?.reset();
  } catch (error) {
    mostrarAlerta('reservaFormAlert', error.message || 'No se pudo registrar la reserva.', 'danger');
  }
}

async function actualizarEstadoReserva(id, estado) {
  const reserva = reservasCache.find((item) => `${item.idReserva}` === `${id}`);
  if (!reserva) return;

  const cliente = reserva.cliente || {};
  const request = {
    fecha: reserva.fecha,
    horaInicio: reserva.horaInicio,
    horaFin: reserva.horaFin,
    clienteDni: cliente.dni,
    clienteNombre: cliente.nombre,
    clienteApellido: cliente.apellido,
    canchaId: reserva.cancha?.idCancha,
    monto: reserva.pago?.monto || 0,
    metodoPago: reserva.pago?.metodoPago || '',
    estado,
  };

  try {
    await window.VoleyApi.fetchJson(`/reservas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
    await cargarReservas();
    mostrarAlerta('reservaAlert', `Reserva ${estado.toLowerCase()} correctamente.`, 'success');
  } catch (error) {
    mostrarAlerta('reservaAlert', error.message || 'No se pudo actualizar la reserva.', 'danger');
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
