package com.senati.voley.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "nombre_admin", length = 100)
    private String nombreAdmin;

    // Constructores
    public Usuario() {}

    public Usuario(String username, String password, String nombreAdmin) {
        this.username = username;
        this.password = password;
        this.nombreAdmin = nombreAdmin;
    }

    // Getters y Setters
    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getNombreAdmin() { return nombreAdmin; }
    public void setNombreAdmin(String nombreAdmin) { this.nombreAdmin = nombreAdmin; }
}