document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:8080/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });

        const data = await response.json();

        if (data.status === "ok") {
            localStorage.setItem('nombreUsuario', data.nombre);
            // IMPORTANTE: Redirigir al nombre de archivo correcto
            window.location.href = "dashboard.html"; 
        } else {
            document.getElementById('errorMessage').classList.remove('d-none');
        }
    } catch (error) {
        alert("Error: Asegúrate de que IntelliJ esté corriendo en el puerto 8080");
    }
});