package com.senati.voley.entitycancha;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cancha")
@Data
public class Cancha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_cancha;

    @Column(nullable = false)
    private String nombre; // Ejemplo: "Cancha Principal"

    @Column(nullable = false)
    private String tipo; // Ejemplo: "Arena" o "Sintético"
}