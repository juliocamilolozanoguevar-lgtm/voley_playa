document.addEventListener("DOMContentLoaded", async () => {
  if (isAppPageRequiringAuth() && !localStorage.getItem("nombreUsuario")) {
    window.location.href = loginPathForCurrentPage();
    return;
  }

  if (window.VoleyApi) {
    try {
      await window.VoleyApi.init();
    } catch (e) {
      // Origen se mantiene en el default; las paginas mostraran alertas al cargar datos
    }
  }

  hydrateSession();
  bindLogout();
});

function isAppPageRequiringAuth() {
  const path = (window.location.pathname || "").toLowerCase();
  return !path.endsWith("login.html");
}

function loginPathForCurrentPage() {
  return (window.location.pathname || "").includes("/html/") ? "../login.html" : "login.html";
}

function hydrateSession() {
  const username = localStorage.getItem("nombreUsuario") || "Administrador";
  const apiOrigin = window.VoleyApi?.origin || "http://localhost:8080";

  document.querySelectorAll("[data-username]").forEach((element) => {
    element.textContent = username;
  });

  document.querySelectorAll("[data-api-origin]").forEach((element) => {
    element.textContent = apiOrigin;
  });
}

function bindLogout() {
  document.querySelectorAll("[data-logout]").forEach((link) => {
    link.addEventListener("click", () => {
      localStorage.removeItem("nombreUsuario");
    });
  });
}
