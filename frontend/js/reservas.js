let clientesCache = [];
let canchasCache = [];

document.addEventListener("DOMContentLoaded", async () => {
    if (!requireLogin()) {
        return;
    }

    document.getElementById("nombreAdmin").textContent = obtenerNombreAdmin();
    document.getElementById("formReserva").addEventListener("submit", guardarReserva);
    document.getElementById("fecha").value = new Date().toISOString().split("T")[0];

    await cargarCatalogos();
    await listarReservas();
});

async function cargarCatalogos() {
    try {
        const [clientes, canchas] = await Promise.all([
            apiFetch("/clientes"),
            apiFetch("/canchas")
        ]);

        clientesCache = clientes;
        canchasCache = canchas;

        llenarSelectClientes();
        llenarSelectCanchas();
    } catch (error) {
        mostrarMensaje("mensajeReserva", error.message || "No se pudieron cargar los catalogos");
    }
}

function llenarSelectClientes() {
    const select = document.getElementById("clienteId");
    const options = ['<option value="">Seleccione un cliente</option>']
        .concat(clientesCache.map((cliente) =>
            `<option value="${cliente.idCliente}">${escapeHtml(cliente.dni)} - ${escapeHtml(cliente.nombre)} ${escapeHtml(cliente.apellido)}</option>`
        ));

    select.innerHTML = options.join("");
}

function llenarSelectCanchas() {
    const select = document.getElementById("canchaId");
    const options = ['<option value="">Seleccione una cancha</option>']
        .concat(canchasCache.map((cancha) =>
            `<option value="${cancha.idCancha}">${escapeHtml(cancha.nombreCancha)}</option>`
        ));

    select.innerHTML = options.join("");
}

async function listarReservas() {
    try {
        const reservas = await apiFetch("/reservas");
        const tabla = document.getElementById("tablaReservas");

        if (!reservas.length) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">No hay reservas registradas.</td>
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
            const pago = reserva.pago?.monto ? `S/ ${escapeHtml(reserva.pago.monto)}` : "Sin pago";

            return `
                <tr>
                    <td>${reserva.idReserva}</td>
                    <td>${cliente}</td>
                    <td>${cancha}</td>
                    <td>${escapeHtml(reserva.fecha || "")}</td>
                    <td>${horario}</td>
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

async function guardarReserva(event) {
    event.preventDefault();
    mostrarMensaje("mensajeReserva", "");

    const clienteId = Number(document.getElementById("clienteId").value);
    const canchaId = Number(document.getElementById("canchaId").value);
    const fecha = document.getElementById("fecha").value;
    const horaInicio = document.getElementById("horaInicio").value;
    const horaFin = document.getElementById("horaFin").value;
    const montoTexto = document.getElementById("monto").value.trim();

    if (!clienteId || !canchaId || !fecha || !horaInicio || !horaFin) {
        mostrarMensaje("mensajeReserva", "Complete los campos obligatorios de la reserva");
        return;
    }

    const cliente = clientesCache.find((item) => item.idCliente === clienteId);
    if (!cliente) {
        mostrarMensaje("mensajeReserva", "Seleccione un cliente valido");
        return;
    }

    const payload = {
        clienteDni: cliente.dni,
        clienteNombre: cliente.nombre,
        clienteApellido: cliente.apellido,
        canchaId,
        fecha,
        horaInicio,
        horaFin
    };

    if (montoTexto) {
        payload.monto = Number(montoTexto);
    }

    try {
        await apiFetch("/reservas", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        document.getElementById("formReserva").reset();
        document.getElementById("fecha").value = new Date().toISOString().split("T")[0];
        mostrarMensaje("mensajeReserva", "Reserva guardada correctamente", "success");
        await listarReservas();
    } catch (error) {
        mostrarMensaje("mensajeReserva", error.message || "No se pudo guardar la reserva");
    }
}

async function eliminarReserva(idReserva) {
    const confirmar = window.confirm("Desea eliminar esta reserva?");
    if (!confirmar) {
        return;
    }

    try {
        await apiFetch(`/reservas/${idReserva}`, {
            method: "DELETE"
        });

        mostrarMensaje("mensajeReserva", "Reserva eliminada", "success");
        await listarReservas();
    } catch (error) {
        mostrarMensaje("mensajeReserva", error.message || "No se pudo eliminar la reserva");
    }
}
