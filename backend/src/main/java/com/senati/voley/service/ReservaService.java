package com.senati.voley.service;

import com.senati.voley.dto.ReservaRequest;
import com.senati.voley.entity.*;
import com.senati.voley.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final ClienteRepository clienteRepository;
    private final CanchaRepository canchaRepository;
    private final PagoRepository pagoRepository;

    public ReservaService(ReservaRepository reservaRepository,
                          ClienteRepository clienteRepository,
                          CanchaRepository canchaRepository,
                          PagoRepository pagoRepository) {
        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
        this.canchaRepository = canchaRepository;
        this.pagoRepository = pagoRepository;
    }

    public List<Reserva> listarTodas() {
        return reservaRepository.findAll();
    }

    @Transactional
    public Reserva registrarReserva(ReservaRequest request) {
        // Validar horario
        validarHorario(request.getHoraInicio(), request.getHoraFin());

        // Buscar o crear cliente
        Cliente cliente = clienteRepository.findByDni(request.getClienteDni())
                .orElseGet(() -> {
                    Cliente nuevoCliente = new Cliente();
                    nuevoCliente.setDni(request.getClienteDni());
                    nuevoCliente.setNombre(request.getClienteNombre());
                    nuevoCliente.setApellido(request.getClienteApellido());
                    return clienteRepository.save(nuevoCliente);
                });

        // Validar cancha
        Cancha cancha = canchaRepository.findById(request.getCanchaId())
                .orElseThrow(() -> new RuntimeException("Cancha no encontrada"));

        // Validar disponibilidad
        validarDisponibilidad(cancha.getIdCancha(), request.getFecha(),
                request.getHoraInicio(), request.getHoraFin());

        // Crear reserva
        Reserva reserva = new Reserva();
        reserva.setFecha(request.getFecha());
        reserva.setHoraInicio(request.getHoraInicio());
        reserva.setHoraFin(request.getHoraFin());
        reserva.setCliente(cliente);
        reserva.setCancha(cancha);
        reserva.setEstado(request.getEstado() != null ? request.getEstado().trim().toUpperCase() : "PENDIENTE");

        Reserva reservaGuardada = reservaRepository.save(reserva);

        // Registrar pago solo si el estado es PAGADO y hay monto válido
        if ("PAGADO".equalsIgnoreCase(reservaGuardada.getEstado())
                && request.getMonto() != null && request.getMonto() > 0) {
            Pago pago = new Pago();
            pago.setMonto(BigDecimal.valueOf(request.getMonto()));
            pago.setReserva(reservaGuardada);
            pagoRepository.save(pago);
        }

        return reservaGuardada;
    }

    @Transactional
    public Reserva actualizarReserva(Integer id, ReservaRequest request) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        validarHorario(request.getHoraInicio(), request.getHoraFin());

        Cancha cancha = canchaRepository.findById(request.getCanchaId())
                .orElseThrow(() -> new RuntimeException("Cancha no encontrada"));

        List<Reserva> conflictos = reservaRepository.findConflictos(
                cancha.getIdCancha(), request.getFecha(), request.getHoraInicio(), request.getHoraFin());
        conflictos.removeIf(r -> r.getIdReserva().equals(id));
        if (!conflictos.isEmpty()) {
            throw new RuntimeException("La cancha no está disponible en ese horario");
        }

        reserva.setFecha(request.getFecha());
        reserva.setHoraInicio(request.getHoraInicio());
        reserva.setHoraFin(request.getHoraFin());
        reserva.setCancha(cancha);
        reserva.setEstado(request.getEstado() != null ? request.getEstado().trim().toUpperCase() : reserva.getEstado());

        Reserva reservaGuardada = reservaRepository.save(reserva);

        if ("PAGADO".equalsIgnoreCase(reservaGuardada.getEstado())
                && request.getMonto() != null && request.getMonto() > 0) {
            if (reservaGuardada.getPago() == null) {
                Pago pago = new Pago();
                pago.setMonto(BigDecimal.valueOf(request.getMonto()));
                pago.setReserva(reservaGuardada);
                pagoRepository.save(pago);
            }
        }

        return reservaGuardada;
    }

    @Transactional
    public void eliminarReserva(Integer id) {
        reservaRepository.deleteById(id);
    }

    private void validarHorario(LocalTime inicio, LocalTime fin) {
        if (inicio.isAfter(fin)) {
            throw new RuntimeException("La hora de inicio debe ser menor a la hora de fin");
        }

        long duracion = java.time.Duration.between(inicio, fin).toHours();
        if (duracion < 1) {
            throw new RuntimeException("La reserva debe durar al menos 1 hora");
        }

        if (inicio.isBefore(LocalTime.of(8, 0)) || fin.isAfter(LocalTime.of(22, 0))) {
            throw new RuntimeException("El horario de reserva es de 8:00 AM a 10:00 PM");
        }
    }

    private void validarDisponibilidad(Integer canchaId, java.time.LocalDate fecha,
                                       LocalTime horaInicio, LocalTime horaFin) {
        List<Reserva> conflictos = reservaRepository.findConflictos(
                canchaId, fecha, horaInicio, horaFin);

        if (!conflictos.isEmpty()) {
            throw new RuntimeException("La cancha no está disponible en ese horario");
        }
    }
}