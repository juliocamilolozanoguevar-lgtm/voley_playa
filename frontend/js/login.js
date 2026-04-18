document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMessage');

    try {
        const response = await fetch('http://localhost:8080/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.status === "ok") {
            // Guardamos el nombre para saludar en el Dashboard
            localStorage.setItem('nombreUsuario', data.nombre);
            window.location.href = "dashboard.html"; 
        } else {
            errorMsg.classList.remove('d-none');
        }
    } catch (error) {
        alert("Error: No se pudo conectar con IntelliJ. Verifica que el servidor esté corriendo.");
    }
});