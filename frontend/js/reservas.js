document.addEventListener("DOMContentLoaded", async () => {
  await cargarClientesEnSelect();
  await cargarCanchasEnSelect();
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
      <td colspan="5">Cargando reservas...</td>
    </tr>
  `;

  try {
    const reservas = await window.VoleyApi.fetchJson("/reservas");
    limpiarAlerta("reservaAlert");

    if (!reservas.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="5">No hay reservas registradas.</td>
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
        const estado = resolverEstadoReserva(reserva.fecha);
        const badgeClass = estado === "Finalizada" ? "status-finalizada" : estado === "Hoy" ? "status-confirmada" : "status-pendiente";

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
  } catch (error) {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="5">No se pudo cargar la lista de reservas.</td>
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

    if (!clienteId || !canchaId || !fecha || !horaInicio || !horaFin) {
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

function resolverEstadoReserva(fecha) {
  if (!fecha) {
    return "Programada";
  }

  const hoy = obtenerFechaActual();
  if (fecha < hoy) {
    return "Finalizada";
  }
  if (fecha === hoy) {
    return "Hoy";
  }
  return "Programada";
}

function obtenerFechaActual() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
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
