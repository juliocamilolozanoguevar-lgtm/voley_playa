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
    mostrarAlerta("reservaAlert", error.message || "No se pudieron cargar las reservas.", "danger");
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
        <td>${escapeHtml(formatClienteNombre(reserva.cliente))}</td>
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

        await listarReservas();
        mostrarAlerta("reservaAlert", "Reserva actualizada correctamente.", "success");

      } catch (e) {
        mostrarAlerta("reservaAlert", e.message || "Error al actualizar reserva", "danger");
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

        await listarReservas();
        mostrarAlerta("reservaAlert", "Reserva eliminada.", "success");

      } catch (e) {
        mostrarAlerta("reservaAlert", e.message || "Error al eliminar", "danger");
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
  const actualNorm = String(actual || "").trim().toUpperCase();
  return estados
    .map(
      (e) =>
        `<option value="${e}" ${e === actualNorm ? "selected" : ""}>${e}</option>`
    )
    .join("");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatClienteNombre(cliente) {
  if (!cliente) {
    return "";
  }
  return `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim();
}

function bindReservaForm() {
  const form = document.getElementById("reservaForm");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const idCliente = Number(document.getElementById("selectCliente")?.value);
    const idCancha = Number(document.getElementById("selectCancha")?.value);
    const fecha = document.getElementById("fecha")?.value || "";
    const horaInicioRaw = document.getElementById("horaInicio")?.value || "";
    const horaFinRaw = document.getElementById("horaFin")?.value || "";
    const estadoReserva = document.getElementById("estadoReserva")?.value || "PENDIENTE PAGO";
    const adelantoVal = document.getElementById("adelantoReserva")?.value;

    if (!idCliente || !idCancha || !fecha || !horaInicioRaw || !horaFinRaw) {
      mostrarAlerta("reservaAlert", "Completa cliente, cancha, fecha y horas.", "danger");
      return;
    }

    const horaInicio = normalizarHoraParaApi(horaInicioRaw);
    const horaFin = normalizarHoraParaApi(horaFinRaw);

    const payload = {
      idCliente,
      idCancha,
      fecha,
      horaInicio,
      horaFin,
      estadoReserva,
      adelanto: adelantoVal === "" || adelantoVal === undefined ? 0 : Number(adelantoVal),
    };

    try {
      await window.VoleyApi.fetchJson("/reservas", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      form.reset();
      await cargarClientesEnSelect();
      await cargarCanchasEnSelect();
      await listarReservas();
      mostrarAlerta("reservaAlert", "Reserva registrada correctamente.", "success");
    } catch (error) {
      mostrarAlerta("reservaAlert", error.message || "No se pudo guardar la reserva.", "danger");
    }
  });
}

function normalizarHoraParaApi(valor) {
  if (!valor) {
    return valor;
  }
  return valor.length === 5 ? `${valor}:00` : valor;
}

function bindBuscadorReservas() {
  const input = document.getElementById("buscarReservaCliente");
  if (!input) {
    return;
  }

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      renderReservas(reservasCache);
      return;
    }

    const filtradas = reservasCache.filter((reserva) => {
      const nombreCompleto = formatClienteNombre(reserva.cliente).toLowerCase();
      const dni = String(reserva.cliente?.dni || "").toLowerCase();
      return nombreCompleto.includes(q) || dni.includes(q);
    });

    renderReservas(filtradas);
  });
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