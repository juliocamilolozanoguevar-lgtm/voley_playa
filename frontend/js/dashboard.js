// js/dashboard.js

document.addEventListener("DOMContentLoaded", () => {

    const admin = localStorage.getItem("admin");
    document.getElementById("adminNombre").innerText = admin ? "Admin: " + admin : "Admin";

    cargarDashboard();
});

async function cargarDashboard(){

    try {

        // CLIENTES
        const resClientes = await fetch(API_URL + "/clientes");
        const clientes = await resClientes.json();
        document.getElementById("totalClientes").innerText = clientes.length;

        // RESERVAS
        const resReservas = await fetch(API_URL + "/reservas");
        const reservas = await resReservas.json();
        document.getElementById("totalReservas").innerText = reservas.length;

        // CANCHAS
        const resCanchas = await fetch(API_URL + "/canchas");
        const canchas = await resCanchas.json();
        document.getElementById("totalCanchas").innerText = canchas.length;

        // PAGOS
        const resPagos = await fetch(API_URL + "/pagos");
        const pagos = await resPagos.json();
        document.getElementById("totalPagos").innerText = pagos.length;

        // REPORTE RESERVAS
        const tabla = document.getElementById("tablaReporte");
        tabla.innerHTML = "";

        reservas.forEach(r => {

            const fila = `
                <tr>
                    <td>${r.idReserva}</td>
                    <td>${r.cliente ? r.cliente.nombre : "N/A"}</td>
                    <td>${r.cancha ? r.cancha.nombreCancha : "N/A"}</td>
                    <td>${r.fecha}</td>
                    <td>${r.estado || "SIN ESTADO"}</td>
                </tr>
            `;

            tabla.innerHTML += fila;
        });

    } catch(error){
        console.log("Error cargando dashboard:", error);
    }
}

function cerrarSesion(){
    localStorage.removeItem("admin");
    window.location.href = "login.html";
}