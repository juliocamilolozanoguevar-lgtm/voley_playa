document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:8080/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.status === "ok") {
            // Guardamos el nombre real que viene de MySQL
            localStorage.setItem('nombreUsuario', data.nombre);
            alert("¡Bienvenido " + data.nombre + "!");
            window.location.href = "dashboard.html"; // Redirige al panel
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("El backend de Java no está encendido.");
    }
});