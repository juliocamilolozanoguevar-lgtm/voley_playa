let clientesCache = [];
let estadosDisponibles = [];

window.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('clienteForm')?.addEventListener('submit', procesarClienteForm);
  document.getElementById('btnVerificarDisponibilidad')?.addEventListener('click', verificarDisponibilidadCliente);
  document.getElementById('btnCancelarEdicion')?.addEventListener('click', resetearFormularioCliente);

  await Promise.all([cargarCanchas(), cargarEstadosDesdeReservas(), cargarClientes()]);
});

async function cargarClientes() {
  const tbody = document.getElementById('clientesTableBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Cargando clientes...</td></tr>';

  try {
    const clientes = await window.VoleyApi.fetchJson('/clientes');
    clientesCache = clientes || [];
    actualizarResumenClientes();

    if (!clientes.length) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No hay clientes registrados.</td></tr>';
      return;
    }

    tbody.innerHTML = clientes
      .map((cliente) => {
        return `
          <tr>
            <td>${cliente.idCliente || '-'}</td>
            <td>${escapeHtml(cliente.dni)}</td>
            <td>${escapeHtml(cliente.nombre || '-')}</td>
            <td>${escapeHtml(cliente.apellido || '-')}</td>
            <td>${escapeHtml(cliente.celular || '-')}</td>
            <td>
              <div class="d-flex gap-2 flex-wrap">
                <button type="button" class="btn btn-sm btn-outline-primary btn-editar-cliente" data-id="${cliente.idCliente}" title="Editar cliente">
                  <i class="fa-solid fa-pen"></i> Editar
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-cliente" data-id="${cliente.idCliente}" title="Eliminar cliente">
                  <i class="fa-solid fa-trash"></i> Eliminar
                </button>
              </div>
            </td>
          </tr>`;
      })
      .join('');

    tbody.querySelectorAll('.btn-editar-cliente').forEach((button) => {
      button.addEventListener('click', () => cargarClienteEnFormulario(button.dataset.id));
    });

    tbody.querySelectorAll('.btn-eliminar-cliente').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        if (!id || !confirm('¿Seguro que deseas eliminar este cliente?')) return;
        try {
          await window.VoleyApi.fetchJson(`/clientes/${id}`, { method: 'DELETE' });
          await cargarClientes();
          mostrarAlerta('clientesAlert', 'Cliente eliminado correctamente.', 'success');
        } catch (error) {
          mostrarAlerta('clientesAlert', error.message || 'No se pudo eliminar el cliente.', 'danger');
        }
      });
    });
  } catch (error) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No se pudo cargar la lista de clientes.</td></tr>';
    mostrarAlerta('clientesAlert', error.message || 'Error de conexión con el backend.', 'danger');
  }
}

async function cargarCanchas() {
  const canchaSelect = document.getElementById('reservaCancha');
  if (!canchaSelect) return;

  canchaSelect.innerHTML = '<option value="">Cargando canchas...</option>';

  try {
    const canchas = await window.VoleyApi.fetchJson('/canchas');
    if (!canchas.length) {
      canchaSelect.innerHTML = '<option value="">No hay canchas disponibles</option>';
      return;
    }

    canchaSelect.innerHTML = `
      <option value="">Selecciona una cancha</option>
      ${canchas
        .map((cancha) => `<option value="${cancha.idCancha}">${escapeHtml(cancha.nombreCancha)}</option>`)
        .join('')}`;
  } catch (error) {
    canchaSelect.innerHTML = '<option value="">Error cargando canchas</option>';
    mostrarAlerta('clientesAlert', error.message || 'No se pudo cargar canchas.', 'danger');
  }
}

async function cargarEstadosDesdeReservas() {
  try {
    const reservas = await window.VoleyApi.fetchJson('/reservas');
    estadosDisponibles = Array.from(
      new Set((reservas || []).map((reserva) => (reserva.estado || 'PENDIENTE').toUpperCase()))
    );
    const estadoSelect = document.getElementById('reservaEstado');
    if (estadoSelect) {
      estadoSelect.innerHTML = estadosDisponibles
        .map((estado) => `<option value="${estado}">${escapeHtml(estado)}</option>`)
        .join('');
    }
  } catch (error) {
    estadosDisponibles = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA'];
  }
}

