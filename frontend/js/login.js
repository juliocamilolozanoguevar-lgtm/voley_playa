document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMessage');

    try {
        const response = await fetch('http://localhost:8080/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.status === "ok") {
            // Guardamos el nombre que viene del Backend (Julio Lozano, etc.)
            localStorage.setItem('nombreUsuario', data.nombre);
            // Redirigimos al Dashboard
            window.location.href = "index.html";
        } else {
            // Mostrar error
            errorMsg.classList.remove('d-none');
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor. ¿Está encendido IntelliJ?");
    }
});