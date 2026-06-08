<?php
declare(strict_types=1);

header('Content-Type: application/javascript; charset=UTF-8');
?>
let reservasCache = [];
let canchasReservaCache = [];
let reservaModal = null;

document.addEventListener("DOMContentLoaded", async () => {
    const tabla = document.getElementById("tablaReservas");
    if (!tabla) {
        return;
    }

    reservaModal = crearModalReserva(document.getElementById("modalEditarReserva"));
    document.getElementById("buscadorReservas").addEventListener("input", manejarBusquedaReservas);
    document.getElementById("btnActualizarReservas").addEventListener("click", () => listarReservas(document.getElementById("buscadorReservas").value.trim()));
    document.getElementById("btnGuardarEdicionReserva").addEventListener("click", guardarEdicionReserva);

    ["editarCanchaId", "editarFecha", "editarHoraInicio", "editarHoraFin", "editarEstadoReserva"].forEach((id) => {
        document.getElementById(id).addEventListener("change", validarDisponibilidadEdicion);
    });

    tabla.addEventListener("click", manejarAccionesTabla);

    await Promise.all([cargarCanchasReserva(), listarReservas()]);
});

function crearModalReserva(modalElement) {
    modalElement.querySelectorAll("[data-modal-dismiss], .btn-close").forEach((button) => {
        button.addEventListener("click", () => ocultarModalReserva(modalElement));
    });

    return {
        show() {
            mostrarModalReserva(modalElement);
        },
        hide() {
            ocultarModalReserva(modalElement);
        }
    };
}

function mostrarModalReserva(modalElement) {
    modalElement.classList.add("show");
    modalElement.removeAttribute("aria-hidden");
    modalElement.setAttribute("aria-modal", "true");
    modalElement.setAttribute("role", "dialog");
    modalElement.style.display = "block";
    document.body.classList.add("modal-open");
}

function ocultarModalReserva(modalElement) {
    modalElement.classList.remove("show");
    modalElement.setAttribute("aria-hidden", "true");
    modalElement.removeAttribute("aria-modal");
    modalElement.removeAttribute("role");
    modalElement.style.display = "none";
    document.body.classList.remove("modal-open");
}

async function cargarCanchasReserva() {
    try {
        canchasReservaCache = await apiFetch("/api/canchas");
        const select = document.getElementById("editarCanchaId");
        select.innerHTML = canchasReservaCache.map((cancha) =>
            `<option value="${cancha.idCancha}">${escapeHtml(cancha.nombreCancha)}</option>`
        ).join("");
    } catch (error) {
        showMessage("mensajeReserva", error.message || "No se pudieron cargar las canchas");
    }
}

let searchTimer = null;
function manejarBusquedaReservas(event) {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
        listarReservas(event.target.value.trim());
    }, 250);
}

async function listarReservas(search = "") {
    showMessage("mensajeReserva", "");

    try {
        const query = search ? `?${new URLSearchParams({ search }).toString()}` : "";
        reservasCache = await apiFetch(`/api/reservas${query}`);
        renderTablaReservas();
    } catch (error) {
        showMessage("mensajeReserva", error.message || "No se pudieron cargar las reservas");
    }
}

function renderTablaReservas() {
    const tabla = document.getElementById("tablaReservas");

    if (!reservasCache.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">No hay reservas para mostrar.</td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = reservasCache.map((reserva) => {
        const cliente = reserva.cliente
            ? `${escapeHtml(reserva.cliente.nombre)} ${escapeHtml(reserva.cliente.apellido)}`
            : "Sin cliente";
        const cancha = reserva.cancha ? escapeHtml(reserva.cancha.nombreCancha) : "Sin cancha";
        const horario = `${escapeHtml(reserva.horaInicio || "")} - ${escapeHtml(reserva.horaFin || "")}`;
        const pago = reserva.pago?.monto
            ? formatCurrency(reserva.pago.monto)
            : (reserva.adelanto ? formatCurrency(reserva.adelanto) : "Sin pago");

        return `
            <tr>
                <td>${reserva.idReserva}</td>
                <td>${cliente}</td>
                <td>${cancha}</td>
                <td>${escapeHtml(reserva.fecha || "")}</td>
                <td>${horario}</td>
                <td>${renderEstadoReserva(reserva.estadoReserva)}</td>
                <td>${pago}</td>
                <td class="d-flex flex-wrap gap-2">
                    <button type="button" class="btn btn-outline-primary btn-sm" data-action="edit" data-id="${reserva.idReserva}">Editar</button>
                    <button type="button" class="btn btn-outline-danger btn-sm" data-action="delete" data-id="${reserva.idReserva}">Eliminar</button>
                </td>
            </tr>
        `;
    }).join("");
}

function renderEstadoReserva(estado) {
    const normalized = String(estado || "RESERVADA").toUpperCase();
    const extraClass = normalized === "CANCELADA"
        ? " is-danger"
        : (normalized === "FINALIZADA" ? " is-warning" : "");

    return `<span class="badge-soft${extraClass}">${escapeHtml(normalized)}</span>`;
}

