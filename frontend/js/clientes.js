let canchasCache = [];
let horariosLibresActuales = [];
let horaInicioSeleccionada = "";

document.addEventListener("DOMContentLoaded", async () => {
    if (!requireLogin()) {
        return;
    }

    document.getElementById("nombreAdmin").textContent = obtenerNombreAdmin();
    document.getElementById("formClienteReserva").addEventListener("submit", guardarClienteYReserva);
    document.getElementById("btnGuardarSoloCliente").addEventListener("click", guardarSoloCliente);
    document.getElementById("canchaId").addEventListener("change", manejarCambioBase);
    document.getElementById("fecha").addEventListener("change", manejarCambioBase);
    document.getElementById("horaFin").addEventListener("change", actualizarEstadoHorario);

    document.getElementById("fecha").value = obtenerFechaLocal();
    document.getElementById("horariosDisponibles").innerHTML = '<span class="text-muted">Seleccione una cancha y una fecha.</span>';

    await Promise.all([
        cargarCanchas(),
        listarClientes(),
        listarReservas()
    ]);
});

async function cargarCanchas() {
    try {
        canchasCache = await apiFetch("/canchas");
        const select = document.getElementById("canchaId");
        select.innerHTML = ['<option value="">Seleccione una cancha</option>']
            .concat(canchasCache.map((cancha) =>
                `<option value="${cancha.idCancha}">${escapeHtml(cancha.nombreCancha)}</option>`
            ))
            .join("");
    } catch (error) {
        mostrarMensaje("mensajeCliente", error.message || "No se pudieron cargar las canchas");
    }
}

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

async function listarReservas() {
    try {
        const reservas = await apiFetch("/reservas");
        const tabla = document.getElementById("tablaReservasCliente");

        if (!reservas.length) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">No hay reservas registradas.</td>
                </tr>
            `;
            return;
        }

        tabla.innerHTML = reservas.map((reserva) => `
            <tr>
                <td>${reserva.idReserva}</td>
                <td>${renderCliente(reserva)}</td>
                <td>${escapeHtml(reserva.cancha?.nombreCancha || "Sin cancha")}</td>
                <td>${escapeHtml(reserva.fecha || "")}</td>
                <td>${escapeHtml(reserva.horaInicio || "")} - ${escapeHtml(reserva.horaFin || "")}</td>
                <td>${escapeHtml(reserva.estadoReserva || reserva.estado || "RESERVADA")}</td>
            </tr>
        `).join("");
    } catch (error) {
        mostrarMensaje("mensajeCliente", error.message || "No se pudieron cargar las reservas");
    }
}

async function guardarSoloCliente() {
    mostrarMensaje("mensajeCliente", "");

    const cliente = leerClienteFormulario();
    if (!cliente) {
        return;
    }

    try {
        const existente = await buscarClientePorDni(cliente.dni);
        if (existente) {
            mostrarMensaje("mensajeCliente", "Ese cliente ya existe en la base de datos", "warning");
            return;
        }

        await apiFetch("/clientes", {
            method: "POST",
            body: JSON.stringify(cliente)
        });

        limpiarFormulario(true);
        mostrarMensaje("mensajeCliente", "Cliente guardado correctamente", "success");
        await listarClientes();
    } catch (error) {
        mostrarMensaje("mensajeCliente", error.message || "No se pudo guardar el cliente");
    }
}

async function guardarClienteYReserva(event) {
    event.preventDefault();
    mostrarMensaje("mensajeCliente", "");

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
        mostrarMensaje("mensajeCliente", "Complete los datos de la reserva");
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

        limpiarFormulario(false);
        mostrarMensaje("mensajeCliente", "Cliente y reserva guardados correctamente", "success");
        await Promise.all([listarClientes(), listarReservas()]);
        await consultarDisponibilidad();
    } catch (error) {
        mostrarMensaje("mensajeCliente", error.message || "No se pudo guardar la reserva");
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
        const data = await apiFetch(`/reservas/disponibilidad?${new URLSearchParams({ canchaId, fecha }).toString()}`);
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

        estado.textContent = "Seleccione el horario de inicio desde los espacios libres.";
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

    if (opciones.length === 1) {
        select.value = opciones[0];
    }
}

function construirOpcionesFin(horaInicio) {
    const opciones = [];
    const libres = new Set(horariosLibresActuales);
    let cursor = horaInicio;

    while (libres.has(cursor)) {
        cursor = sumarTreintaMinutos(cursor);
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
        const data = await apiFetch(`/reservas/disponibilidad?${params.toString()}`);
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
        mostrarMensaje("mensajeCliente", "Complete los datos del cliente");
        return null;
    }

    if (!/^\d{8}$/.test(dni)) {
        mostrarMensaje("mensajeCliente", "El DNI debe tener 8 digitos");
        return null;
    }

    return { dni, nombre, apellido };
}

async function buscarClientePorDni(dni) {
    try {
        return await apiFetch(`/clientes/dni/${dni}`);
    } catch (error) {
        return null;
    }
}

function limpiarFormulario(soloCliente) {
    document.getElementById("dni").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("apellido").value = "";

    if (!soloCliente) {
        document.getElementById("canchaId").value = "";
        document.getElementById("monto").value = "";
        document.getElementById("fecha").value = obtenerFechaLocal();
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

function renderCliente(reserva) {
    if (!reserva.cliente) {
        return "Sin cliente";
    }

    return `${escapeHtml(reserva.cliente.nombre)} ${escapeHtml(reserva.cliente.apellido)}`;
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
