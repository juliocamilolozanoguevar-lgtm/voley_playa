package com.senati.voley.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cliente")
@Data // Genera Getters, Setters y Constructores automáticamente si usas Lombok
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_cliente;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    // Si no usas Lombok, genera los Getters y Setters manualmente aquí
}