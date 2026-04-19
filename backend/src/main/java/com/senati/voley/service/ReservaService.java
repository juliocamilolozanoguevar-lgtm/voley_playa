package com.senati.voley.service;

import com.senati.voley.dto.ReservaRequest;
import com.senati.voley.entity.Cancha;
import com.senati.voley.entity.Cliente;
import com.senati.voley.entity.Reserva;
import com.senati.voley.exception.ResourceNotFoundException;
import com.senati.voley.repository.CanchaRepository;
import com.senati.voley.repository.ClienteRepository;
import com.senati.voley.repository.ReservaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final ClienteRepository clienteRepository;
    private final CanchaRepository canchaRepository;

    public ReservaService(
            ReservaRepository reservaRepository,
            ClienteRepository clienteRepository,
            CanchaRepository canchaRepository
    ) {
        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
        this.canchaRepository = canchaRepository;
    }

    public List<Reserva> listarTodas() {
        return reservaRepository.findAllByOrderByFechaDescHoraInicioDesc();
    }

    public Optional<Reserva> buscarPorId(Integer id) {
        return reservaRepository.findById(id);
    }

    public Reserva registrarReserva(ReservaRequest request) {
        validarReserva(request);

        Cliente cliente = clienteRepository.findById(request.idCliente())
                .orElseThrow(() -> new ResourceNotFoundException("El cliente seleccionado no existe."));

        Cancha cancha = canchaRepository.findById(request.idCancha())
                .orElseThrow(() -> new ResourceNotFoundException("La cancha seleccionada no existe."));

        Reserva reserva = new Reserva();
        reserva.setFecha(request.fecha());
        reserva.setHoraInicio(request.horaInicio());
        reserva.setHoraFin(request.horaFin());
        reserva.setCliente(cliente);
        reserva.setCancha(cancha);

        return reservaRepository.save(reserva);
    }

    public void eliminarReserva(Integer id) {
        reservaRepository.deleteById(id);
    }

    private void validarReserva(ReservaRequest request) {
        if (request.fecha() == null
                || request.horaInicio() == null
                || request.horaFin() == null
                || request.idCliente() == null
                || request.idCancha() == null) {
            throw new IllegalArgumentException("Completa todos los campos de la reserva.");
        }

        if (!request.horaFin().isAfter(request.horaInicio())) {
            throw new IllegalArgumentException("La hora final debe ser mayor que la hora inicial.");
        }
    }
}
