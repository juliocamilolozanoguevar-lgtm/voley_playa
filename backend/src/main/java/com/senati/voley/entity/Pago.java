package com.senati.voley.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pago")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Integer idPago;

    @Column(name = "monto", nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    @OneToOne
    @JoinColumn(name = "id_reserva")
    private Reserva reserva;

    @PrePersist
    protected void onCreate() {
        if (fechaPago == null) {
            fechaPago = LocalDateTime.now();
        }
    }

    // Constructores
    public Pago() {}

    public Pago(BigDecimal monto, Reserva reserva) {
        this.monto = monto;
        this.reserva = reserva;
    }

    // Getters y Setters
    public Integer getIdPago() { return idPago; }
    public void setIdPago(Integer idPago) { this.idPago = idPago; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public LocalDateTime getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }

    public Reserva getReserva() { return reserva; }
    public void setReserva(Reserva reserva) { this.reserva = reserva; }
}