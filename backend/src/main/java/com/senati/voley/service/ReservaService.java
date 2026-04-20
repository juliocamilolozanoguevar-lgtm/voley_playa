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

import java.math.BigDecimal;
import java.math.RoundingMode;
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
                .orElseThrow(() -> new ResourceNotFoundException("El cliente no existe."));

        Cancha cancha = canchaRepository.findById(request.idCancha())
                .orElseThrow(() -> new ResourceNotFoundException("La cancha no existe."));

        Reserva reserva = new Reserva();
        reserva.setFecha(request.fecha());
        reserva.setHoraInicio(request.horaInicio());
        reserva.setHoraFin(request.horaFin());
        reserva.setAdelanto(normalizarAdelanto(request.adelanto()));
        reserva.setCliente(cliente);
        reserva.setCancha(cancha);

        return reservaRepository.save(reserva);
    }

    public Reserva actualizarReserva(Integer id, ReservaRequest request) {
        validarReserva(request);

        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("La reserva no existe."));

        Cliente cliente = clienteRepository.findById(request.idCliente())
                .orElseThrow(() -> new ResourceNotFoundException("El cliente no existe."));

        Cancha cancha = canchaRepository.findById(request.idCancha())
                .orElseThrow(() -> new ResourceNotFoundException("La cancha no existe."));

        reserva.setFecha(request.fecha());
        reserva.setHoraInicio(request.horaInicio());
        reserva.setHoraFin(request.horaFin());
        reserva.setAdelanto(normalizarAdelanto(request.adelanto()));
        reserva.setCliente(cliente);
        reserva.setCancha(cancha);

        return reservaRepository.save(reserva);
    }

    public void eliminarReserva(Integer id) {
        if (!reservaRepository.existsById(id)) {
            throw new ResourceNotFoundException("La reserva no existe.");
        }

        reservaRepository.deleteById(id);
    }

    private void validarReserva(ReservaRequest request) {
        if (request.fecha() == null ||
                request.horaInicio() == null ||
                request.horaFin() == null ||
                request.idCliente() == null ||
                request.idCancha() == null) {

            throw new IllegalArgumentException("Completa todos los campos.");
        }

        if (!request.horaFin().isAfter(request.horaInicio())) {
            throw new IllegalArgumentException("La hora final debe ser mayor que la inicial.");
        }
    }

    private BigDecimal normalizarAdelanto(BigDecimal adelanto) {
        if (adelanto == null) {
            return BigDecimal.ZERO;
        }

        if (adelanto.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El adelanto no puede ser negativo.");
        }

        return adelanto.setScale(2, RoundingMode.HALF_UP);
    }
}