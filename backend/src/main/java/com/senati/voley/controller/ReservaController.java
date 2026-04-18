package com.senati.voley.controller;

import com.senati.voley.entity.Reserva;
import com.senati.voley.service.ReservaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/reservas")
@CrossOrigin(origins = "*") // Permite la conexión con tu interfaz dinámica [cite: 47]
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    // CONSULTA: Listar historial completo
    @GetMapping
    public List<Reserva> listar() {
        return reservaService.listarTodas();
    }

    // CONSULTA: Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<Reserva> buscar(@PathVariable Integer id) {
        return reservaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // REGISTRO: Crear nueva reserva
    @PostMapping
    public ResponseEntity<Reserva> registrar(@RequestBody Reserva reserva) {
        return ResponseEntity.ok(reservaService.registrarReserva(reserva));
    }

    // ELIMINACIÓN: Cancelar o eliminar reserva
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        reservaService.eliminarReserva(id);
        return ResponseEntity.noContent().build();
    }
}