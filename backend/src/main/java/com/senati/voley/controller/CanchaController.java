package com.senati.voley.controller;

import com.senati.voley.entity.Cancha;
import com.senati.voley.service.CanchaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/canchas")
@CrossOrigin(origins = "*")
public class CanchaController {

    private final CanchaService canchaService;

    public CanchaController(CanchaService canchaService) {
        this.canchaService = canchaService;
    }

    @GetMapping
    public List<Cancha> listar() {
        return canchaService.listarTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cancha> buscarPorId(@PathVariable Integer id) {
        return canchaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Cancha> guardar(@RequestBody Cancha cancha) {
        return ResponseEntity.ok(canchaService.guardarCancha(cancha));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cancha> actualizar(
            @PathVariable Integer id,
            @RequestBody Cancha cancha
    ) {
        return ResponseEntity.ok(canchaService.actualizarCancha(id, cancha));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        canchaService.eliminarCancha(id);
        return ResponseEntity.noContent().build();
    }
}