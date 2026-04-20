package com.senati.voley.controller;

import com.senati.voley.dto.ReservaRequest;
import com.senati.voley.entity.Reserva;
import com.senati.voley.service.ReservaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @GetMapping
    public List<Reserva> listar() {
        return reservaService.listarTodas();
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        reservaService.eliminarReserva(id);
        return ResponseEntity.noContent().build();
    }
}