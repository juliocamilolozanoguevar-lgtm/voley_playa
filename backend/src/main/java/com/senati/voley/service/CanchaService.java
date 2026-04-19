package com.senati.voley.service;

import com.senati.voley.entity.Cancha;
import com.senati.voley.repository.CanchaRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CanchaService {

    private final CanchaRepository canchaRepository;

    public CanchaService(CanchaRepository canchaRepository) {
        this.canchaRepository = canchaRepository;
    }

    public List<Cancha> listarTodas() {
        return canchaRepository.findAll(Sort.by(Sort.Direction.ASC, "idCancha"));
    }
}
