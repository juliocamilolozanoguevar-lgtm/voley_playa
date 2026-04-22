document.addEventListener("DOMContentLoaded", async () => {
    if (!requireLogin()) {
        return;
    }

    document.getElementById("nombreAdmin").textContent = obtenerNombreAdmin();
    await listarReservas();
});

async function listarReservas() {
    mostrarMensaje("mensajeReserva", "");

    try {
        const reservas = await apiFetch("/reservas");
        const tabla = document.getElementById("tablaReservas");

        if (!reservas.length) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted py-4">No hay reservas registradas.</td>
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
                    <td>${escapeHtml(reserva.estadoReserva || reserva.estado || "RESERVADA")}</td>
                    <td>${pago}</td>
                    <td>
                        <button type="button" class="btn btn-outline-danger btn-sm" onclick="eliminarReserva(${reserva.idReserva})">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    } catch (error) {
        mostrarMensaje("mensajeReserva", error.message || "No se pudieron cargar las reservas");
    }
}

async function eliminarReserva(idReserva) {
    const confirmar = window.confirm("Desea eliminar esta reserva?");
    if (!confirmar) {
        return;
    }

    try {
        await apiFetch(`/reservas/${idReserva}`, { method: "DELETE" });
        mostrarMensaje("mensajeReserva", "Reserva eliminada", "success");
        await listarReservas();
    } catch (error) {
        mostrarMensaje("mensajeReserva", error.message || "No se pudo eliminar la reserva");
    }
}
