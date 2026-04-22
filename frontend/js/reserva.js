async function listarReservas(){

    const res = await fetch(API_URL + "/reservas");
    const data = await res.json();

    const tabla = document.getElementById("tablaReservas");
    tabla.innerHTML = "";

    data.forEach(r => {

        tabla.innerHTML += `
            <tr>
                <td>${r.idReserva}</td>

                <td>
                    ${r.cliente
                        ? r.cliente.nombre + " " + r.cliente.apellido
                        : "SIN CLIENTE"}
                    <br>
                    <small>${r.cliente ? r.cliente.dni : ""}</small>
                </td>

                <td>${r.cancha ? r.cancha.nombreCancha : ""}</td>

                <td>${r.fecha}</td>
                <td>${r.horaInicio}</td>
                <td>${r.horaFin}</td>
                <td>${r.estado || "SIN ESTADO"}</td>

                <td>
                    <button class="btn btn-warning btn-sm" onclick="editarReserva(${r.idReserva})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarReserva(${r.idReserva})">X</button>
                </td>
            </tr>
        `;
    });
}