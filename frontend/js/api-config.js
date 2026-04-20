// Configuración global para conectar el frontend con el backend Spring Boot.
window.VoleyApi = {
  origin: (() => {
    const meta = document.querySelector('meta[name="voley-api-origin"]');
    return meta?.content?.trim() || window.location.origin;
  })(),

  get baseUrl() {
    const origin = this.origin.replace(/\/+$/, '');
    return `${origin}/api`;
  },

  async init() {
    // Verifica que el backend esté disponible.
    await this.fetchJson('/health');
    return this;
  },

  async fetchJson(endpoint, options = {}) {
    const requestUrl = `${this.baseUrl.replace(/\/+$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(requestUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `Error ${response.status}: ${response.statusText}`;
      throw new Error(message);
    }

    return response.json();
  },
};
