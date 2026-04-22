package com.senati.voley.repository;

import com.senati.voley.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Integer> {

    List<Reserva> findByFecha(LocalDate fecha);

    List<Reserva> findByCliente_Dni(String dni);

    @Query("SELECT r FROM Reserva r WHERE r.cancha.idCancha = :canchaId " +
            "AND r.fecha = :fecha " +
            "AND r.horaInicio < :horaFin " +
            "AND r.horaFin > :horaInicio")
    List<Reserva> findConflictos(@Param("canchaId") Integer canchaId,
                                 @Param("fecha") LocalDate fecha,
                                 @Param("horaInicio") LocalTime horaInicio,
                                 @Param("horaFin") LocalTime horaFin);

    @Query("SELECT r FROM Reserva r WHERE r.cancha.idCancha = :canchaId AND r.fecha = :fecha")
    List<Reserva> findByCanchaAndFecha(@Param("canchaId") Integer canchaId,
                                       @Param("fecha") LocalDate fecha);

    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.fecha = CURRENT_DATE")
    Long countReservasHoy();
}
