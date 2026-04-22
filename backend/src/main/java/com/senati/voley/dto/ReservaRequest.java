package com.senati.voley.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;

public class ReservaRequest {
    
    @NotNull(message = "La fecha es obligatoria")
    @FutureOrPresent(message = "La fecha debe ser hoy o futura")
    private LocalDate fecha;
    
    @NotNull(message = "La hora de inicio es obligatoria")
    private LocalTime horaInicio;
    
    @NotNull(message = "La hora de fin es obligatoria")
    private LocalTime horaFin;
    
    @NotBlank(message = "El DNI del cliente es obligatorio")
    @Size(min = 8, max = 8, message = "El DNI debe tener 8 dígitos")
    private String clienteDni;
    
    @NotBlank(message = "El nombre del cliente es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    private String clienteNombre;
    
    @NotBlank(message = "El apellido del cliente es obligatorio")
    @Size(min = 2, max = 100, message = "El apellido debe tener entre 2 y 100 caracteres")
    private String clienteApellido;
    
    @NotNull(message = "El ID de la cancha es obligatorio")
    private Integer canchaId;
    
    @Positive(message = "El monto debe ser mayor a 0")
    private Double monto;
    
    private String estado;

    private String estadoReserva;
    
    private String metodoPago;

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

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getEstadoReserva() { return estadoReserva; }
    public void setEstadoReserva(String estadoReserva) { this.estadoReserva = estadoReserva; }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
}
