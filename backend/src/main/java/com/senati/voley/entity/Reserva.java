package com.senati.voley.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "reserva")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reserva")
    private Integer idReserva;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @JsonFormat(pattern = "HH:mm:ss")
    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @JsonFormat(pattern = "HH:mm:ss")
    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Column(name = "adelanto", precision = 10, scale = 2)
    private BigDecimal adelanto;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_cancha", nullable = false)
    private Cancha cancha;

    public Reserva() {
    }

    public Integer getIdReserva() {
        return idReserva;
    }

    public void setIdReserva(Integer idReserva) {
        this.idReserva = idReserva;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(LocalTime horaFin) {
        this.horaFin = horaFin;
    }

    public BigDecimal getAdelanto() {
        return adelanto;
    }

    public void setAdelanto(BigDecimal adelanto) {
        this.adelanto = adelanto;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Cancha getCancha() {
        return cancha;
    }

    public void setCancha(Cancha cancha) {
        this.cancha = cancha;
    }
}