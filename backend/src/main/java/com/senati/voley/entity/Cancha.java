package com.senati.voley.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "cancha")
public class Cancha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cancha")
    private Integer idCancha;

    @Column(name = "nombre_cancha", nullable = false, length = 50)
    private String nombreCancha;

    @Column(name = "descripcion", length = 200)
    private String descripcion;

    public Cancha() {
    }

    public Integer getIdCancha() {
        return idCancha;
    }

    public void setIdCancha(Integer idCancha) {
        this.idCancha = idCancha;
    }

    public String getNombreCancha() {
        return nombreCancha;
    }

    public void setNombreCancha(String nombreCancha) {
        this.nombreCancha = nombreCancha;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getNombreVisible() {
        return nombreCancha;
    }
}