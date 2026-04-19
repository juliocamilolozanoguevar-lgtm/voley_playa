let reservasCache = [];

document.addEventListener("DOMContentLoaded", async () => {
  await cargarClientesEnSelect();
  await cargarCanchasEnSelect();
  await listarReservas();
  bindReservaForm();
  bindBuscadorReservas();
});

async function cargarClientesEnSelect() {
  const select = document.getElementById("selectCliente");
  if (!select) {
    return;
  }

  select.innerHTML = `<option value="">Seleccione un cliente</option>`;

  try {
    const clientes = await window.VoleyApi.fetchJson("/clientes");
    clientes.forEach((cliente) => {
      const nombre = `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || "Sin nombre";
      select.innerHTML += `<option value="${cliente.idCliente}">${escapeHtml(nombre)}</option>`;
    });
  } catch (error) {
    select.innerHTML = `<option value="">Sin clientes disponibles</option>`;
    mostrarAlerta("reservaAlert", error.message || "No se pudieron cargar los clientes.", "danger");
  }
}

async function cargarCanchasEnSelect() {
  const select = document.getElementById("selectCancha");
  if (!select) {
    return;
  }

  select.innerHTML = `<option value="">Seleccione una cancha</option>`;

  try {
    const canchas = await window.VoleyApi.fetchJson("/canchas");
    canchas.forEach((cancha) => {
      select.innerHTML += `<option value="${cancha.idCancha}">${escapeHtml(cancha.nombreCancha || "Sin nombre")}</option>`;
    });
  } catch (error) {
    select.innerHTML = `<option value="">Sin canchas disponibles</option>`;
    mostrarAlerta("reservaAlert", error.message || "No se pudieron cargar las canchas.", "danger");
  }
}

async function listarReservas() {
  const tbody = document.getElementById("tablaReservas");
  if (!tbody) {
    return;
  }

  tbody.innerHTML = `
    <tr class="empty-row">
      <td colspan="7">Cargando reservas...</td>
    </tr>
  `;

  try {
    const reservas = await window.VoleyApi.fetchJson("/reservas");
    reservasCache = reservas;
    limpiarAlerta("reservaAlert");
    renderReservas(reservasCache);
  } catch (error) {
    reservasCache = [];
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="7">No se pudo cargar la lista de reservas.</td>
      </tr>
    `;
    mostrarAlerta("reservaAlert", error.message || "No se pudo conectar con el backend.", "danger");
  }
}

function bindReservaForm() {
  const form = document.getElementById("reservaForm");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const clienteId = Number(document.getElementById("selectCliente").value);
    const canchaId = Number(document.getElementById("selectCancha").value);
    const fecha = document.getElementById("fecha").value;
    const horaInicio = document.getElementById("horaInicio").value;
    const horaFin = document.getElementById("horaFin").value;
    const estadoReserva = document.getElementById("estadoReserva").value;

    if (!clienteId || !canchaId || !fecha || !horaInicio || !horaFin || !estadoReserva) {
      mostrarAlerta("reservaAlert", "Completa todos los campos de la reserva.", "danger");
      return;
    }

    if (horaFin <= horaInicio) {
      mostrarAlerta("reservaAlert", "La hora final debe ser mayor que la hora inicial.", "danger");
      return;
    }

    try {
      await window.VoleyApi.fetchJson("/reservas", {
        method: "POST",
      body: JSON.stringify({
          fecha,
          horaInicio,
          horaFin,
          estadoReserva,
          adelanto: Number(document.getElementById("adelantoReserva").value || 0),
          idCliente: clienteId,
          idCancha: canchaId,
        }),
      });

      form.reset();
      await listarReservas();
      mostrarAlerta("reservaAlert", "Reserva registrada correctamente.", "success");
    } catch (error) {
      mostrarAlerta("reservaAlert", error.message || "No se pudo registrar la reserva.", "danger");
    }
  });
}

