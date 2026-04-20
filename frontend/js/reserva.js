document.addEventListener("DOMContentLoaded", () => {
    cargarSelects();
    listarReservas();
});

async function cargarSelects(){

    // CLIENTES
    const resClientes = await fetch(API_URL + "/clientes");
    const clientes = await resClientes.json();

    const selectCliente = document.getElementById("cliente");
    selectCliente.innerHTML = "";

    clientes.forEach(c => {
        selectCliente.innerHTML += `<option value="${c.idCliente}">
            ${c.nombre} ${c.apellido}
        </option>`;
    });

    // CANCHAS
    const resCanchas = await fetch(API_URL + "/canchas");
    const canchas = await resCanchas.json();

    const selectCancha = document.getElementById("cancha");
    selectCancha.innerHTML = "";

    canchas.forEach(c => {
        selectCancha.innerHTML += `<option value="${c.idCancha}">
            ${c.nombreCancha}
        </option>`;
    });
}

async function listarReservas(){

    const res = await fetch(API_URL + "/reservas");
    const data = await res.json();

    const tabla = document.getElementById("tablaReservas");
    tabla.innerHTML = "";

    data.forEach(r => {

        tabla.innerHTML += `
            <tr>
                <td>${r.idReserva}</td>
                <td>${r.cliente?.nombre || ""}</td>
                <td>${r.cancha?.nombreCancha || ""}</td>
                <td>${r.fecha}</td>
                <td>${r.horaInicio}</td>
                <td>${r.horaFin}</td>
                <td>${r.estado || ""}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="eliminarReserva(${r.idReserva})">X</button>
                </td>
            </tr>
        `;
    });
}

async function guardarReserva(){

    const reserva = {
        fecha: document.getElementById("fecha").value,
        horaInicio: document.getElementById("inicio").value,
        horaFin: document.getElementById("fin").value,
        estado: document.getElementById("estado").value,
        cliente: { idCliente: document.getElementById("cliente").value },
        cancha: { idCancha: document.getElementById("cancha").value }
    };

    await fetch(API_URL + "/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reserva)
    });

    alert("Reserva registrada");
    listarReservas();
}

async function eliminarReserva(id){

    await fetch(API_URL + "/reservas/" + id, {
        method: "DELETE"
    });

    listarReservas();
}