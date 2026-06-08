<?php
declare(strict_types=1);

header('Content-Type: application/javascript; charset=UTF-8');
?>
let canchasCache = [];
let clientesCache = [];
let horariosLibresActuales = [];
let horaInicioSeleccionada = "";
let modalHorariosLibresActuales = [];
let modalClienteSeleccionado = null;

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("formClienteReserva");
    if (!form) {
        return;
    }

    form.addEventListener("submit", guardarClienteYReserva);
    document.getElementById("btnGuardarSoloCliente").addEventListener("click", guardarSoloCliente);
    document.getElementById("btnLimpiarClienteReserva").addEventListener("click", () => limpiarFormulario(false));
    document.getElementById("canchaId").addEventListener("change", manejarCambioBase);
    document.getElementById("fecha").addEventListener("change", manejarCambioBase);
    document.getElementById("horaFin").addEventListener("change", actualizarEstadoHorario);
    document.getElementById("dni").addEventListener("change", autocompletarCliente);
    document.getElementById("buscadorClientes").addEventListener("input", manejarBusquedaClientes);
    document.getElementById("btnBuscarClientes").addEventListener("click", () => {
        filtrarClientes(document.getElementById("buscadorClientes").value);
    });

    document.getElementById("fecha").value = todayIso();
    document.getElementById("fecha").min = todayIso();
    document.getElementById("horariosDisponibles").innerHTML = '<span class="text-muted">Seleccione una cancha y una fecha.</span>';
    document.getElementById("tablaClientes").addEventListener("click", manejarAccionesClientes);
    document.getElementById("modalCanchaId").addEventListener("change", consultarDisponibilidadModal);
    document.getElementById("modalFecha").addEventListener("change", consultarDisponibilidadModal);
    document.getElementById("modalHoraFin").addEventListener("change", actualizarEstadoHorarioModal);
    document.getElementById("btnGuardarNuevaReserva").addEventListener("click", guardarNuevaReservaModal);
    document.querySelectorAll("[data-modal-cliente-dismiss]").forEach((button) => {
        button.addEventListener("click", cerrarModalNuevaReserva);
    });

    await Promise.all([cargarCanchas(), listarClientes()]);
});

async function cargarCanchas() {
    try {
        canchasCache = await apiFetch("/api/canchas");
        const select = document.getElementById("canchaId");
        select.innerHTML = ['<option value="">Seleccione una cancha</option>']
            .concat(canchasCache.map((cancha) =>
                `<option value="${cancha.idCancha}">${escapeHtml(cancha.nombreCancha)}</option>`
            ))
            .join("");
        llenarCanchasModal();
    } catch (error) {
        showMessage("mensajeCliente", error.message || "No se pudieron cargar las canchas");
    }
}

function llenarCanchasModal() {
    const select = document.getElementById("modalCanchaId");
    if (!select) {
        return;
    }

    select.innerHTML = ['<option value="">Seleccione una cancha</option>']
        .concat(canchasCache.map((cancha) =>
            `<option value="${cancha.idCancha}">${escapeHtml(cancha.nombreCancha)}</option>`
        ))
        .join("");
}

async function listarClientes() {
    try {
        clientesCache = await apiFetch("/api/clientes");
        filtrarClientes(document.getElementById("buscadorClientes")?.value || "");
    } catch (error) {
        showMessage("mensajeCliente", error.message || "No se pudieron cargar los clientes");
    }
}

function manejarBusquedaClientes(event) {
    filtrarClientes(event.target.value);
}

function filtrarClientes(search = "") {
    const termino = normalizarTexto(search);
    const clientesFiltrados = termino
        ? clientesCache.filter((cliente) => {
            const textoCliente = normalizarTexto([
                cliente.idCliente,
                cliente.dni,
                cliente.nombre,
                cliente.apellido
            ].join(" "));

            return textoCliente.includes(termino);
        })
        : clientesCache;

    renderTablaClientes(clientesFiltrados, termino !== "");
}

