const API_URL = "http://localhost:8080/api";

function obtenerNombreAdmin() {
    return localStorage.getItem("admin") || "Administrador";
}

function obtenerDestinoLogin() {
    return window.location.pathname.includes("/html/") ? "../login.html" : "login.html";
}

function obtenerDestinoDashboard() {
    return window.location.pathname.includes("/html/") ? "dashboard.html" : "html/dashboard.html";
}

function guardarSesion(data) {
    localStorage.setItem("authUser", data.username || "");
    localStorage.setItem("admin", data.nombre || data.username || "Administrador");
    if (data.token) {
        localStorage.setItem("token", data.token);
    }
}

function cerrarSesion() {
    localStorage.removeItem("authUser");
    localStorage.removeItem("admin");
    localStorage.removeItem("token");
    window.location.href = obtenerDestinoLogin();
}

function requireLogin() {
    if (!localStorage.getItem("authUser")) {
        window.location.href = obtenerDestinoLogin();
        return false;
    }
    return true;
}

async function apiFetch(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const token = localStorage.getItem("token");

    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers
    });

    const contentType = response.headers.get("content-type") || "";
    let payload = null;

    if (contentType.includes("application/json")) {
        payload = await response.json();
    } else {
        const text = await response.text();
        payload = text ? { message: text } : null;
    }

    if (!response.ok) {
        const message = payload?.message || payload?.error || "No se pudo procesar la solicitud";
        throw new Error(message);
    }

    return payload;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function mostrarMensaje(target, message, type = "danger") {
    const container = typeof target === "string" ? document.getElementById(target) : target;
    if (!container) {
        return;
    }

    if (!message) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = `<div class="alert alert-${type}" role="alert">${escapeHtml(message)}</div>`;
}
