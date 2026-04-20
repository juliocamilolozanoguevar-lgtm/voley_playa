package com.senati.voley.dto;

import java.math.BigDecimal;

public class DashboardSummaryDTO {
    private long totalReservasHoy;
    private long totalClientes;
    private long totalCanchas;
    private BigDecimal ingresosHoy;

    // Getters y Setters
    public long getTotalReservasHoy() { return totalReservasHoy; }
    public void setTotalReservasHoy(long totalReservasHoy) { this.totalReservasHoy = totalReservasHoy; }

    public long getTotalClientes() { return totalClientes; }
    public void setTotalClientes(long totalClientes) { this.totalClientes = totalClientes; }

    public long getTotalCanchas() { return totalCanchas; }
    public void setTotalCanchas(long totalCanchas) { this.totalCanchas = totalCanchas; }

    public BigDecimal getIngresosHoy() { return ingresosHoy; }
    public void setIngresosHoy(BigDecimal ingresosHoy) { this.ingresosHoy = ingresosHoy; }
}