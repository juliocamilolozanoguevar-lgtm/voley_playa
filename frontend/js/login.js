document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("authUser")) {
        window.location.href = obtenerDestinoDashboard();
        return;
    }

    const form = document.getElementById("formLogin");
    form.addEventListener("submit", iniciarSesion);
});

async function iniciarSesion(event) {
    event.preventDefault();
    mostrarMensaje("mensaje", "");

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
        mostrarMensaje("mensaje", "Complete usuario y contrasena");
        return;
    }

    try {
        const data = await apiFetch("/login", {
            method: "POST",
            body: JSON.stringify({ username, password })
        });

        guardarSesion(data);
        mostrarMensaje("mensaje", "Acceso correcto", "success");

        window.setTimeout(() => {
            window.location.href = obtenerDestinoDashboard();
        }, 350);
    } catch (error) {
        mostrarMensaje("mensaje", error.message || "No se pudo iniciar sesion");
    }
}
