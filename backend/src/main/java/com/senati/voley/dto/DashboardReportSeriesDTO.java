package com.senati.voley.dto;

import java.util.List;

public record DashboardReportSeriesDTO(
        List<DashboardChartItem> dias,
        List<DashboardChartItem> semanas,
        List<DashboardChartItem> meses
) {
}
