package com.senati.voley.dto;

public record ReservaResumenDTO(
        Integer idReserva,
        String fecha,
        String horaInicio,
        String horaFin,
        String cliente,
        String cancha,
        String estado
) {
}
