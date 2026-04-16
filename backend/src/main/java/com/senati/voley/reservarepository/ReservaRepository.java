package com.senati.voley.reservarepository;

import com.senati.voley.entityreserva.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Integer> {
    // Proporciona métodos automáticos para buscar, guardar y eliminar [cite: 50]
}