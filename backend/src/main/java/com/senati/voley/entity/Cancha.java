package com.senati.voley.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cancha")
@Data
@NoArgsConstructor
public class Cancha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cancha")
    private Integer idCancha;

    @Column(name = "nombre_cancha", nullable = false, length = 50)
    private String nombreCancha;

    @Column(name = "descripcion", length = 200)
    private String descripcion;
}
