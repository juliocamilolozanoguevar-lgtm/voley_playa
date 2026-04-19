(function () {
  const DEFAULT_PORT = "8080";
  const storedOrigin = window.localStorage.getItem("voleyApiOrigin");
  const metaOrigin = document
    .querySelector('meta[name="voley-api-origin"]')
    ?.getAttribute("content")
    ?.trim();
  const host = window.location.hostname || "localhost";
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const origin = (metaOrigin || storedOrigin || `${protocol}//${host}:${DEFAULT_PORT}`).replace(/\/+$/, "");
  const baseUrl = `${origin}/api`;

  async function fetchJson(path, options = {}) {
    const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
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
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

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
    origin,
    baseUrl,
    fetchJson,
  };
})();
