document.addEventListener("DOMContentLoaded", () => {
    listarClientes();
});

async function listarClientes(){

    const res = await fetch(API_URL + "/clientes");
    const data = await res.json();

    const tabla = document.getElementById("tablaClientes");
    tabla.innerHTML = "";

    data.forEach(c => {

        tabla.innerHTML += `
            <tr>
                <td>${c.idCliente}</td>
                <td>${c.dni}</td>
                <td>${c.nombre}</td>
                <td>${c.apellido}</td>
                <td>${c.celular || ""}</td>
            </tr>
        `;
    });
}

async function guardarCliente(){

    const cliente = {
        dni: document.getElementById("dni").value,
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        celular: document.getElementById("celular").value
    };

    await fetch(API_URL + "/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente)
    });

    alert("Cliente registrado");
    listarClientes();

    document.getElementById("dni").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("apellido").value = "";
    document.getElementById("celular").value = "";
}