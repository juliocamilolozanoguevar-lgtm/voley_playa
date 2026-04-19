document.addEventListener("DOMContentLoaded", async () => {
  await cargarClientes();
});

async function cargarClientes() {
  const tbody = document.getElementById("clientesTableBody");
  if (!tbody) {
    return;
  }

  tbody.innerHTML = `
    <tr class="empty-row">
      <td colspan="4">Cargando clientes...</td>
    </tr>
  `;

  try {
    const clientes = await window.VoleyApi.fetchJson("/clientes");
    limpiarAlerta("clientesAlert");
    actualizarResumen(clientes);

    if (!clientes.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="4">No hay clientes registrados.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = clientes
      .map((cliente) => {
        const nombreCompleto = `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || "Sin nombre";
        return `
          <tr>
            <td>${escapeHtml(cliente.idCliente ?? "-")}</td>
            <td>${escapeHtml(cliente.dni || "-")}</td>
            <td>${escapeHtml(nombreCompleto)}</td>
            <td><span class="status-badge status-confirmada">Activo</span></td>
          </tr>
        `;
      })
      .join("");
  } catch (error) {
    actualizarResumen([]);
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="4">No se pudo cargar la lista de clientes.</td>
      </tr>
    `;
    mostrarAlerta("clientesAlert", error.message || "No se pudo conectar con el backend.", "danger");
  }
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
