// js/dashboard.js

document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard cargado y listo");
    
    // Llamamos a las funciones principales
    cargarNombreUsuario();
    listarCanchas();
});

function cargarNombreUsuario() {
    const nombre = localStorage.getItem('nombreUsuario') || 'Administrador';
    const el = document.getElementById('userName');
    if (el) el.innerText = `Bienvenido, ${nombre}`;
}

async function listarCanchas() {
    try {
        const response = await fetch('http://localhost:8080/api/canchas');
        const canchas = await response.json();
        
        const contenedor = document.getElementById('gridCanchas');
        contenedor.innerHTML = ''; // Limpiamos antes de cargar

        canchas.forEach(cancha => {
            // Lógica para pintar las cards de Bootstrap
            contenedor.innerHTML += crearCardCancha(cancha);
        });
    } catch (error) {
        console.error("Error conectando al Backend:", error);
    }
}