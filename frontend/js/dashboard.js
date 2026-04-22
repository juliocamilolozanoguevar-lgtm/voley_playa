document.addEventListener("DOMContentLoaded", async () => {
    if (!requireLogin()) {
        return;
    }

    document.getElementById("nombreAdmin").textContent = obtenerNombreAdmin();
    await cargarDashboard();
});

async function cargarDashboard() {
    mostrarMensaje("mensajeDashboard", "");

    try {
        const [clientes, reservas, canchas, pagos] = await Promise.all([
            apiFetch("/clientes"),
            apiFetch("/reservas"),
            apiFetch("/canchas"),
            apiFetch("/pagos")
        ]);

        document.getElementById("totalClientes").textContent = clientes.length;
        document.getElementById("totalReservas").textContent = reservas.length;
        document.getElementById("totalCanchas").textContent = canchas.length;
        document.getElementById("totalPagos").textContent = pagos.length;

        renderTablaClientes(clientes);
        renderTablaReservas(reservas);
    } catch (error) {
        mostrarMensaje("mensajeDashboard", error.message || "No se pudo cargar el dashboard");
    }
}

function renderTablaClientes(clientes) {
    const tabla = document.getElementById("tablaClientesDashboard");

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
}

function renderTablaReservas(reservas) {
    const tabla = document.getElementById("tablaReporte");

    if (!reservas.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">No hay reservas registradas.</td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = reservas.map((reserva) => {
        const cliente = reserva.cliente
            ? `${escapeHtml(reserva.cliente.nombre)} ${escapeHtml(reserva.cliente.apellido)}`
            : "Sin cliente";
        const cancha = reserva.cancha ? escapeHtml(reserva.cancha.nombreCancha) : "Sin cancha";
        const horario = `${escapeHtml(reserva.horaInicio || "")} - ${escapeHtml(reserva.horaFin || "")}`;
        const pago = reserva.pago?.monto
            ? `S/ ${escapeHtml(reserva.pago.monto)}`
            : (reserva.adelanto ? `S/ ${escapeHtml(reserva.adelanto)}` : "Sin pago");

        return `
            <tr>
                <td>${reserva.idReserva}</td>
                <td>${cliente}</td>
                <td>${cancha}</td>
                <td>${escapeHtml(reserva.fecha || "")}</td>
                <td>${horario}</td>
                <td>${pago}</td>
            </tr>
        `;
    }).join("");
}
