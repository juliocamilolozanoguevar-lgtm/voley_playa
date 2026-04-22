let clientesCache = [];
let canchasCache = [];

document.addEventListener("DOMContentLoaded", async () => {
    if (!requireLogin()) {
        return;
    }

    document.getElementById("nombreAdmin").textContent = obtenerNombreAdmin();
    document.getElementById("formReserva").addEventListener("submit", guardarReserva);
    document.getElementById("canchaId").addEventListener("change", consultarDisponibilidadReserva);
    document.getElementById("fecha").addEventListener("change", consultarDisponibilidadReserva);
    document.getElementById("horaInicio").addEventListener("change", consultarDisponibilidadReserva);
    document.getElementById("horaFin").addEventListener("change", consultarDisponibilidadReserva);
    document.getElementById("fecha").value = obtenerFechaLocal();
    document.getElementById("horariosDisponiblesReserva").innerHTML = '<span class="text-muted">Seleccione una cancha y una fecha.</span>';

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
        await consultarDisponibilidadReserva();
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
            horaFin,
            estadoReserva: "RESERVADA",
            estado: "ACTIVA"
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
        document.getElementById("fecha").value = obtenerFechaLocal();
        mostrarMensaje("mensajeReserva", "Reserva guardada correctamente", "success");
        await consultarDisponibilidadReserva();
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
        await consultarDisponibilidadReserva();
        await listarReservas();
    } catch (error) {
        mostrarMensaje("mensajeReserva", error.message || "No se pudo eliminar la reserva");
    }
}

async function consultarDisponibilidadReserva() {
    const canchaId = document.getElementById("canchaId").value;
    const fecha = document.getElementById("fecha").value;
    const horaInicio = document.getElementById("horaInicio").value;
    const horaFin = document.getElementById("horaFin").value;
    const contenedor = document.getElementById("horariosDisponiblesReserva");
    const estado = document.getElementById("estadoDisponibilidadReserva");

    if (!canchaId || !fecha) {
        contenedor.innerHTML = '<span class="text-muted">Seleccione una cancha y una fecha.</span>';
        estado.textContent = "";
        return;
    }

    try {
        const params = new URLSearchParams({ canchaId, fecha });
        if (horaInicio) {
            params.append("horaInicio", horaInicio);
        }
        if (horaFin) {
            params.append("horaFin", horaFin);
        }

        const data = await apiFetch(`/reservas/disponibilidad?${params.toString()}`);
        const libres = data.horariosLibres || [];

        if (!libres.length) {
            contenedor.innerHTML = '<span class="badge text-bg-secondary">Sin horarios libres</span>';
        } else {
            contenedor.innerHTML = libres
                .map((hora) => `<button type="button" class="slot-badge" data-slot-reserva="${hora}">${escapeHtml(hora)}</button>`)
                .join("");

            contenedor.querySelectorAll("[data-slot-reserva]").forEach((button) => {
                button.addEventListener("click", async () => {
                    const inicio = button.dataset.slotReserva;
                    document.getElementById("horaInicio").value = inicio;
                    document.getElementById("horaFin").value = sumarTreintaMinutos(inicio);
                    await consultarDisponibilidadReserva();
                });
            });
        }

        if (horaInicio && horaFin) {
            estado.textContent = data.disponible
                ? "El horario seleccionado esta disponible."
                : "El horario seleccionado ya esta ocupado.";
            estado.className = data.disponible ? "text-success fw-semibold" : "text-danger fw-semibold";
        } else {
            estado.textContent = `Se muestran ${libres.length} horarios libres.`;
            estado.className = "helper-text";
        }
    } catch (error) {
        contenedor.innerHTML = '<span class="text-danger">No se pudo consultar disponibilidad.</span>';
        estado.textContent = "";
    }
}

function obtenerFechaLocal() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function sumarTreintaMinutos(hora) {
    const [hours, minutes] = hora.split(":").map(Number);
    const totalMinutes = (hours * 60) + minutes + 30;
    const newHours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const newMinutes = String(totalMinutes % 60).padStart(2, "0");
    return `${newHours}:${newMinutes}`;
}