function renderTablaClientes(clientes, filtrado = false) {
    const tabla = document.getElementById("tablaClientes");

    if (!clientes.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">${filtrado ? "No se encontraron clientes con ese criterio." : "No hay clientes registrados."}</td>
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
            <td class="d-flex flex-wrap gap-2">
                <button type="button" class="btn btn-outline-primary btn-sm" data-action="nueva-reserva" data-id="${cliente.idCliente}">
                    Nueva reserva
                </button>
                <button type="button" class="btn btn-outline-danger btn-sm" data-action="delete" data-id="${cliente.idCliente}">
                    Eliminar
                </button>
            </td>
        </tr>
    `).join("");
}

function normalizarTexto(value) {
    return String(value ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function manejarAccionesClientes(event) {
    const button = event.target.closest("[data-action]");
    if (!button) {
        return;
    }

    const clienteId = Number(button.dataset.id);
    const cliente = clientesCache.find((item) => Number(item.idCliente) === clienteId);

    if (!cliente) {
        showMessage("mensajeCliente", "No se encontro el cliente seleccionado");
        return;
    }

    if (button.dataset.action === "nueva-reserva") {
        abrirModalNuevaReserva(cliente);
        return;
    }

    if (button.dataset.action === "delete") {
        eliminarCliente(cliente);
    }
}

async function eliminarCliente(cliente) {
    const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.trim();
    if (!window.confirm(`Desea eliminar al cliente ${nombreCompleto}?`)) {
        return;
    }

    try {
        await apiFetch(`/api/clientes/${cliente.idCliente}`, { method: "DELETE" });
        showMessage("mensajeCliente", "Cliente eliminado correctamente", "success");
        await listarClientes();
    } catch (error) {
        showMessage("mensajeCliente", error.message || "No se pudo eliminar el cliente");
    }
}

function abrirModalNuevaReserva(cliente) {
    modalClienteSeleccionado = cliente;
    document.getElementById("clienteIdSeleccionado").value = cliente.idCliente;
    document.getElementById("modalClienteId").value = cliente.idCliente;
    document.getElementById("modalDni").value = cliente.dni || "";
    document.getElementById("modalNombre").value = cliente.nombre || "";
    document.getElementById("modalApellido").value = cliente.apellido || "";
    document.getElementById("modalCanchaId").value = "";
    document.getElementById("modalFecha").value = todayIso();
    document.getElementById("modalFecha").min = todayIso();
    document.getElementById("modalMonto").value = "";
    restablecerSeleccionHorarioModal();
    showMessage("mensajeModalClienteReserva", "");

    const modal = document.getElementById("modalNuevaReservaCliente");
    modal.classList.add("show");
    modal.removeAttribute("aria-hidden");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("role", "dialog");
    modal.style.display = "block";
    document.body.classList.add("modal-open");
}

function obtenerClienteSeleccionado() {
    const clienteId = Number(document.getElementById("clienteIdSeleccionado").value);
    if (!clienteId) {
        return null;
    }

    return clientesCache.find((cliente) => Number(cliente.idCliente) === clienteId) || null;
}

function bloquearDatosCliente(bloqueado) {
    ["dni", "nombre", "apellido"].forEach((id) => {
        document.getElementById(id).readOnly = bloqueado;
    });
    document.getElementById("btnGuardarSoloCliente").disabled = bloqueado;
}

function cerrarModalNuevaReserva() {
    const modal = document.getElementById("modalNuevaReservaCliente");
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    modal.removeAttribute("aria-modal");
    modal.removeAttribute("role");
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
    modalClienteSeleccionado = null;
}

async function consultarDisponibilidadModal() {
    restablecerSeleccionHorarioModal();

    const canchaId = document.getElementById("modalCanchaId").value;
    const fecha = document.getElementById("modalFecha").value;
    const contenedor = document.getElementById("modalHorariosDisponibles");
    const estado = document.getElementById("modalEstadoDisponibilidad");

    if (!canchaId || !fecha) {
        modalHorariosLibresActuales = [];
        contenedor.innerHTML = '<span class="text-muted">Seleccione una cancha y una fecha.</span>';
        estado.textContent = "";
        return;
    }

    try {
        const data = await apiFetch(`/api/reservas/disponibilidad?${new URLSearchParams({ canchaId, fecha }).toString()}`);
        modalHorariosLibresActuales = data.horariosLibres || [];

        if (!modalHorariosLibresActuales.length) {
            contenedor.innerHTML = '<span class="badge text-bg-secondary">Sin horarios libres</span>';
            estado.textContent = "No hay horarios libres para esa fecha.";
            estado.className = "text-danger fw-semibold";
            return;
        }

        contenedor.innerHTML = modalHorariosLibresActuales
            .map((hora) => `<button type="button" class="slot-badge" data-modal-slot="${hora}">${escapeHtml(hora)}</button>`)
            .join("");

        contenedor.querySelectorAll("[data-modal-slot]").forEach((button) => {
            button.addEventListener("click", () => seleccionarHoraInicioModal(button.dataset.modalSlot));
        });

        estado.textContent = "Seleccione el horario inicial y luego el horario final.";
        estado.className = "helper-text";
    } catch (error) {
        modalHorariosLibresActuales = [];
        contenedor.innerHTML = '<span class="text-danger">No se pudo consultar disponibilidad.</span>';
        estado.textContent = "";
    }
}

function seleccionarHoraInicioModal(hora) {
    document.getElementById("modalHoraInicio").value = hora;
    document.getElementById("modalHoraInicioSeleccionada").textContent = hora;

    document.querySelectorAll("[data-modal-slot]").forEach((button) => {
        button.classList.toggle("active", button.dataset.modalSlot === hora);
    });

    llenarOpcionesHoraFinModal(hora);
    actualizarEstadoHorarioModal();
}

function llenarOpcionesHoraFinModal(horaInicio) {
    const select = document.getElementById("modalHoraFin");
    const opciones = construirOpcionesFinModal(horaInicio);

    if (!opciones.length) {
        select.innerHTML = '<option value="">Sin horarios finales disponibles</option>';
        return;
    }

    select.innerHTML = ['<option value="">Seleccione el horario final</option>']
        .concat(opciones.map((hora) => `<option value="${hora}">${hora}</option>`))
        .join("");
}

function construirOpcionesFinModal(horaInicio) {
    const opciones = [];
    const libres = new Set(modalHorariosLibresActuales);
    let cursor = horaInicio;

    while (libres.has(cursor)) {
        cursor = addThirtyMinutes(cursor);
        opciones.push(cursor);
    }

    return opciones;
}

async function actualizarEstadoHorarioModal() {
    const canchaId = document.getElementById("modalCanchaId").value;
    const fecha = document.getElementById("modalFecha").value;
    const horaInicio = document.getElementById("modalHoraInicio").value;
    const horaFin = document.getElementById("modalHoraFin").value;
    const estado = document.getElementById("modalEstadoDisponibilidad");

    if (!canchaId || !fecha || !horaInicio || !horaFin) {
        return;
    }

    try {
        const params = new URLSearchParams({ canchaId, fecha, horaInicio, horaFin });
        const data = await apiFetch(`/api/reservas/disponibilidad?${params.toString()}`);
        estado.textContent = data.disponible
            ? "Horario listo para registrar."
            : "Ese rango horario ya no esta disponible.";
        estado.className = data.disponible ? "text-success fw-semibold" : "text-danger fw-semibold";
    } catch (error) {
        estado.textContent = "No se pudo validar el horario.";
        estado.className = "text-danger fw-semibold";
    }
}

async function guardarNuevaReservaModal() {
    showMessage("mensajeModalClienteReserva", "");

    const cliente = modalClienteSeleccionado || obtenerClienteSeleccionado();
    const canchaId = Number(document.getElementById("modalCanchaId").value);
    const fecha = document.getElementById("modalFecha").value;
    const horaInicio = document.getElementById("modalHoraInicio").value;
    const horaFin = document.getElementById("modalHoraFin").value;
    const montoTexto = document.getElementById("modalMonto").value.trim();

    if (!cliente) {
        showMessage("mensajeModalClienteReserva", "Seleccione un cliente registrado");
        return;
    }

    if (!canchaId || !fecha || !horaInicio || !horaFin) {
        showMessage("mensajeModalClienteReserva", "Complete los datos de la nueva reserva");
        return;
    }

    if (fecha < todayIso()) {
        showMessage("mensajeModalClienteReserva", "No se puede crear una reserva con una fecha pasada");
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
        await apiFetch("/api/reservas", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        cerrarModalNuevaReserva();
        limpiarFormulario(false);
        showMessage("mensajeCliente", "Nueva reserva registrada correctamente", "success");
        await listarClientes();
    } catch (error) {
        showMessage("mensajeModalClienteReserva", error.message || "No se pudo guardar la nueva reserva");
    }
}

function restablecerSeleccionHorarioModal() {
    modalHorariosLibresActuales = [];
    document.getElementById("modalHoraInicio").value = "";
    document.getElementById("modalHoraInicioSeleccionada").textContent = "Seleccione un horario disponible";
    document.getElementById("modalHoraFin").innerHTML = '<option value="">Seleccione el horario final</option>';
    document.getElementById("modalEstadoDisponibilidad").textContent = "";
    document.getElementById("modalEstadoDisponibilidad").className = "helper-text";
    document.getElementById("modalHorariosDisponibles").innerHTML = '<span class="text-muted">Seleccione una cancha y una fecha.</span>';
}

async function guardarSoloCliente() {
    showMessage("mensajeCliente", "");
    let cliente = leerClienteFormulario();
    if (!cliente) {
        return;
    }

    const clienteSeleccionado = obtenerClienteSeleccionado();
    if (clienteSeleccionado) {
        cliente = {
            dni: clienteSeleccionado.dni,
            nombre: clienteSeleccionado.nombre,
            apellido: clienteSeleccionado.apellido
        };
    }

    try {
        const existente = await buscarClientePorDni(cliente.dni);
        if (existente) {
            showMessage("mensajeCliente", "Ese cliente ya existe en la base de datos", "warning");
            return;
        }

        await apiFetch("/api/clientes", {
            method: "POST",
            body: JSON.stringify(cliente)
        });

        limpiarFormulario(true);
        showMessage("mensajeCliente", "Cliente guardado correctamente", "success");
        await listarClientes();
    } catch (error) {
        showMessage("mensajeCliente", error.message || "No se pudo guardar el cliente");
    }
}

async function guardarClienteYReserva(event) {
    event.preventDefault();
    showMessage("mensajeCliente", "");

    const cliente = leerClienteFormulario();
    if (!cliente) {
        return;
    }

    const canchaId = Number(document.getElementById("canchaId").value);
    const fecha = document.getElementById("fecha").value;
    const horaInicio = document.getElementById("horaInicio").value;
    const horaFin = document.getElementById("horaFin").value;
    const montoTexto = document.getElementById("monto").value.trim();

    if (!canchaId || !fecha || !horaInicio || !horaFin) {
        showMessage("mensajeCliente", "Complete los datos de la reserva");
        return;
    }

    if (fecha < todayIso()) {
        showMessage("mensajeCliente", "No se puede crear una reserva con una fecha pasada");
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
        await apiFetch("/api/reservas", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        limpiarFormulario(false);
        showMessage("mensajeCliente", obtenerClienteSeleccionado() ? "Nueva reserva registrada correctamente para el cliente seleccionado" : "Cliente y reserva guardados correctamente", "success");
        await listarClientes();
        await consultarDisponibilidad();
    } catch (error) {
        showMessage("mensajeCliente", error.message || "No se pudo guardar la reserva");
    }
}

async function manejarCambioBase() {
    restablecerSeleccionHorario();
    await consultarDisponibilidad();
}

async function consultarDisponibilidad() {
    const canchaId = document.getElementById("canchaId").value;
    const fecha = document.getElementById("fecha").value;
    const contenedor = document.getElementById("horariosDisponibles");
    const estado = document.getElementById("estadoDisponibilidad");

    if (!canchaId || !fecha) {
        horariosLibresActuales = [];
        contenedor.innerHTML = '<span class="text-muted">Seleccione una cancha y una fecha.</span>';
        estado.textContent = "";
        return;
    }

    try {
        const data = await apiFetch(`/api/reservas/disponibilidad?${new URLSearchParams({ canchaId, fecha }).toString()}`);
        horariosLibresActuales = data.horariosLibres || [];

        if (!horariosLibresActuales.length) {
            contenedor.innerHTML = '<span class="badge text-bg-secondary">Sin horarios libres</span>';
            estado.textContent = "No hay horarios libres para esa fecha.";
            estado.className = "text-danger fw-semibold";
            return;
        }

        contenedor.innerHTML = horariosLibresActuales
            .map((hora) => `<button type="button" class="slot-badge" data-slot="${hora}">${escapeHtml(hora)}</button>`)
            .join("");

        contenedor.querySelectorAll("[data-slot]").forEach((button) => {
            button.addEventListener("click", () => seleccionarHoraInicio(button.dataset.slot));
        });

        estado.textContent = "Seleccione el horario inicial y luego el horario final.";
        estado.className = "helper-text";
    } catch (error) {
        horariosLibresActuales = [];
        contenedor.innerHTML = '<span class="text-danger">No se pudo consultar disponibilidad.</span>';
        estado.textContent = "";
    }
}

function seleccionarHoraInicio(hora) {
    horaInicioSeleccionada = hora;
    document.getElementById("horaInicio").value = hora;
    document.getElementById("horaInicioSeleccionada").textContent = hora;

    document.querySelectorAll("[data-slot]").forEach((button) => {
        button.classList.toggle("active", button.dataset.slot === hora);
    });

    llenarOpcionesHoraFin(hora);
    actualizarEstadoHorario();
}

function llenarOpcionesHoraFin(horaInicio) {
    const select = document.getElementById("horaFin");
    const opciones = construirOpcionesFin(horaInicio);

    if (!opciones.length) {
        select.innerHTML = '<option value="">Sin horarios finales disponibles</option>';
        return;
    }

    select.innerHTML = ['<option value="">Seleccione el horario final</option>']
        .concat(opciones.map((hora) => `<option value="${hora}">${hora}</option>`))
        .join("");
}

function construirOpcionesFin(horaInicio) {
    const opciones = [];
    const libres = new Set(horariosLibresActuales);
    let cursor = horaInicio;

    while (libres.has(cursor)) {
        cursor = addThirtyMinutes(cursor);
        opciones.push(cursor);
    }

    return opciones;
}

async function actualizarEstadoHorario() {
    const canchaId = document.getElementById("canchaId").value;
    const fecha = document.getElementById("fecha").value;
    const horaInicio = document.getElementById("horaInicio").value;
    const horaFin = document.getElementById("horaFin").value;
    const estado = document.getElementById("estadoDisponibilidad");

    if (!canchaId || !fecha || !horaInicio || !horaFin) {
        return;
    }

    try {
        const params = new URLSearchParams({ canchaId, fecha, horaInicio, horaFin });
        const data = await apiFetch(`/api/reservas/disponibilidad?${params.toString()}`);
        estado.textContent = data.disponible
            ? "Horario listo para registrar."
            : "Ese rango horario ya no esta disponible.";
        estado.className = data.disponible ? "text-success fw-semibold" : "text-danger fw-semibold";
    } catch (error) {
        estado.textContent = "No se pudo validar el horario.";
        estado.className = "text-danger fw-semibold";
    }
}

function leerClienteFormulario() {
    const dni = document.getElementById("dni").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();

    if (!dni || !nombre || !apellido) {
        showMessage("mensajeCliente", "Complete los datos del cliente");
        return null;
    }

    if (!/^\d{8}$/.test(dni)) {
        showMessage("mensajeCliente", "El DNI debe tener 8 digitos");
        return null;
    }

    return { dni, nombre, apellido };
}

async function autocompletarCliente() {
    const dni = document.getElementById("dni").value.trim();
    if (!/^\d{8}$/.test(dni)) {
        return;
    }

    const cliente = await buscarClientePorDni(dni);
    if (!cliente) {
        return;
    }

    document.getElementById("nombre").value = cliente.nombre || "";
    document.getElementById("apellido").value = cliente.apellido || "";
}

async function buscarClientePorDni(dni) {
    try {
        return await apiFetch(`/api/clientes/dni/${dni}`);
    } catch (error) {
        return null;
    }
}

function limpiarFormulario(soloCliente) {
    document.getElementById("dni").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("apellido").value = "";
    document.getElementById("clienteIdSeleccionado").value = "";
    bloquearDatosCliente(false);

    if (!soloCliente) {
        document.getElementById("canchaId").value = "";
        document.getElementById("monto").value = "";
        document.getElementById("fecha").value = todayIso();
        document.getElementById("horariosDisponibles").innerHTML = '<span class="text-muted">Seleccione una cancha y una fecha.</span>';
        restablecerSeleccionHorario();
    }
}

function restablecerSeleccionHorario() {
    horaInicioSeleccionada = "";
    document.getElementById("horaInicio").value = "";
    document.getElementById("horaInicioSeleccionada").textContent = "Seleccione un horario disponible";
    document.getElementById("horaFin").innerHTML = '<option value="">Seleccione el horario final</option>';
    document.getElementById("estadoDisponibilidad").textContent = "";
    document.getElementById("estadoDisponibilidad").className = "helper-text";
}
