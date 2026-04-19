const CANCHAS_BASE = [
  { id_cancha: 1, nombre: "Cancha Principal" },
  { id_cancha: 2, nombre: "Cancha Norte" },
  { id_cancha: 3, nombre: "Cancha Sunset" },
];

document.addEventListener("DOMContentLoaded", async () => {
  await cargarClientesEnSelect();
  cargarCanchasEnSelect();
  await listarReservas();
  bindReservaForm();
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
      const nombre = `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || `Cliente ${cliente.id}`;
      select.innerHTML += `<option value="${cliente.id}">${escapeHtml(nombre)}</option>`;
    });
  } catch (error) {
    select.innerHTML += `<option value="">Sin conexion al backend</option>`;
    setFeedback(error.message || "No se pudieron cargar los clientes.", "error");
  }
}

function cargarCanchasEnSelect() {
  const select = document.getElementById("selectCancha");
  if (!select) {
    return;
  }

  select.innerHTML = `<option value="">Seleccione una cancha</option>`;
  CANCHAS_BASE.forEach((cancha) => {
    select.innerHTML += `<option value="${cancha.id_cancha}">${escapeHtml(cancha.nombre)}</option>`;
  });
}

async function listarReservas() {
  const tbody = document.getElementById("tablaReservas");
  if (!tbody) {
    return;
  }

  tbody.innerHTML = `
    <tr class="empty-row">
      <td colspan="5">Cargando reservas...</td>
    </tr>
  `;

  try {
    const reservas = await window.VoleyApi.fetchJson("/reservas");
    if (!reservas.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="5">No hay reservas registradas.</td>
        </tr>
      `;
      setFeedback("No hay reservas registradas todavia.", "success");
      return;
    }

    tbody.innerHTML = reservas
      .slice(0, 12)
      .map((reserva) => {
        const inicio = (reserva.hora_inicio || "").slice(0, 5);
        const fin = (reserva.hora_fin || "").slice(0, 5);
        const cliente = `${reserva?.cliente?.nombre || ""} ${reserva?.cliente?.apellido || ""}`.trim() || "Sin cliente";
        const cancha = reserva?.cancha?.nombre || "Sin cancha";
        const estado = reserva.estado || "Pendiente";
        const badgeClass = estado.toLowerCase().includes("confirm") ? "status-confirmada" : "status-pendiente";

        return `
          <tr>
            <td>${escapeHtml(formatearFecha(reserva.fecha))}</td>
            <td>${escapeHtml(`${inicio} - ${fin}`)}</td>
            <td>${escapeHtml(cliente)}</td>
            <td>${escapeHtml(cancha)}</td>
            <td><span class="status-badge ${badgeClass}">${escapeHtml(estado)}</span></td>
          </tr>
        `;
      })
      .join("");

    setFeedback("Reservas cargadas correctamente desde el backend.", "success");
  } catch (error) {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="5">No se pudo conectar con el backend.</td>
      </tr>
    `;
    setFeedback(error.message || "No se pudo conectar con el backend.", "error");
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
    const estado = document.getElementById("estadoReserva").value || "Confirmada";
    const horaInicio = document.getElementById("horaInicio").value;
    const horaFin = document.getElementById("horaFin").value;

    if (!clienteId || !canchaId || !fecha || !horaInicio || !horaFin) {
      setFeedback("Completa todos los campos antes de guardar la reserva.", "error");
      return;
    }

    const payload = {
      fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      estado,
      cliente: { id: clienteId },
      cancha: { id_cancha: canchaId },
    };

    try {
      await window.VoleyApi.fetchJson("/reservas", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      form.reset();
      document.getElementById("estadoReserva").value = "Confirmada";
      await listarReservas();
      setFeedback("Reserva creada correctamente.", "success");
    } catch (error) {
      setFeedback(error.message || "No se pudo crear la reserva.", "error");
    }
  });
}

function setFeedback(message, type) {
  const feedback = document.getElementById("reservaFeedback");
  if (!feedback) {
    return;
  }

  feedback.textContent = message;
  feedback.classList.remove("is-error", "is-success");

  if (type === "error") {
    feedback.classList.add("is-error");
    return;
  }

  if (type === "success") {
    feedback.classList.add("is-success");
  }
}

function formatearFecha(fecha) {
  if (!fecha) {
    return "-";
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
    return fecha;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const [anio, mes, dia] = fecha.split("-");
    return `${dia}/${mes}/${anio}`;
  }

  return fecha;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
