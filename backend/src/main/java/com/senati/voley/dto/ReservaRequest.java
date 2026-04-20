package com.senati.voley.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class ReservaRequest {
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private String clienteDni;
    private String clienteNombre;
    private String clienteApellido;
    private Integer canchaId;
    private Double monto;

    // Getters y Setters
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }

    public LocalTime getHoraFin() { return horaFin; }
    public void setHoraFin(LocalTime horaFin) { this.horaFin = horaFin; }

    public String getClienteDni() { return clienteDni; }
    public void setClienteDni(String clienteDni) { this.clienteDni = clienteDni; }

    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }

    public String getClienteApellido() { return clienteApellido; }
    public void setClienteApellido(String clienteApellido) { this.clienteApellido = clienteApellido; }

    public Integer getCanchaId() { return canchaId; }
    public void setCanchaId(Integer canchaId) { this.canchaId = canchaId; }

    public Double getMonto() { return monto; }
    public void setMonto(Double monto) { this.monto = monto; }
}