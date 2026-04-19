document.addEventListener("DOMContentLoaded", async () => {
  bindClienteForm();
  bindCancelarEdicion();
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
        return `
          <tr data-cliente-id="${id}">
            <td>${escapeHtml(cliente.idCliente ?? "-")}</td>
            <td>${escapeHtml(cliente.dni || "-")}</td>
            <td>${escapeHtml(nombreCompleto)}</td>
            <td><span class="status-badge status-confirmada">Activo</span></td>
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

    if (!/^\d{8}$/.test(dni)) {
      mostrarAlerta("clientesAlert", "El DNI debe tener 8 digitos.", "danger");
      return;
    }

    if (!nombre || !apellido) {
      mostrarAlerta("clientesAlert", "Completa todos los datos del cliente.", "danger");
      return;
    }

    const cuerpo = JSON.stringify({ dni, nombre, apellido });

    try {
      if (idEdit) {
        await window.VoleyApi.fetchJson(`/clientes/${idEdit}`, {
          method: "PUT",
          body: cuerpo,
        });
      } else {
        await window.VoleyApi.fetchJson("/clientes", {
          method: "POST",
          body: cuerpo,
        });
      }

      resetFormCliente();
      await cargarClientes();
      mostrarAlerta(
        "clientesAlert",
        idEdit ? "Cliente actualizado correctamente." : "Cliente registrado correctamente.",
        "success"
      );
    } catch (error) {
      mostrarAlerta(
        "clientesAlert",
        error.message || "No se pudo guardar el cliente.",
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
