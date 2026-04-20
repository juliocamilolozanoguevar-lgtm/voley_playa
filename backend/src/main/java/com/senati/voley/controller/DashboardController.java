package com.senati.voley.controller;

import com.senati.voley.dto.DashboardSummaryDTO;
import com.senati.voley.service.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/resumen")
    public DashboardSummaryDTO obtenerResumen() {
        return dashboardService.obtenerResumen();
    }
}