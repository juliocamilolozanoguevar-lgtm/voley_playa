const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMessage");
const loginButton = document.getElementById("loginButton");
const apiOriginLabel = document.getElementById("apiOriginLabel");

if (apiOriginLabel && window.VoleyApi) {
  apiOriginLabel.textContent = window.VoleyApi.origin;
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value;

    toggleMessage("", true);
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
