package com.senati.voley.controller;

import com.senati.voley.dto.ReservaDisponibilidadDTO;
import com.senati.voley.dto.ReservaRequest;
import com.senati.voley.entity.Reserva;
import com.senati.voley.service.ReservaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @GetMapping
    public List<Reserva> listar(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return reservaService.listarPorFecha(fecha);
    }

    @GetMapping("/disponibilidad")
    public ReservaDisponibilidadDTO consultarDisponibilidad(
            @RequestParam Integer canchaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime horaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime horaFin) {
        return reservaService.consultarDisponibilidad(canchaId, fecha, horaInicio, horaFin);
    }

    @PostMapping
    public ResponseEntity<?> registrar(@RequestBody ReservaRequest request) {
        try {
            Reserva reserva = reservaService.registrarReserva(request);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody ReservaRequest request) {
        try {
            Reserva reserva = reservaService.actualizarReserva(id, request);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        reservaService.eliminarReserva(id);
        return ResponseEntity.noContent().build();
    }
}