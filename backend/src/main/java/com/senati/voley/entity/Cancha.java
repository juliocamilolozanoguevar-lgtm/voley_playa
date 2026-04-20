package com.senati.voley.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

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

    @OneToMany(mappedBy = "cancha")
    private List<Reserva> reservas = new ArrayList<>();

    // Constructores
    public Cancha() {}

    public Cancha(String nombreCancha, String descripcion) {
        this.nombreCancha = nombreCancha;
        this.descripcion = descripcion;
    }

    // Getters y Setters
    public Integer getIdCancha() { return idCancha; }
    public void setIdCancha(Integer idCancha) { this.idCancha = idCancha; }

    public String getNombreCancha() { return nombreCancha; }
    public void setNombreCancha(String nombreCancha) { this.nombreCancha = nombreCancha; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public List<Reserva> getReservas() { return reservas; }
    public void setReservas(List<Reserva> reservas) { this.reservas = reservas; }
}