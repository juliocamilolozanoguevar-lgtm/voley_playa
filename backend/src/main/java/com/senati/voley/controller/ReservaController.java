package com.senati.voley.controller;

import com.senati.voley.dto.ReservaRequest;
import com.senati.voley.entity.Reserva;
import com.senati.voley.service.ReservaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/{id}")
    public ResponseEntity<Reserva> buscar(@PathVariable Integer id) {
        return reservaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Reserva> registrar(@RequestBody ReservaRequest request) {
        return ResponseEntity.ok(reservaService.registrarReserva(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reserva> actualizar(
            @PathVariable Integer id,
            @RequestBody ReservaRequest request
    ) {
        return ResponseEntity.ok(reservaService.actualizarReserva(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        reservaService.eliminarReserva(id);
        return ResponseEntity.noContent().build();
    }
}