package com.senati.voley.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "usuarios") // Asegúrate que tu tabla en MySQL se llame así
@Data // Si usas Lombok, si no, genera Getters y Setters manualmente
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
    private String nombre;
    private String rol;
}