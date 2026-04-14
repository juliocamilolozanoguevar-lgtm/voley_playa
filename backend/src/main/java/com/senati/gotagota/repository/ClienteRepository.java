package com.senati.gotagota.repository;

// IMPORTAMOS LOS DRIVERS, METODOS
import com.senati.gotagota.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

//Anotacion @repository INTERFAZ COMO LA CAPA DE ACCESO A LA BASE DE DATOS
@Repository

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    //No necesitamos escribir nada aqui
    // JpaRepository ya tiene_todo_lo_basico

}
