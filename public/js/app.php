<?php
declare(strict_types=1);

header('Content-Type: application/javascript; charset=UTF-8');
?>
function buildUrl(path = "") {
    const basePath = window.APP_CONFIG?.basePath || "";
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${basePath}${normalizedPath}`;
}

async function apiFetch(path, options = {}) {
    const skipAuthRedirect = options.skipAuthRedirect === true;
    if ("skipAuthRedirect" in options) {
        delete options.skipAuthRedirect;
    }

    const headers = new Headers(options.headers || {});
    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(buildUrl(path), {
        credentials: "same-origin",
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

    if (response.status === 401 && !skipAuthRedirect) {
        window.location.href = buildUrl("/login");
        throw new Error(payload?.message || "La sesion ha expirado");
    }

    if (!response.ok) {
        throw new Error(payload?.message || "No se pudo procesar la solicitud");
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

function showMessage(target, message, type = "danger") {
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

function formatCurrency(amount) {
    return `S/ ${Number(amount || 0).toFixed(2)}`;
}

function todayIso() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function addThirtyMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = (hours * 60) + minutes + 30;
    const newHours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const newMinutes = String(totalMinutes % 60).padStart(2, "0");
    return `${newHours}:${newMinutes}`;
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-collapse-toggle]").forEach((button) => {
        const targetSelector = button.getAttribute("data-collapse-toggle");
        const target = targetSelector ? document.querySelector(targetSelector) : null;

        if (!target) {
            return;
        }

        button.addEventListener("click", () => {
            const expanded = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!expanded));
            target.classList.toggle("show", !expanded);
        });
    });
});
