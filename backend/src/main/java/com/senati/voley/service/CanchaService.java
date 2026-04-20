package com.senati.voley.service;

import com.senati.voley.entity.Cancha;
import com.senati.voley.exception.ResourceNotFoundException;
import com.senati.voley.repository.CanchaRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CanchaService {

    private final CanchaRepository canchaRepository;

    public CanchaService(CanchaRepository canchaRepository) {
        this.canchaRepository = canchaRepository;
    }

    public List<Cancha> listarTodas() {
        return canchaRepository.findAll(Sort.by(Sort.Direction.ASC, "idCancha"));
    }

    public Optional<Cancha> buscarPorId(Integer id) {
        return canchaRepository.findById(id);
    }

    public Cancha guardarCancha(Cancha cancha) {
        validarDatos(cancha);

        canchaRepository.findByNombreCancha(cancha.getNombreCancha().trim())
                .ifPresent(c -> {
                    throw new IllegalArgumentException("Ya existe una cancha con ese nombre.");
                });

        cancha.setNombreCancha(cancha.getNombreCancha().trim());

        if (cancha.getDescripcion() != null) {
            cancha.setDescripcion(cancha.getDescripcion().trim());
        }

        return canchaRepository.save(cancha);
    }

    public Cancha actualizarCancha(Integer id, Cancha datos) {
        validarDatos(datos);

        Cancha existente = canchaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("La cancha no existe."));

        canchaRepository.findByNombreCancha(datos.getNombreCancha().trim())
                .ifPresent(c -> {
                    if (!c.getIdCancha().equals(id)) {
                        throw new IllegalArgumentException("Ya existe otra cancha con ese nombre.");
                    }
                });

        existente.setNombreCancha(datos.getNombreCancha().trim());
        existente.setDescripcion(datos.getDescripcion() != null ? datos.getDescripcion().trim() : null);

        return canchaRepository.save(existente);
    }

    public void eliminarCancha(Integer id) {
        if (!canchaRepository.existsById(id)) {
            throw new ResourceNotFoundException("La cancha no existe.");
        }

        canchaRepository.deleteById(id);
    }

    private void validarDatos(Cancha cancha) {
        if (cancha.getNombreCancha() == null || cancha.getNombreCancha().isBlank()) {
            throw new IllegalArgumentException("Ingresa el nombre de la cancha.");
        }
    }
}