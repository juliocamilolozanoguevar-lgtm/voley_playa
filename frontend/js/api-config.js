(function () {
  const DEFAULT_PORT = "8080";
  const storedOrigin = window.localStorage.getItem("voleyApiOrigin");
  const metaOrigin = document
    .querySelector('meta[name="voley-api-origin"]')
    ?.getAttribute("content")
    ?.trim();
  const host = window.location.hostname || "localhost";
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const preferredOrigin = (metaOrigin || storedOrigin || `${protocol}//${host}:${DEFAULT_PORT}`).replace(/\/+$/, "");
  const originCandidates = Array.from(
    new Set(
      [
        preferredOrigin,
        `${protocol}//${host}:${DEFAULT_PORT}`,
        `${protocol}//localhost:${DEFAULT_PORT}`,
        `${protocol}//127.0.0.1:${DEFAULT_PORT}`,
      ]
        .filter(Boolean)
        .map((value) => value.replace(/\/+$/, ""))
    )
  );

  let activeOrigin = preferredOrigin;
  let initPromise;

  async function probeOrigin(origin) {
    const response = await fetch(`${origin}/api/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error("El backend no respondio correctamente.");
    }

    const payload = await response.json();
    if (payload.status !== "ok" || payload.database !== "connected") {
      throw new Error(payload.message || "La base de datos no esta conectada.");
    }

    return origin;
  }

  async function init() {
    if (!initPromise) {
      initPromise = (async () => {
        let lastError = new Error("No se pudo conectar con el backend.");

        for (const candidate of originCandidates) {
          try {
            activeOrigin = await probeOrigin(candidate);
            window.localStorage.setItem("voleyApiOrigin", activeOrigin);
            return activeOrigin;
          } catch (error) {
            lastError = error;
          }
        }

        throw lastError;
      })();
    }

    return initPromise;
  }

  function getOrigin() {
    return activeOrigin;
  }

  function getBaseUrl() {
    return `${activeOrigin}/api`;
  }

  async function fetchJson(path, options = {}) {
    await init();
    const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    };

    let response;
    try {
      response = await fetch(url, { ...options, headers });
    } catch (error) {
      throw new Error("No se pudo conectar con el backend.");
    }

    const contentType = response.headers.get("content-type") || "";
    let payload;

    if (response.status === 204 || response.status === 205) {
      payload = null;
    } else {
      const text = await response.text();
      if (!text) {
        payload = null;
      } else if (contentType.includes("application/json")) {
        try {
          payload = JSON.parse(text);
        } catch (e) {
          payload = text;
        }
      } else {
        payload = text;
      }
    }

    if (!response.ok) {
      const message =
        (payload && typeof payload === "object" && payload.message) ||
        (typeof payload === "string" && payload) ||
        "Ocurrio un problema al comunicarse con el backend.";

      const error = new Error(message);
      error.response = response;
      error.payload = payload;
      throw error;
    }

    return payload;
  }

  window.VoleyApi = {
    init,
    get origin() {
      return getOrigin();
    },
    get baseUrl() {
      return getBaseUrl();
    },
    fetchJson,
  };
})();
