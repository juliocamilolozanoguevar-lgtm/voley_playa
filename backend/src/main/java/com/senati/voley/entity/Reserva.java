package com.senati.voley.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalTime;
import java.math.BigDecimal;

@Entity
@Table(name = "reserva")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reserva")
    private Integer idReserva;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @ManyToOne
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "id_cancha", nullable = false)
    private Cancha cancha;

    @Column(name = "estado_reserva", nullable = false, length = 30)
    private String estadoReserva;

    @Column(name = "adelanto", precision = 10, scale = 2)
    private BigDecimal adelanto;

    @Column(name = "estado", length = 20)
    private String estado;

    @OneToOne(mappedBy = "reserva", cascade = CascadeType.ALL)
    private Pago pago;

    public Reserva() {
    }

    public Reserva(LocalDate fecha, LocalTime horaInicio, LocalTime horaFin, Cliente cliente, Cancha cancha) {
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.cliente = cliente;
        this.cancha = cancha;
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

    public Pago getPago() {
        return pago;
    }

    public void setPago(Pago pago) {
        this.pago = pago;
    }

    public String getEstadoReserva() {
        return estadoReserva;
    }

    public void setEstadoReserva(String estadoReserva) {
        this.estadoReserva = estadoReserva;
    }

    public BigDecimal getAdelanto() {
        return adelanto;
    }

    public void setAdelanto(BigDecimal adelanto) {
        this.adelanto = adelanto;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
