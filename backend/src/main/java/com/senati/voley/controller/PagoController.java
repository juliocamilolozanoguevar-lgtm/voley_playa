package com.senati.voley.controller;

import com.senati.voley.entity.Pago;
import com.senati.voley.repository.PagoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pagos")
public class PagoController {

    private final PagoRepository pagoRepository;

    public PagoController(PagoRepository pagoRepository) {
        this.pagoRepository = pagoRepository;
    }

    @GetMapping
    public List<Pago> listar() {
        return pagoRepository.findAll();
    }
}