async function verificarDisponibilidadCliente(event) {
  event.preventDefault();
  const canchaId = Number(document.getElementById('reservaCancha')?.value);
  const fecha = document.getElementById('reservaFecha')?.value;
  const horaInicio = document.getElementById('reservaHoraInicio')?.value;
  const horaFin = document.getElementById('reservaHoraFin')?.value;

  // Evitar fechas pasadas
  const hoy = new Date().toISOString().split('T')[0];
  if (fecha < hoy) {
    mostrarAlerta('formAlert', 'No puedes seleccionar una fecha pasada.', 'warning');
    return;
  }

  if (!canchaId || !fecha || !horaInicio || !horaFin) {
    mostrarAlerta('formAlert', 'Selecciona cancha, fecha, hora inicio y hora fin.', 'warning');
    return;
  }

  try {
    const disponibilidad = await window.VoleyApi.fetchJson(
      `/reservas/disponibilidad?canchaId=${canchaId}&fecha=${fecha}&horaInicio=${horaInicio}&horaFin=${horaFin}`
    );
    renderizarDisponibilidad(disponibilidad);
    const mensaje = disponibilidad.disponible
      ? 'Horario disponible. Ya puedes registrar la reserva.'
      : 'El horario solicitado está ocupado. Ajusta la hora o cancha.';
    mostrarAlerta('formAlert', mensaje, disponibilidad.disponible ? 'success' : 'warning');
    document.getElementById('btnRegistrarCliente')?.toggleAttribute('disabled', !disponibilidad.disponible);
  } catch (error) {
    mostrarAlerta('formAlert', error.message || 'No se pudo verificar disponibilidad.', 'danger');
  }
}

function renderizarDisponibilidad(disponibilidad) {
  const container = document.getElementById('horariosDisponibles');
  if (!container) return;
  if (!container || !disponibilidad) return;

  if (!disponibilidad) {
    container.innerHTML = '<span class="text-secondary">No hay información de disponibilidad.</span>';
    return;
  }

  const ocupados = disponibilidad.horariosOcupados || [];
  const libres = disponibilidad.horariosLibres || [];

  container.innerHTML = `
    <div class="d-flex flex-wrap gap-2">
      ${horariosBotones(8, 21, libres, ocupados)}
    </div>
  `;

  container.querySelectorAll('.slot-button').forEach((button) => {
    button.addEventListener('click', () => {
      const inicio = button.dataset.slot;
      document.getElementById('reservaHoraInicio').value = inicio;
      // Autocalcular fin (ejemplo: 1 hora después)
      const [h, m] = inicio.split(':');
      document.getElementById('reservaHoraFin').value = `${String(Number(h) + 1).padStart(2, '0')}:${m}`;
    });
  });
}

function horariosBotones(inicio, fin, libres, ocupados) {
  return Array.from({ length: fin - inicio }, (_, index) => {
    const slot = `${String(inicio + index).padStart(2, '0')}:00`;
    const ocupado = ocupados.includes(slot);
    return `<button type="button" class="btn btn-sm ${ocupado ? 'btn-outline-danger disabled' : 'btn-outline-success slot-button'}" data-slot="${slot}" ${ocupado ? 'disabled' : ''}>${slot}</button>`;
  }).join('');
}

