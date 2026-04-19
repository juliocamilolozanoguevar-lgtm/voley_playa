const PRECIO_REFERENCIAL = 50;

document.addEventListener("DOMContentLoaded", async () => {
  await cargarDashboard();
});

async function cargarDashboard() {
  const tbody = document.getElementById("tbodyReservas");
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
    const hoy = obtenerFechaActual();
    const reservasHoy = reservas.filter((reserva) => normalizarFecha(reserva.fecha) === hoy);
    const reservasMes = reservas.filter((reserva) => normalizarFecha(reserva.fecha).slice(0, 7) === hoy.slice(0, 7));
    const horasOcupadas = reservasHoy.reduce(
      (total, reserva) => total + calcularDuracion(reserva.hora_inicio, reserva.hora_fin),
      0
    );
    const canchasActivas = new Set(
      reservas.map((reserva) => reserva?.cancha?.id_cancha || reserva?.cancha?.nombre).filter(Boolean)
    ).size;

    actualizarTexto("ingresosMes", `S/. ${reservasMes.length * PRECIO_REFERENCIAL}`);
    actualizarTexto("reservasHoy", `${reservasHoy.length}`);
    actualizarTexto("horasOcupadas", `${horasOcupadas} H`);
    actualizarTexto("canchasActivas", `${canchasActivas}`);

    const visibles = reservasHoy.length ? reservasHoy : reservas.slice(0, 8);
    if (!visibles.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="4">No hay reservas registradas.</td>
        </tr>
      `;
      setEstadoDashboard("No se encontraron reservas en el backend.", "success");
      return;
    }

    tbody.innerHTML = visibles
      .map((reserva) => {
        const cliente = `${reserva?.cliente?.nombre || ""} ${reserva?.cliente?.apellido || ""}`.trim() || "Sin cliente";
        const cancha = reserva?.cancha?.nombre || "Sin cancha";
        const fecha = formatearFecha(reserva.fecha);
        const estado = reserva.estado || "Pendiente";
        const badgeClass = estado.toLowerCase().includes("confirm") ? "status-confirmada" : "status-pendiente";

        return `
          <tr>
            <td>${escapeHtml(cliente)}</td>
            <td>${escapeHtml(cancha)}</td>
            <td>${escapeHtml(fecha)}</td>
            <td><span class="status-badge ${badgeClass}">${escapeHtml(estado)}</span></td>
          </tr>
        `;
      })
      .join("");

    setEstadoDashboard("Datos sincronizados correctamente con el backend.", "success");
  } catch (error) {
    actualizarTexto("ingresosMes", "S/. 0");
    actualizarTexto("reservasHoy", "0");
    actualizarTexto("horasOcupadas", "0 H");
    actualizarTexto("canchasActivas", "0");

    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="4">No se pudo conectar con el backend.</td>
      </tr>
    `;

    setEstadoDashboard(error.message || "No se pudo conectar con el backend.", "error");
  }
}

function actualizarTexto(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.textContent = valor;
  }
}

function setEstadoDashboard(message, type) {
  const status = document.getElementById("dashboardStatus");
  if (!status) {
    return;
  }

  status.textContent = message;
  status.classList.remove("is-error", "is-success");

  if (type === "error") {
    status.classList.add("is-error");
    return;
  }

  if (type === "success") {
    status.classList.add("is-success");
  }
}

function obtenerFechaActual() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function normalizarFecha(fecha) {
  if (!fecha) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return fecha;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
    const [dia, mes, anio] = fecha.split("/");
    return `${anio}-${mes}-${dia}`;
  }

  return fecha;
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

function calcularDuracion(inicio, fin) {
  if (!inicio || !fin) {
    return 0;
  }

  const [horaInicio, minutoInicio] = inicio.slice(0, 5).split(":").map(Number);
  const [horaFin, minutoFin] = fin.slice(0, 5).split(":").map(Number);
  const minutosInicio = horaInicio * 60 + minutoInicio;
  const minutosFin = horaFin * 60 + minutoFin;

  if (Number.isNaN(minutosInicio) || Number.isNaN(minutosFin) || minutosFin <= minutosInicio) {
    return 0;
  }

  return Math.round((minutosFin - minutosInicio) / 60);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
