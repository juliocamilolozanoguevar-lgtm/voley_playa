package com.senati.voley.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "cliente") // Ajustado al nombre exacto de tu tabla
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // Coincide con el Integer de tu Controller

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    // CONSTRUCTOR VACÍO (Obligatorio para JPA)
    public Cliente() {}

    // GETTERS Y SETTERS
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }
}