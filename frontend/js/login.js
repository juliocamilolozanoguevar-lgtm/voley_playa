const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMessage");
const loginButton = document.getElementById("loginButton");
const backendStatus = document.getElementById("backendStatus");

if (window.VoleyApi) {
  window.VoleyApi
    .init()
    .then(() => {
      toggleBackendStatus(`Backend conectado en ${window.VoleyApi.origin}`, false);
    })
    .catch((error) => {
      toggleBackendStatus(error.message || "No se pudo conectar con el backend.", true);
    });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value;

    toggleMessage("", true);
    if (!user || !pass) {
      toggleMessage("Completa usuario y contrasena.");
      return;
    }

    if (loginButton) {
      loginButton.disabled = true;
      loginButton.textContent = "Validando...";
    }

    try {
      const data = await window.VoleyApi.fetchJson("/login", {
        method: "POST",
        body: JSON.stringify({ username: user, password: pass }),
      });

      if (data.status === "ok") {
        localStorage.setItem("nombreUsuario", data.nombre || user || "Administrador");
        window.location.href = "dashboard.html";
        return;
      }

      toggleMessage(data.message || "Credenciales incorrectas.");
    } catch (error) {
      toggleMessage(error.message || "No se pudo conectar con el backend.");
    } finally {
      if (loginButton) {
        loginButton.disabled = false;
        loginButton.textContent = "Ingresar al sistema";
      }
    }
  });
}

function toggleMessage(message, hide = false) {
  if (!errorMsg) {
    return;
  }

  if (hide) {
    errorMsg.textContent = "";
    errorMsg.classList.add("d-none");
    return;
  }

  errorMsg.textContent = message;
  errorMsg.classList.remove("d-none");
}

function toggleBackendStatus(message, isError = false) {
  if (!backendStatus) {
    return;
  }

  backendStatus.textContent = message;
  backendStatus.classList.toggle("text-danger", isError);
  backendStatus.classList.toggle("text-secondary", !isError);
}
