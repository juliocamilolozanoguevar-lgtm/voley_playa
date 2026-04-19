package com.senati.voley.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardSummaryDTO(
        BigDecimal ingresosMes,
        long reservasHoy,
        long horasOcupadasHoy,
        long canchasActivas,
        long clientesRegistrados,
        String diaMasReservas,
        String horaPico,
        DashboardReportSeriesDTO reportes,
        List<ReservaResumenDTO> reservasRecientes
) {
}
