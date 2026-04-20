package com.senati.voley.repository;

import com.senati.voley.entity.Cancha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CanchaRepository extends JpaRepository<Cancha, Integer> {

    Optional<Cancha> findByNombreCancha(String nombreCancha);
}