package com.senati.voley.service;

import com.senati.voley.dto.ReservaDisponibilidadDTO;
import com.senati.voley.dto.ReservaRequest;
import com.senati.voley.entity.*;
import com.senati.voley.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

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

    public List<Reserva> listarPorFecha(LocalDate fecha) {
        if (fecha == null) {
            return listarTodas();
        }
        return reservaRepository.findByFecha(fecha);
    }

    public ReservaDisponibilidadDTO consultarDisponibilidad(Integer canchaId, LocalDate fecha,
                                                            LocalTime horaInicio, LocalTime horaFin) {
        ReservaDisponibilidadDTO dto = new ReservaDisponibilidadDTO();
        dto.setCanchaId(canchaId);
        dto.setFecha(fecha);
        dto.setHoraInicio(horaInicio);
        dto.setHoraFin(horaFin);

        List<Reserva> reservas = reservaRepository.findByCanchaAndFecha(canchaId, fecha);
        Set<String> ocupados = new LinkedHashSet<>();
        for (Reserva reserva : reservas) {
            LocalTime inicio = reserva.getHoraInicio();
            LocalTime fin = reserva.getHoraFin();
            while (!inicio.isAfter(fin.minusHours(1))) {
                ocupados.add(inicio.toString());
                inicio = inicio.plusHours(1);
            }
        }

        List<String> horariosLibres = new ArrayList<>();
        for (int hora = 8; hora < 22; hora++) {
            String slot = String.format("%02d:00", hora);
            if (!ocupados.contains(slot)) {
                horariosLibres.add(slot);
            }
        }

        dto.setHorariosOcupados(new ArrayList<>(ocupados));
        dto.setHorariosLibres(horariosLibres);

        List<Reserva> conflictos = reservaRepository.findConflictos(canchaId, fecha, horaInicio, horaFin);
        dto.setDisponible(conflictos.isEmpty());
        return dto;
    }

    @Transactional
    public Reserva registrarReserva(ReservaRequest request) {
        // Validar horario
        validarHorario(request.getHoraInicio(), request.getHoraFin());

        // Validar datos del cliente
        if (request.getClienteNombre() == null || request.getClienteNombre().isBlank()
                || request.getClienteApellido() == null || request.getClienteApellido().isBlank()) {
            throw new RuntimeException("El nombre y apellido del cliente son obligatorios");
        }

        // Buscar o crear cliente
        Cliente cliente = clienteRepository.findByDni(request.getClienteDni())
                .orElseGet(() -> {
                    Cliente nuevoCliente = new Cliente();
                    nuevoCliente.setDni(request.getClienteDni());
                    nuevoCliente.setNombre(request.getClienteNombre());
                    nuevoCliente.setApellido(request.getClienteApellido());
                    if (request.getClienteDni() != null) {
                        nuevoCliente.setCelular(request.getClienteDni());
                    }
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

        // Registrar pago si se indica un monto y se puede guardar en la base de datos
        if (request.getMonto() != null && request.getMonto() > 0) {
            Pago pago = new Pago();
            pago.setMonto(BigDecimal.valueOf(request.getMonto()));
            pago.setMetodoPago(request.getMetodoPago() != null ? request.getMetodoPago().trim() : "Desconocido");
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

        if (request.getMonto() != null && request.getMonto() > 0) {
            if (reservaGuardada.getPago() == null) {
                Pago pago = new Pago();
                pago.setMonto(BigDecimal.valueOf(request.getMonto()));
                pago.setMetodoPago(request.getMetodoPago() != null ? request.getMetodoPago().trim() : "Desconocido");
                pago.setReserva(reservaGuardada);
                pagoRepository.save(pago);
            } else {
                reservaGuardada.getPago().setMonto(BigDecimal.valueOf(request.getMonto()));
                reservaGuardada.getPago().setMetodoPago(request.getMetodoPago() != null ? request.getMetodoPago().trim() : reservaGuardada.getPago().getMetodoPago());
                pagoRepository.save(reservaGuardada.getPago());
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