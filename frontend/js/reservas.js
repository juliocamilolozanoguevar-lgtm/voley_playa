let reservasCache = [];

document.addEventListener("DOMContentLoaded", async () => {
  await cargarClientesEnSelect();
  await cargarCanchasEnSelect();
  await listarReservas();
  bindReservaForm();
  bindBuscadorReservas();
});

// =========================
// CARGAR SELECTS
// =========================

async function cargarClientesEnSelect() {
  const select = document.getElementById("selectCliente");
  if (!select) return;

  select.innerHTML = `<option value="">Seleccione un cliente</option>`;

  try {
    const clientes = await window.VoleyApi.fetchJson("/clientes");
    clientes.forEach((cliente) => {
      const nombre = `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || "Sin nombre";
      select.innerHTML += `<option value="${cliente.idCliente}">${escapeHtml(nombre)}</option>`;
    });
  } catch (error) {
    select.innerHTML = `<option value="">Sin clientes disponibles</option>`;
    mostrarAlerta("reservaAlert", error.message, "danger");
  }
}

async function cargarCanchasEnSelect() {
  const select = document.getElementById("selectCancha");
  if (!select) return;

  select.innerHTML = `<option value="">Seleccione una cancha</option>`;

  try {
    const canchas = await window.VoleyApi.fetchJson("/canchas");
    canchas.forEach((cancha) => {
      select.innerHTML += `<option value="${cancha.idCancha}">${escapeHtml(cancha.nombreCancha)}</option>`;
    });
  } catch (error) {
    select.innerHTML = `<option value="">Sin canchas disponibles</option>`;
    mostrarAlerta("reservaAlert", error.message, "danger");
  }
}

// =========================
// LISTAR RESERVAS
// =========================

async function listarReservas() {
  const tbody = document.getElementById("tablaReservas");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7">Cargando reservas...</td></tr>`;

  try {
    const reservas = await window.VoleyApi.fetchJson("/reservas");
    reservasCache = reservas;
    renderReservas(reservasCache);
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="7">Error al cargar</td></tr>`;
  }
}

// =========================
// RENDER TABLA
// =========================

function renderReservas(reservas) {
  const tbody = document.getElementById("tablaReservas");
  if (!tbody) return;

  if (!reservas.length) {
    tbody.innerHTML = `<tr><td colspan="7">Sin reservas</td></tr>`;
    return;
  }

  tbody.innerHTML = reservas.map((reserva) => {
    return `
      <tr>
        <td>${formatearFecha(reserva.fecha)}</td>
        <td>${formatearHora(reserva.horaInicio)} - ${formatearHora(reserva.horaFin)}</td>
        <td>${escapeHtml(reserva.cliente?.nombre || "")}</td>
        <td>${escapeHtml(reserva.cancha?.nombreCancha || "")}</td>

        <td>
          <select class="form-select reserva-estado-select" data-reserva-id="${reserva.idReserva}">
            ${buildEstadoOptions(reserva.estadoReserva)}
          </select>
        </td>

        <td>
          <input type="number" class="form-control reserva-adelanto-input"
            data-reserva-id="${reserva.idReserva}"
            value="${reserva.adelanto || 0}">
        </td>

        <td>
          <div class="d-flex gap-2">

            <!-- BOTON AZUL -->
            <button class="btn btn-primary btn-sm reserva-edit-btn"
              data-reserva-id="${reserva.idReserva}">
              Guardar
            </button>

            <!-- BOTON ROJO -->
            <button class="btn btn-danger btn-sm reserva-delete-btn"
              data-reserva-id="${reserva.idReserva}">
              Eliminar
            </button>

          </div>
        </td>
      </tr>
    `;
  }).join("");

  // =========================
  // EDITAR (GUARDAR CAMBIOS)
  // =========================

  tbody.querySelectorAll(".reserva-edit-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.reservaId;

      const estadoEl = document.querySelector(`.reserva-estado-select[data-reserva-id="${id}"]`);
      const adelantoEl = document.querySelector(`.reserva-adelanto-input[data-reserva-id="${id}"]`);

      const estado = estadoEl ? estadoEl.value : null;
      const adelanto = adelantoEl ? adelantoEl.value : 0;

      try {
        await window.VoleyApi.fetchJson(`/reservas/${id}/estado`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            estadoReserva: estado,
            adelanto: Number(adelanto)
          })
        });

        mostrarAlerta("reservaAlert", "Reserva actualizada correctamente", "success");
        listarReservas();

      } catch (e) {
        mostrarAlerta("reservaAlert", "Error al actualizar reserva", "danger");
      }
    });
  });

  // =========================
  // ELIMINAR
  // =========================

  tbody.querySelectorAll(".reserva-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.reservaId;

      if (!confirm("¿Eliminar reserva?")) return;

      try {
        await window.VoleyApi.fetchJson(`/reservas/${id}`, {
          method: "DELETE"
        });

        mostrarAlerta("reservaAlert", "Reserva eliminada", "success");
        listarReservas();

      } catch (e) {
        mostrarAlerta("reservaAlert", "Error al eliminar", "danger");
      }
    });
  });
}

// =========================
// UTILIDADES
// =========================

function formatearFecha(fecha) {
  if (!fecha) return "-";
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

function formatearHora(h) {
  return h ? h.slice(0, 5) : "--:--";
}

function buildEstadoOptions(actual) {
  const estados = ["PENDIENTE PAGO", "PAGADO", "CANCELADO"];
  return estados.map(e =>
    `<option ${e === actual ? "selected" : ""}>${e}</option>`
  ).join("");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}