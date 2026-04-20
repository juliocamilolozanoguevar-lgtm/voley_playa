let reservasCache = [];

document.addEventListener("DOMContentLoaded", async () => {
  bindClienteForm();
  bindCancelarEdicion();
  await Promise.all([cargarEstadosReservas(), cargarCanchas()]);
  await cargarClientes();
});

async function cargarClientes() {
  const tbody = document.getElementById("clientesTableBody");
  if (!tbody) {
    return;
  }

  tbody.innerHTML = `
    <tr class="empty-row">
      <td colspan="5">Cargando clientes...</td>
    </tr>
  `;

  try {
    const clientes = await window.VoleyApi.fetchJson("/clientes");
    limpiarAlerta("clientesAlert");
    limpiarAlerta("reservaAlert");
    actualizarResumen(clientes);

    if (!clientes.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="5">No hay clientes registrados.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = clientes
      .map((cliente) => {
        const nombreCompleto =
          `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || "Sin nombre";
        const id = cliente.idCliente;
        const estadoCliente = obtenerEstadoReservaCliente(id);
        const badgeClass =
          estadoCliente === "PAGADO"
            ? "badge bg-success"
            : estadoCliente === "PENDIENTE"
            ? "badge bg-warning text-dark"
            : estadoCliente === "CANCELADO"
            ? "badge bg-danger"
            : "badge bg-secondary";

        return `
          <tr data-cliente-id="${id}">
            <td>${escapeHtml(cliente.idCliente ?? "-")}</td>
            <td>${escapeHtml(cliente.dni || "-")}</td>
            <td>${escapeHtml(nombreCompleto)}</td>
            <td><span class="${badgeClass}">${escapeHtml(estadoCliente)}</span></td>
            <td>
              <div class="d-flex flex-wrap gap-2">
                <button type="button" class="btn btn-sm btn-outline-primary cliente-edit-btn" data-id="${id}"
                  data-dni="${escapeHtml(cliente.dni || "")}"
                  data-nombre="${escapeHtml(cliente.nombre || "")}"
                  data-apellido="${escapeHtml(cliente.apellido || "")}">
                  Editar
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger cliente-delete-btn" data-id="${id}">
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    tbody.querySelectorAll(".cliente-edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.getElementById("clienteIdEdit").value = btn.dataset.id || "";
        document.getElementById("clienteDni").value = btn.dataset.dni || "";
        document.getElementById("clienteNombre").value = btn.dataset.nombre || "";
        document.getElementById("clienteApellido").value = btn.dataset.apellido || "";
        setModoEdicionCliente(true);
        document.getElementById("clienteForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    tbody.querySelectorAll(".cliente-delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!id || !confirm("¿Eliminar este cliente?")) {
          return;
        }
        try {
          await window.VoleyApi.fetchJson(`/clientes/${id}`, { method: "DELETE" });
          if (document.getElementById("clienteIdEdit")?.value === id) {
            resetFormCliente();
          }
          await cargarClientes();
          mostrarAlerta("clientesAlert", "Cliente eliminado.", "success");
        } catch (error) {
          mostrarAlerta(
            "clientesAlert",
            error.message || "No se pudo eliminar el cliente.",
            "danger"
          );
        }
      });
    });
  } catch (error) {
    actualizarResumen([]);
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="5">No se pudo cargar la lista de clientes.</td>
      </tr>
    `;
    mostrarAlerta("clientesAlert", error.message || "No se pudo conectar con el backend.", "danger");
  }
}

async function cargarEstadosReservas() {
  try {
    reservasCache = await window.VoleyApi.fetchJson("/reservas");
    actualizarResumenReservas(reservasCache);
  } catch (error) {
    reservasCache = [];
    actualizarResumenReservas([]);
    mostrarAlerta("clientesAlert", error.message || "No se pudo cargar los estados de reserva.", "danger");
  }
  mostrarHorariosDisponibles();
}

function actualizarResumenReservas(reservas) {
  const estados = reservas.map((reserva) => {
    if (reserva.estado) {
      return String(reserva.estado).toUpperCase();
    }
    return reserva.pago ? "PAGADO" : "PENDIENTE";
  });

  const pagadas = estados.filter((estado) => estado === "PAGADO").length;
  const pendientes = estados.filter((estado) => estado === "PENDIENTE").length;
  const canceladas = estados.filter((estado) => estado === "CANCELADO").length;

  actualizarTexto("reservasPagadas", `${pagadas}`);
  actualizarTexto("reservasPendientes", `${pendientes}`);
  actualizarTexto("reservasCanceladas", `${canceladas}`);
}

function obtenerEstadoReservaCliente(clienteId) {
  if (!reservasCache.length || !clienteId) {
    return "Sin reserva";
  }

  const reservasCliente = reservasCache.filter(
    (reserva) => `${reserva.cliente?.idCliente || ""}` === `${clienteId}`
  );
  if (!reservasCliente.length) {
    return "Sin reserva";
  }

  const reservaReciente = reservasCliente.reduce((prev, current) => {
    const fechaPrev = new Date(`${prev.fecha}T${prev.horaInicio || "00:00"}`);
    const fechaCurr = new Date(`${current.fecha}T${current.horaInicio || "00:00"}`);
    return fechaCurr > fechaPrev ? current : prev;
  });

  return reservaReciente.estado
    ? String(reservaReciente.estado).toUpperCase()
    : reservaReciente.pago
    ? "PAGADO"
    : "PENDIENTE";
}

async function cargarCanchas() {
  const canchaSelect = document.getElementById("reservaCancha");
  if (!canchaSelect) {
    return;
  }

  canchaSelect.innerHTML = `
    <option value="">Cargando canchas...</option>
  `;

  try {
    const canchas = await window.VoleyApi.fetchJson("/canchas");
    if (!canchas.length) {
      canchaSelect.innerHTML = `<option value="">No hay canchas registradas</option>`;
      return;
    }

    canchaSelect.innerHTML = `
      <option value="">Selecciona una cancha</option>
      ${canchas
        .map((cancha) => `<option value="${cancha.idCancha}">${escapeHtml(cancha.nombreCancha)}</option>`)
        .join("")}
    `;

    bindHorarioDisponibleListeners();
  } catch (error) {
    canchaSelect.innerHTML = `<option value="">No se pudo cargar canchas</option>`;
    mostrarAlerta("reservaAlert", error.message || "No se pudo conectar con el backend.", "danger");
  }
}

function bindHorarioDisponibleListeners() {
  const canchaSelect = document.getElementById("reservaCancha");
  const fechaInput = document.getElementById("reservaFecha");

  const actualizar = () => mostrarHorariosDisponibles();
  if (canchaSelect) {
    canchaSelect.addEventListener("change", actualizar);
  }
  if (fechaInput) {
    fechaInput.addEventListener("change", actualizar);
  }
}

function mostrarHorariosDisponibles() {
  const canchaId = Number(document.getElementById("reservaCancha")?.value);
  const fecha = document.getElementById("reservaFecha")?.value;
  const lista = document.getElementById("horariosDisponibles");
  if (!lista) {
    return;
  }

  if (!canchaId || !fecha) {
    lista.innerHTML = `<span class="text-secondary">Selecciona cancha y fecha para ver horarios.</span>`;
    return;
  }

  const reservasMismaCancha = reservasCache.filter(
    (reserva) =>
      Number(reserva.cancha?.idCancha) === canchaId && reserva.fecha === fecha
  );

  const intervalosOcupados = reservasMismaCancha.map((reserva) => ({
    inicio: reserva.horaInicio,
    fin: reserva.horaFin,
  }));

  const horas = [];
  for (let hora = 8; hora <= 21; hora += 1) {
    const inicio = hora.toString().padStart(2, "0") + ":00";
    const fin = (hora + 1).toString().padStart(2, "0") + ":00";
    const hayConflicto = intervalosOcupados.some((intervalo) => {
      return (
        inicio < intervalo.fin && fin > intervalo.inicio
      );
    });

    if (!hayConflicto) {
      horas.push({ inicio, fin });
    }
  }

  if (!horas.length) {
    lista.innerHTML = `<span class="text-danger">No hay horarios disponibles para esta cancha y fecha.</span>`;
    return;
  }

  lista.innerHTML = horas
    .map(
      ({ inicio, fin }) => `
        <button type="button" class="btn btn-sm btn-outline-primary horario-disponible-btn" data-inicio="${inicio}" data-fin="${fin}">
          ${inicio} - ${fin}
        </button>
      `
    )
    .join("");

  lista.querySelectorAll(".horario-disponible-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const inicio = btn.dataset.inicio;
      const fin = btn.dataset.fin;
      document.getElementById("reservaHoraInicio").value = inicio;
      document.getElementById("reservaHoraFin").value = fin;
      document.querySelectorAll(".horario-disponible-btn").forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

function bindClienteForm() {
  const form = document.getElementById("clienteForm");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const idEdit = document.getElementById("clienteIdEdit")?.value?.trim() || "";
    const dni = document.getElementById("clienteDni")?.value.trim() || "";
    const nombre = document.getElementById("clienteNombre")?.value.trim() || "";
    const apellido = document.getElementById("clienteApellido")?.value.trim() || "";
    const canchaId = Number(document.getElementById("reservaCancha")?.value);
    const fecha = document.getElementById("reservaFecha")?.value;
    const horaInicio = document.getElementById("reservaHoraInicio")?.value;
    const horaFin = document.getElementById("reservaHoraFin")?.value;
    const monto = Number(document.getElementById("reservaMonto")?.value || 0);
    const estado = document.getElementById("reservaEstado")?.value || "PENDIENTE";

    if (!/^[0-9]{8}$/.test(dni)) {
      mostrarAlerta("clientesAlert", "El DNI debe tener 8 dígitos.", "danger");
      return;
    }

    if (!nombre || !apellido) {
      mostrarAlerta("clientesAlert", "Completa todos los datos del cliente.", "danger");
      return;
    }

    if (!canchaId || !fecha || !horaInicio || !horaFin) {
      mostrarAlerta("clientesAlert", "Completa todos los datos de reserva.", "danger");
      return;
    }

    const clientePayload = { dni, nombre, apellido };

    try {
      if (idEdit) {
        await window.VoleyApi.fetchJson(`/clientes/${idEdit}`, {
          method: "PUT",
          body: JSON.stringify(clientePayload),
        });

        resetFormCliente();
        await cargarClientes();
        mostrarAlerta("clientesAlert", "Cliente actualizado correctamente.", "success");
        return;
      }

      await window.VoleyApi.fetchJson("/clientes", {
        method: "POST",
        body: JSON.stringify(clientePayload),
      });

      await window.VoleyApi.fetchJson("/reservas", {
        method: "POST",
        body: JSON.stringify({
          fecha: fecha,
          horaInicio: horaInicio + ":00",
          horaFin: horaFin + ":00",
          clienteDni: dni,
          clienteNombre: nombre,
          clienteApellido: apellido,
          canchaId: canchaId,
          monto: monto,
          estado: estado,
        }),
      });

      resetFormCliente();
      await cargarEstadosReservas();
      await cargarClientes();
      mostrarAlerta("reservaAlert", "Cliente y reserva guardados correctamente.", "success");
    } catch (error) {
      mostrarAlerta(
        "clientesAlert",
        error.message || "No se pudo guardar el cliente o la reserva.",
        "danger"
      );
    }
  });
}

function bindCancelarEdicion() {
  const btn = document.getElementById("clienteCancelarEdicion");
  if (!btn) {
    return;
  }
  btn.addEventListener("click", () => {
    resetFormCliente();
    limpiarAlerta("clientesAlert");
  });
}

function setModoEdicionCliente(editando) {
  const titulo = document.getElementById("clienteFormTitulo");
  const submit = document.getElementById("clienteSubmitBtn");
  const cancel = document.getElementById("clienteCancelarEdicion");
  if (titulo) {
    titulo.textContent = editando ? "Editar cliente" : "Nuevo cliente";
  }
  if (submit) {
    submit.textContent = editando ? "Guardar cambios" : "Registrar cliente";
  }
  if (cancel) {
    cancel.classList.toggle("d-none", !editando);
  }
}

function resetFormCliente() {
  const form = document.getElementById("clienteForm");
  if (form) {
    form.reset();
  }
  const hid = document.getElementById("clienteIdEdit");
  if (hid) {
    hid.value = "";
  }
  setModoEdicionCliente(false);
}

function actualizarResumen(clientes) {
  const total = clientes.length;
  const ultimo = clientes[clientes.length - 1];
  const nombreUltimo = ultimo
    ? `${ultimo.nombre || ""} ${ultimo.apellido || ""}`.trim() || "Sin datos"
    : "Sin datos";

  actualizarTexto("clientesRegistrados", `${total}`);
  actualizarTexto("clienteReciente", nombreUltimo);
  actualizarTexto("dniReciente", ultimo?.dni || "Sin datos");
}

function actualizarTexto(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.textContent = valor;
  }
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
