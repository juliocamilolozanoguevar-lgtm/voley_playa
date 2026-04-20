let reservaEdicionId = null;
let canchasCache = [];
let clientesCache = [];

document.addEventListener("DOMContentLoaded", async () => {
  bindReservaEditForm();
  await Promise.all([cargarReservas(), cargarCanchas(), cargarClientes()]);
});

async function cargarReservas() {
  const tbody = document.getElementById("tablaReservas");
  if (!tbody) {
    return;
  }

  tbody.innerHTML = `
    <tr class="empty-row">
      <td colspan="4">Cargando reservas...</td>
    </tr>
  `;

  try {
    const reservas = await window.VoleyApi.fetchJson("/reservas");
    limpiarAlerta("reservaAlert");

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
        const clienteNombre = reserva?.cliente?.nombreCompleto || `${reserva?.cliente?.nombre || ""} ${reserva?.cliente?.apellido || ""}`.trim() || "Cliente desconocido";
        const fecha = reserva.fecha || "-";
        const pagado = reserva.pago ? "Sí" : "No";
        return `
          <tr>
            <td>${escapeHtml(clienteNombre)}</td>
            <td>${escapeHtml(fecha)}</td>
            <td>${escapeHtml(pagado)}</td>
            <td>
              <div class="d-flex flex-wrap gap-2">
                <button type="button" class="btn btn-sm btn-outline-primary reserva-edit-btn" data-id="${reserva.idReserva}">Editar</button>
                <button type="button" class="btn btn-sm btn-outline-danger reserva-delete-btn" data-id="${reserva.idReserva}">Eliminar</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    tbody.querySelectorAll(".reserva-edit-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!id) {
          return;
        }
        const reserva = await cargarReservaPorId(id);
        if (reserva) {
          iniciarEdicionReserva(reserva);
        }
      });
    });

    tbody.querySelectorAll(".reserva-delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!id || !confirm("¿Eliminar esta reserva?")) {
          return;
        }
        try {
          await window.VoleyApi.fetchJson(`/reservas/${id}`, { method: "DELETE" });
          await cargarReservas();
          mostrarAlerta("reservaAlert", "Reserva eliminada correctamente.", "success");
        } catch (error) {
          mostrarAlerta(
            "reservaAlert",
            error.message || "No se pudo eliminar la reserva.",
            "danger"
          );
        }
      });
    });
  } catch (error) {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="4">No se pudo cargar la lista de reservas.</td>
      </tr>
    `;
    mostrarAlerta("reservaAlert", error.message || "No se pudo conectar con el backend.", "danger");
  }
}

async function cargarReservaPorId(id) {
  try {
    const reservas = await window.VoleyApi.fetchJson("/reservas");
    return reservas.find((item) => `${item.idReserva}` === `${id}`) || null;
  } catch (error) {
    return null;
  }
}

async function cargarCanchas() {
  try {
    canchasCache = await window.VoleyApi.fetchJson("/canchas");
  } catch (error) {
    canchasCache = [];
  }
}

async function cargarClientes() {
  try {
    clientesCache = await window.VoleyApi.fetchJson("/clientes");
  } catch (error) {
    clientesCache = [];
  }
}

function bindReservaEditForm() {
  const form = document.getElementById("reservaEditForm");
  const cancelarBtn = document.getElementById("reservaCancelarEdicion");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = document.getElementById("reservaEditarId")?.value;
    const fecha = document.getElementById("reservaEditarFecha")?.value;
    const horaInicio = document.getElementById("reservaEditarHoraInicio")?.value;
    const horaFin = document.getElementById("reservaEditarHoraFin")?.value;
    const canchaId = Number(document.getElementById("reservaEditarCancha")?.value);
    const monto = Number(document.getElementById("reservaEditarMonto")?.value || 0);

    if (!id || !fecha || !horaInicio || !horaFin || !canchaId) {
      mostrarAlerta("reservaEditAlert", "Completa todos los campos de la reserva.", "danger");
      return;
    }

    try {
      await window.VoleyApi.fetchJson(`/reservas/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          fecha: fecha,
          horaInicio: horaInicio + ":00",
          horaFin: horaFin + ":00",
          canchaId: canchaId,
          monto: monto,
          estado: "PENDIENTE",
        }),
      });

      form.classList.add("d-none");
      limpiarAlerta("reservaEditAlert");
      await cargarReservas();
      mostrarAlerta("reservaAlert", "Reserva actualizada correctamente.", "success");
    } catch (error) {
      mostrarAlerta(
        "reservaEditAlert",
        error.message || "No se pudo actualizar la reserva.",
        "danger"
      );
    }
  });

  if (cancelarBtn) {
    cancelarBtn.addEventListener("click", () => {
      form.classList.add("d-none");
      limpiarAlerta("reservaEditAlert");
    });
  }
}

function iniciarEdicionReserva(reserva) {
  reservaEdicionId = reserva.idReserva;
  const form = document.getElementById("reservaEditForm");
  if (!form) {
    return;
  }

  document.getElementById("reservaEditarId").value = reserva.idReserva || "";
  document.getElementById("reservaEditarFecha").value = reserva.fecha || "";
  document.getElementById("reservaEditarHoraInicio").value = reserva.horaInicio || "";
  document.getElementById("reservaEditarHoraFin").value = reserva.horaFin || "";
  document.getElementById("reservaEditarMonto").value = reserva.pago?.monto ?? 0;
  document.getElementById("reservaEditarClienteDni").value = reserva.cliente?.dni || "";
  document.getElementById("reservaEditarClienteNombre").value = reserva.cliente?.nombre || "";

  const canchaSelect = document.getElementById("reservaEditarCancha");
  if (canchaSelect) {
    canchaSelect.innerHTML = canchasCache.length
      ? canchasCache
          .map(
            (cancha) => `
              <option value="${cancha.idCancha}" ${cancha.idCancha === reserva.cancha?.idCancha ? "selected" : ""}>
                ${escapeHtml(cancha.nombreCancha)}
              </option>
            `
          )
          .join("")
      : `<option value="">No hay canchas disponibles</option>`;
  }

  form.classList.remove("d-none");
  document.getElementById("reservaEditarFecha")?.focus();
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
