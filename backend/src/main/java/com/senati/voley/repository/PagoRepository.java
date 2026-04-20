package com.senati.voley.repository;

import com.senati.voley.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Integer> {

    @Query("SELECT COALESCE(SUM(p.monto), 0) FROM Pago p WHERE DATE(p.fechaPago) = CURRENT_DATE")
    BigDecimal sumIngresosHoy();
}