package com.senati.voley.service;

import com.senati.voley.dto.ReservaRequest;
import com.senati.voley.dto.ReservaEstadoUpdateRequest;
import com.senati.voley.entity.Cancha;
import com.senati.voley.entity.Cliente;
import com.senati.voley.entity.Reserva;
import com.senati.voley.exception.ResourceNotFoundException;
import com.senati.voley.repository.CanchaRepository;
import com.senati.voley.repository.ClienteRepository;
import com.senati.voley.repository.ReservaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class ReservaService {
    private static final Set<String> ESTADOS_VALIDOS = Set.of(
            "PAGADO",
            "CANCELADO",
            "PENDIENTE PAGO"
    );

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
        reserva.setEstadoReserva(normalizarEstado(request.estadoReserva()));
        reserva.setAdelanto(normalizarAdelanto(request.adelanto()));
        reserva.setCliente(cliente);
        reserva.setCancha(cancha);

        return reservaRepository.save(reserva);
    }

    public Reserva actualizarEstadoReserva(Integer id, ReservaEstadoUpdateRequest request) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("La reserva seleccionada no existe."));

        reserva.setEstadoReserva(normalizarEstado(request.estadoReserva()));
        reserva.setAdelanto(normalizarAdelanto(request.adelanto()));
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

        normalizarEstado(request.estadoReserva());
        normalizarAdelanto(request.adelanto());
    }

    private String normalizarEstado(String estadoReserva) {
        if (estadoReserva == null || estadoReserva.isBlank()) {
            return "PENDIENTE PAGO";
        }

        String estadoNormalizado = estadoReserva.trim().toUpperCase();
        if (!ESTADOS_VALIDOS.contains(estadoNormalizado)) {
            throw new IllegalArgumentException("El estado de reserva no es valido.");
        }
        return estadoNormalizado;
    }

    private BigDecimal normalizarAdelanto(BigDecimal adelanto) {
        if (adelanto == null) {
            return BigDecimal.ZERO;
        }

        if (adelanto.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El monto de adelanto no puede ser negativo.");
        }

        return adelanto.setScale(2, java.math.RoundingMode.HALF_UP);
    }
}
