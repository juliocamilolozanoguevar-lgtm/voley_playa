// js/api.js
window.VoleyApi = {
    // Asegúrate de que tu Spring Boot esté corriendo en el puerto 8080
    baseUrl: "http://localhost:8080/api", 

    async fetchJson(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    ...options.headers
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}: No se pudo conectar`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error en la petición API:", error);
            throw error;
        }
    }
};