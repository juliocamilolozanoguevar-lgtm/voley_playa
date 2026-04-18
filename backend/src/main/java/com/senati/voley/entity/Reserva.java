package com.senati.voley.entity;

import com.senati.voley.entity.Cliente;
import com.senati.voley.entity.Cancha;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "reserva")
@Data
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_reserva; // [cite: 83]

    private LocalDate fecha; // [cite: 83]
    private LocalTime hora_inicio; // [cite: 83]
    private LocalTime hora_fin; // [cite: 83]

    @Column(length = 20)
    private String estado; // Valores: 'Confirmada', 'Cancelada' [cite: 83]

    @ManyToOne
    @JoinColumn(name = "id_cliente")
    private Cliente cliente; // Relación con Cliente [cite: 83]

    @ManyToOne
    @JoinColumn(name = "id_cancha")
    private Cancha cancha; // Relación con Cancha [cite: 83]
}