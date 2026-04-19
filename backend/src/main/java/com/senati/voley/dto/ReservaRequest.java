package com.senati.voley.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record ReservaRequest(
        LocalDate fecha,
        LocalTime horaInicio,
        LocalTime horaFin,
        String estadoReserva,
        BigDecimal adelanto,
        Integer idCliente,
        Integer idCancha
) {
}