function bindBuscadorReservas() {
  const input = document.getElementById("buscarReservaCliente");
  if (!input) {
    return;
  }

  input.addEventListener("input", () => {
    const termino = input.value.trim().toLowerCase();
    const filtradas = reservasCache.filter((reserva) => {
      const cliente = `${reserva?.cliente?.nombre || ""} ${reserva?.cliente?.apellido || ""}`.trim().toLowerCase();
      const dni = String(reserva?.cliente?.dni || "").toLowerCase();
      return !termino || cliente.includes(termino) || dni.includes(termino);
    });

    renderReservas(filtradas);
  });
}

function renderReservas(reservas) {
  const tbody = document.getElementById("tablaReservas");
  if (!tbody) {
    return;
  }

  if (!reservas.length) {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="7">No hay reservas registradas.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = reservas
    .map((reserva) => {
      const inicio = formatearHora(reserva.horaInicio);
      const fin = formatearHora(reserva.horaFin);
      const cliente = `${reserva?.cliente?.nombre || ""} ${reserva?.cliente?.apellido || ""}`.trim() || "Cliente anonimo";
      const cancha = reserva?.cancha?.nombreCancha || "Sin cancha";
      const estado = normalizarEstadoReserva(reserva.estadoReserva);
      const adelanto = Number(reserva.adelanto || 0).toFixed(2);

      return `
        <tr>
          <td>${escapeHtml(formatearFecha(reserva.fecha))}</td>
          <td>${escapeHtml(`${inicio} - ${fin}`)}</td>
          <td>${escapeHtml(cliente)}</td>
          <td>${escapeHtml(cancha)}</td>
          <td>
            <select class="form-select form-select-sm rounded-4 reserva-estado-select" data-reserva-id="${escapeHtml(reserva.idReserva)}">
              ${buildEstadoOptions(reserva.estadoReserva)}
            </select>
          </td>
          <td>
            <input type="number" class="form-control form-control-sm rounded-4 reserva-adelanto-input" data-reserva-id="${escapeHtml(reserva.idReserva)}" min="0" step="0.01" value="${escapeHtml(adelanto)}">
          </td>
          <td>
            <button type="button" class="btn btn-primary btn-sm rounded-4 reserva-save-btn" data-reserva-id="${escapeHtml(reserva.idReserva)}">
              Guardar
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  tbody.querySelectorAll(".reserva-save-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.reservaId;
      const estadoSelect = tbody.querySelector(`.reserva-estado-select[data-reserva-id="${id}"]`);
      const adelantoInput = tbody.querySelector(`.reserva-adelanto-input[data-reserva-id="${id}"]`);

      try {
        button.disabled = true;
        await window.VoleyApi.fetchJson(`/reservas/${id}/estado`, {
          method: "PUT",
          body: JSON.stringify({
            estadoReserva: estadoSelect?.value || "PENDIENTE PAGO",
            adelanto: Number(adelantoInput?.value || 0),
          }),
        });

        await listarReservas();
        mostrarAlerta("reservaAlert", "Reserva actualizada correctamente.", "success");
      } catch (error) {
        mostrarAlerta("reservaAlert", error.message || "No se pudo actualizar la reserva.", "danger");
      } finally {
        button.disabled = false;
      }
    });
  });
}

function normalizarEstadoReserva(estado) {
  const valor = (estado || "PENDIENTE PAGO").toUpperCase();
  if (valor === "PAGADO") {
    return "Pagado";
  }
  if (valor === "CANCELADO") {
    return "Cancelado";
  }
  return "Pendiente pago";
}

function obtenerClaseEstado(estado) {
  const valor = estado.toLowerCase();
  if (valor.includes("pagado")) {
    return "status-confirmada";
  }
  if (valor.includes("cancelado")) {
    return "status-finalizada";
  }
  return "status-pendiente";
}

function buildEstadoOptions(estadoActual) {
  const estados = ["PENDIENTE PAGO", "PAGADO", "CANCELADO"];
  const actual = (estadoActual || "PENDIENTE PAGO").toUpperCase();
  return estados
    .map((estado) => `<option value="${estado}" ${estado === actual ? "selected" : ""}>${escapeHtml(normalizarEstadoReserva(estado))}</option>`)
    .join("");
}

function formatearFecha(fecha) {
  if (!fecha) {
    return "-";
  }

  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

function formatearHora(hora) {
  if (!hora) {
    return "--:--";
  }
  return hora.slice(0, 5);
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
