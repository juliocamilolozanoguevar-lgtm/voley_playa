document.addEventListener("DOMContentLoaded", () => {
  hydrateSession();
  bindLogout();
});

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
