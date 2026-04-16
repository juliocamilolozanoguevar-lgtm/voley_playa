package com.senati.voley.repository;

import com.senati.voley.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    // Aquí puedes agregar métodos personalizados si los necesitas después
}