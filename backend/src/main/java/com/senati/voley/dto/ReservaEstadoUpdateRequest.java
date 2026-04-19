package com.senati.voley.dto;

import java.math.BigDecimal;

public record ReservaEstadoUpdateRequest(
        String estadoReserva,
        BigDecimal adelanto
) {
}
