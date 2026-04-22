document.addEventListener("DOMContentLoaded", async () => {
    if (!requireLogin()) {
        return;
    }

    document.getElementById("nombreAdmin").textContent = obtenerNombreAdmin();
    document.getElementById("formCliente").addEventListener("submit", guardarCliente);
    await listarClientes();
});

async function listarClientes() {
    try {
        const clientes = await apiFetch("/clientes");
        const tabla = document.getElementById("tablaClientes");

        if (!clientes.length) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">No hay clientes registrados.</td>
                </tr>
            `;
            return;
        }

        tabla.innerHTML = clientes.map((cliente) => `
            <tr>
                <td>${cliente.idCliente}</td>
                <td>${escapeHtml(cliente.dni)}</td>
                <td>${escapeHtml(cliente.nombre)}</td>
                <td>${escapeHtml(cliente.apellido)}</td>
            </tr>
        `).join("");
    } catch (error) {
        mostrarMensaje("mensajeCliente", error.message || "No se pudieron cargar los clientes");
    }
}

async function guardarCliente(event) {
    event.preventDefault();
    mostrarMensaje("mensajeCliente", "");

    const dni = document.getElementById("dni").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();

    if (!dni || !nombre || !apellido) {
        mostrarMensaje("mensajeCliente", "Complete todos los campos del cliente");
        return;
    }

    if (!/^\d{8}$/.test(dni)) {
        mostrarMensaje("mensajeCliente", "El DNI debe tener 8 digitos");
        return;
    }

    try {
        await apiFetch("/clientes", {
            method: "POST",
            body: JSON.stringify({ dni, nombre, apellido })
        });

        document.getElementById("formCliente").reset();
        mostrarMensaje("mensajeCliente", "Cliente guardado correctamente", "success");
        await listarClientes();
    } catch (error) {
        mostrarMensaje("mensajeCliente", error.message || "No se pudo guardar el cliente");
    }
}