async function procesarClienteForm(event) {
  event.preventDefault();
  const idEdit = document.getElementById('clienteIdEdit')?.value;
  const dni = document.getElementById('clienteDni')?.value.trim();
  const nombre = document.getElementById('clienteNombre')?.value.trim();
  const apellido = document.getElementById('clienteApellido')?.value.trim();
  const celular = document.getElementById('clienteCelular')?.value.trim();
  const canchaId = Number(document.getElementById('reservaCancha')?.value);
  const fecha = document.getElementById('reservaFecha')?.value;
  const horaInicio = document.getElementById('reservaHoraInicio')?.value;
  const horaFin = document.getElementById('reservaHoraFin')?.value;
  const estado = document.getElementById('reservaEstado')?.value || 'PENDIENTE';
  const monto = Number(document.getElementById('reservaMonto')?.value || 0);

  // Validación: campos de cliente obligatorios
  if (!dni || !nombre || !apellido || !celular) {
    mostrarAlerta('formAlert', 'DNI, nombre, apellido y celular son obligatorios.', 'warning');
    return;
  }

  const camposReservaValidos = canchaId && fecha && horaInicio && horaFin;
  if (!camposReservaValidos && !idEdit) {
    mostrarAlerta('formAlert', 'Cancha, fecha, hora inicio y hora fin son obligatorios para registrar la reserva.', 'warning');
    return;
  }

  if (horaInicio && horaFin && horaInicio >= horaFin) {
    mostrarAlerta('formAlert', 'La hora inicio debe ser anterior a la hora fin.', 'warning');
    return;
  }

  try {
    // Si estamos editando un cliente (sin reserva)
    if (idEdit) {
      await window.VoleyApi.fetchJson(`/clientes/${idEdit}`, {
        method: 'PUT',
        body: JSON.stringify({ dni, nombre, apellido }),
      });
      mostrarAlerta('clientesAlert', 'Cliente actualizado correctamente.', 'success');
      resetearFormularioCliente();
      await cargarClientes();
      return;
    }

    // Intentar obtener cliente existente
    let clienteExistente = null;
    try {
      clienteExistente = await window.VoleyApi.fetchJson(`/clientes/dni/${encodeURIComponent(dni)}`);
    } catch (err) {
      // Cliente no existe
    }

    // Si el cliente ya existe, notificar
    if (clienteExistente) {
      mostrarAlerta('formAlert', `Cliente ${clienteExistente.nombre} ${clienteExistente.apellido} ya existe. Se registrará la reserva a su nombre.`, 'info');
    } else {
      // Crear nuevo cliente
      await window.VoleyApi.fetchJson('/clientes', {
        method: 'POST',
        body: JSON.stringify({ dni, nombre, apellido, celular }),
      });
    }

    // Registrar reserva siempre que el formulario contenga datos válidos
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
      }),
    });

    mostrarAlerta('clientesAlert', 'Cliente y reserva registrados correctamente en la base de datos.', 'success');

    resetearFormularioCliente();
    await Promise.all([cargarClientes(), cargarEstadosDesdeReservas()]);
  } catch (error) {
    mostrarAlerta('formAlert', error.message || 'No se pudo registrar cliente y/o reserva.', 'danger');
  }
}

function cargarClienteEnFormulario(id) {
  const cliente = clientesCache.find((item) => `${item.idCliente}` === `${id}`);
  if (!cliente) {
    return;
  }

  document.getElementById('clienteIdEdit').value = cliente.idCliente;
  document.getElementById('clienteDni').value = cliente.dni || '';
  document.getElementById('clienteNombre').value = cliente.nombre || '';
  document.getElementById('clienteApellido').value = cliente.apellido || '';
  document.getElementById('clienteCelular').value = cliente.celular || '';
  document.getElementById('clienteFormTitle').textContent = 'Editar cliente';
  document.getElementById('btnRegistrarCliente').textContent = 'Actualizar cliente';
  document.getElementById('btnCancelarEdicion').classList.remove('d-none');
}

function resetearFormularioCliente() {
  document.getElementById('clienteForm')?.reset();
  document.getElementById('clienteIdEdit').value = '';
  document.getElementById('clienteFormTitle').textContent = 'Registrar cliente y reserva';
  document.getElementById('btnRegistrarCliente').textContent = 'Registrar cliente y reserva';
  document.getElementById('btnCancelarEdicion')?.classList.add('d-none');
  limpiarAlerta('formAlert');
}

function actualizarResumenClientes() {
  actualizarTexto('clientesRegistrados', clientesCache.length || 0);
  const ultimo = clientesCache[clientesCache.length - 1];
  actualizarTexto('clienteReciente', `${ultimo?.nombre || 'Sin datos'} ${ultimo?.apellido || ''}`.trim() || 'Sin datos');
  actualizarTexto('dniReciente', ultimo?.dni || 'Sin datos');
}

function mostrarAlerta(id, mensaje, tipo) {
  const alerta = document.getElementById(id);
  if (!alerta) return;
  alerta.className = `alert app-alert alert-${tipo} rounded-4`;
  alerta.textContent = mensaje;
  alerta.classList.remove('d-none');
}

function limpiarAlerta(id) {
  const alerta = document.getElementById(id);
  if (!alerta) return;
  alerta.textContent = '';
  alerta.classList.add('d-none');
}

function actualizarTexto(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.textContent = valor;
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
