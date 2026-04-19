package com.senati.voley.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservaRequest(
        LocalDate fecha,
        LocalTime horaInicio,
        LocalTime horaFin,
        Integer idCliente,
        Integer idCancha
) {
}