function manejarAccionesTabla(event) {
    const button = event.target.closest("[data-action]");
    if (!button) {
        return;
    }

    const reservaId = Number(button.dataset.id);
    if (!reservaId) {
        return;
    }

    if (button.dataset.action === "edit") {
        abrirModalEdicion(reservaId);
        return;
    }

    if (button.dataset.action === "delete") {
        eliminarReserva(reservaId);
    }
}

function abrirModalEdicion(reservaId) {
    const reserva = reservasCache.find((item) => Number(item.idReserva) === Number(reservaId));
    if (!reserva) {
        showMessage("mensajeReserva", "No se encontro la reserva seleccionada");
        return;
    }

    document.getElementById("editarReservaId").value = reserva.idReserva;
    document.getElementById("editarCliente").value = reserva.cliente
        ? `${reserva.cliente.nombre} ${reserva.cliente.apellido}`
        : "Sin cliente";
    document.getElementById("editarDni").value = reserva.cliente?.dni || "";
    document.getElementById("editarCanchaId").value = reserva.cancha?.idCancha || "";
    document.getElementById("editarFecha").value = reserva.fecha || "";
    document.getElementById("editarHoraInicio").value = reserva.horaInicio || "";
    document.getElementById("editarHoraFin").value = reserva.horaFin || "";
    document.getElementById("editarMonto").value = reserva.pago?.monto ?? reserva.adelanto ?? "";
    document.getElementById("editarEstadoReserva").value = reserva.estadoReserva || "RESERVADA";
    const editarEstado = document.getElementById("editarEstado");
    if (editarEstado) {
        editarEstado.value = reserva.estado || "ACTIVA";
    }
    showMessage("mensajeModalReserva", "");
    document.getElementById("estadoEdicionHorario").textContent = "";

    reservaModal.show();
    validarDisponibilidadEdicion();
}

async function validarDisponibilidadEdicion() {
    const reservaId = document.getElementById("editarReservaId").value;
    const canchaId = document.getElementById("editarCanchaId").value;
    const fecha = document.getElementById("editarFecha").value;
    const horaInicio = document.getElementById("editarHoraInicio").value;
    const horaFin = document.getElementById("editarHoraFin").value;
    const estadoReserva = document.getElementById("editarEstadoReserva").value;
    const estado = document.getElementById("estadoEdicionHorario");

    if (!reservaId || !canchaId || !fecha || !horaInicio || !horaFin) {
        estado.textContent = "";
        return;
    }

    if (estadoReserva === "CANCELADA") {
        estado.textContent = "Al guardar como cancelada, este horario quedara libre si la reserva aun no llega a su fecha.";
        estado.className = "text-warning fw-semibold";
        return;
    }

    try {
        const params = new URLSearchParams({ canchaId, fecha, horaInicio, horaFin, ignoreId: reservaId });
        const data = await apiFetch(`/api/reservas/disponibilidad?${params.toString()}`);
        estado.textContent = data.disponible
            ? "Horario disponible para guardar cambios."
            : "Ese horario esta ocupado por otra reserva.";
        estado.className = data.disponible ? "text-success fw-semibold" : "text-danger fw-semibold";
    } catch (error) {
        estado.textContent = "No se pudo validar el horario.";
        estado.className = "text-danger fw-semibold";
    }
}

async function guardarEdicionReserva() {
    const reservaId = document.getElementById("editarReservaId").value;
    const payload = {
        canchaId: Number(document.getElementById("editarCanchaId").value),
        fecha: document.getElementById("editarFecha").value,
        horaInicio: document.getElementById("editarHoraInicio").value,
        horaFin: document.getElementById("editarHoraFin").value,
        monto: document.getElementById("editarMonto").value.trim(),
        estadoReserva: document.getElementById("editarEstadoReserva").value,
        estado: document.getElementById("editarEstado")?.value || "ACTIVA"
    };

    if (!payload.canchaId || !payload.fecha || !payload.horaInicio || !payload.horaFin) {
        showMessage("mensajeModalReserva", "Complete los datos para editar la reserva");
        return;
    }

    try {
        await apiFetch(`/api/reservas/${reservaId}`, {
            method: "PUT",
            body: JSON.stringify(payload)
        });

        reservaModal.hide();
        showMessage("mensajeReserva", "Reserva actualizada correctamente", "success");
        await listarReservas(document.getElementById("buscadorReservas").value.trim());
    } catch (error) {
        showMessage("mensajeModalReserva", error.message || "No se pudo actualizar la reserva");
    }
}

async function eliminarReserva(reservaId) {
    if (!window.confirm("Desea eliminar esta reserva?")) {
        return;
    }

    try {
        await apiFetch(`/api/reservas/${reservaId}`, { method: "DELETE" });
        showMessage("mensajeReserva", "Reserva eliminada", "success");
        await listarReservas(document.getElementById("buscadorReservas").value.trim());
    } catch (error) {
        showMessage("mensajeReserva", error.message || "No se pudo eliminar la reserva");
    }
}
