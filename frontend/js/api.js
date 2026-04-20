window.VoleyApi = {
  origin: (() => {
    const meta = document.querySelector('meta[name="voley-api-origin"]');
    return meta?.content?.trim() || window.location.origin;
  })(),

  get baseUrl() {
    return `${this.origin.replace(/\/+$|\/$/, '')}/api`;
  },

  get token() {
    return localStorage.getItem('voley_token') || '';
  },

  set token(value) {
    if (value) {
      localStorage.setItem('voley_token', value);
    } else {
      localStorage.removeItem('voley_token');
    }
  },

  get username() {
    return localStorage.getItem('voley_username') || '';
  },

  set username(value) {
    localStorage.setItem('voley_username', value || 'Administrador');
  },

  isAuthenticated() {
    return !!this.token;
  },

  login(username, password) {
    return this.fetchJson('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }).then((response) => {
      if (response.status === 'ok') {
        // El backend retorna el JWT real en el campo 'token'
        this.token = response.token;
        this.username = response.nombre || response.username || username;
        return response;
      }
      throw new Error(response.message || 'Credenciales incorrectas');
    });
  },

  logout() {
    this.token = '';
    localStorage.removeItem('voley_username');
    window.location.href = 'login.html';
  },

  async fetchJson(endpoint, options = {}) {
    const url = `${this.baseUrl.replace(/\/+$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.logout();
      throw new Error('Sesión expirada. Redirigiendo a login.');
    }

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = payload.message || payload.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(message);
    }

    return payload;
  },
};
