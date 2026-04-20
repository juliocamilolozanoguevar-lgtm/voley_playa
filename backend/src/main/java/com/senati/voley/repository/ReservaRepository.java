package com.senati.voley.repository;

import com.senati.voley.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Integer> {

    List<Reserva> findAllByOrderByFechaDescHoraInicioDesc();

    List<Reserva> findByFecha(LocalDate fecha);

    List<Reserva> findByClienteNombreContainingIgnoreCase(String nombre);
}