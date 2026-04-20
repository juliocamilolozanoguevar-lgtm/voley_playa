package com.senati.voley.controller;

import com.senati.voley.entity.Cancha;
import com.senati.voley.service.CanchaService;
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
}