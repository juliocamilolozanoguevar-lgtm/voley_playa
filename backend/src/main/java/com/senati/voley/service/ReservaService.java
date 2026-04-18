package com.senati.voley.service;

import com.senati.voley.entity.Reserva;
import com.senati.voley.reservarepository.ReservaRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;

    // Inyección por constructor (estilo gotagota)
    public ReservaService(ReservaRepository reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    public List<Reserva> listarTodas() {
        return reservaRepository.findAll();
    }

    public Optional<Reserva> buscarPorId(Integer id) {
        return reservaRepository.findById(id);
    }

    public Reserva registrarReserva(Reserva reserva) {
        // Al crearla, el estado inicial es 'Confirmada' por defecto [cite: 83]
        if (reserva.getEstado() == null) {
            reserva.setEstado("Confirmada");
        }
        return ReservaRepository.save(reserva);
    }

    public void eliminarReserva(Integer id) {
        reservaRepository.deleteById(id);
    }
}