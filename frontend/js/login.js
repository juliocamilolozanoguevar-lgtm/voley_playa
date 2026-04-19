document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Detiene el envío normal del formulario

    // 1. Capturamos los datos que escribió Julio (o cualquier usuario)
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMessage');

    // Limpiamos mensajes de error previos
    errorMsg.classList.add('d-none');

    try {
        // 2. Enviamos la petición al backend (IntelliJ ejecutando en el puerto 8080)
        const response = await fetch('http://localhost:8080/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: user,
                password: pass
            })
        });

        // 3. Analizamos la respuesta del servidor
        if (response.ok) {
            const data = await response.json();
            
            // Si el backend devolvió "status: ok" o un objeto Usuario
            if (data.nombre) {
                // Guardamos el nombre en la memoria del navegador para el Dashboard
                localStorage.setItem('nombreUsuario', data.nombre);
                
                // Redirigimos al Dashboard
                window.location.href = "dashboard.html";
            }
        } else {
            // Si el servidor responde con 401 o 400 (error de credenciales)
            errorMsg.classList.remove('d-none');
        }

    } catch (error) {
        // Si el backend está apagado o no hay conexión
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor. ¿Encendiste el backend en IntelliJ?");
    }
});