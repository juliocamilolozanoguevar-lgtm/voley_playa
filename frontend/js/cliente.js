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
      <td colspan="3">Cargando clientes...</td>
    </tr>
  `;

  try {
    const clientes = await window.VoleyApi.fetchJson("/clientes");
    actualizarResumen(clientes);

    if (!clientes.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="3">No hay clientes registrados.</td>
        </tr>
      `;
      setEstadoClientes("El backend no devolvio clientes todavia.", "success");
      return;
    }

    tbody.innerHTML = clientes
      .slice(0, 10)
      .map((cliente) => {
        const nombre = `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || `Cliente ${cliente.id ?? ""}`;
        return `
          <tr>
            <td>${escapeHtml(cliente.id ?? "-")}</td>
            <td>${escapeHtml(nombre)}</td>
            <td><span class="status-badge status-confirmada">Activo</span></td>
          </tr>
        `;
      })
      .join("");

    setEstadoClientes("Clientes sincronizados correctamente con el backend.", "success");
  } catch (error) {
    actualizarResumen([]);
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="3">No se pudo conectar con el backend.</td>
      </tr>
    `;
    setEstadoClientes(error.message || "No se pudo conectar con el backend.", "error");
  }
}

function actualizarResumen(clientes) {
  const total = clientes.length;
  const ultimo = clientes[clientes.length - 1];
  const nombreUltimo = ultimo
    ? `${ultimo.nombre || ""} ${ultimo.apellido || ""}`.trim() || `Cliente ${ultimo.id ?? ""}`
    : "Sin datos";

  setText("clientesTotal", `${total}`);
  setText("clientesRegistrados", `${total}`);
  setText("clientesActivos", `${total}`);
  setText("clienteReciente", nombreUltimo);
}

function setEstadoClientes(message, type) {
  const status = document.getElementById("clientesStatus");
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

function setText(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.textContent = valor;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
