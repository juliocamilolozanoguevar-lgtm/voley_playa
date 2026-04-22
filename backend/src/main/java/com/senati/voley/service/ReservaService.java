package com.senati.voley.service;

import com.senati.voley.dto.ReservaDisponibilidadDTO;
import com.senati.voley.dto.ReservaRequest;
import com.senati.voley.entity.Cancha;
import com.senati.voley.entity.Cliente;
import com.senati.voley.entity.Pago;
import com.senati.voley.entity.Reserva;
import com.senati.voley.repository.CanchaRepository;
import com.senati.voley.repository.ClienteRepository;
import com.senati.voley.repository.PagoRepository;
import com.senati.voley.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class ReservaService {
    private static final LocalTime HORA_APERTURA = LocalTime.of(8, 0);
    private static final LocalTime HORA_CIERRE = LocalTime.of(22, 0);
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

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
        return fecha == null ? listarTodas() : reservaRepository.findByFecha(fecha);
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
            LocalTime cursor = reserva.getHoraInicio();
            while (cursor.isBefore(reserva.getHoraFin())) {
                ocupados.add(cursor.format(TIME_FORMAT));
                cursor = cursor.plusMinutes(30);
            }
        }

        List<String> horariosLibres = new ArrayList<>();
        LocalTime slot = HORA_APERTURA;
        while (slot.isBefore(HORA_CIERRE)) {
            String slotValue = slot.format(TIME_FORMAT);
            if (!ocupados.contains(slotValue)) {
                horariosLibres.add(slotValue);
            }
            slot = slot.plusMinutes(30);
        }

        dto.setHorariosOcupados(new ArrayList<>(ocupados));
        dto.setHorariosLibres(horariosLibres);
        dto.setDisponible(horaInicio == null || horaFin == null
                || reservaRepository.findConflictos(canchaId, fecha, horaInicio, horaFin).isEmpty());
        return dto;
    }

    @Transactional
    public Reserva registrarReserva(ReservaRequest request) {
        validarDatosBase(request);

        Cliente cliente = obtenerORegistrarCliente(request);
        Cancha cancha = canchaRepository.findById(request.getCanchaId())
                .orElseThrow(() -> new RuntimeException("Cancha no encontrada"));

        validarDisponibilidad(cancha.getIdCancha(), request.getFecha(), request.getHoraInicio(), request.getHoraFin());

        Reserva reserva = new Reserva();
        reserva.setFecha(request.getFecha());
        reserva.setHoraInicio(request.getHoraInicio());
        reserva.setHoraFin(request.getHoraFin());
        reserva.setCliente(cliente);
        reserva.setCancha(cancha);
        reserva.setEstadoReserva(normalizarEstadoReserva(request.getEstadoReserva()));
        reserva.setEstado(normalizarEstado(request.getEstado()));
        if (request.getMonto() != null && request.getMonto() > 0) {
            reserva.setAdelanto(BigDecimal.valueOf(request.getMonto()));
        }

        Reserva reservaGuardada = reservaRepository.save(reserva);

        if (request.getMonto() != null && request.getMonto() > 0) {
            Pago pago = new Pago();
            pago.setMonto(BigDecimal.valueOf(request.getMonto()));
            pago.setReserva(reservaGuardada);
            pagoRepository.save(pago);
        }

        return reservaGuardada;
    }

    @Transactional
    public Reserva actualizarReserva(Integer id, ReservaRequest request) {
        validarDatosBase(request);

        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        Cliente cliente = obtenerORegistrarCliente(request);
        Cancha cancha = canchaRepository.findById(request.getCanchaId())
                .orElseThrow(() -> new RuntimeException("Cancha no encontrada"));

        List<Reserva> conflictos = reservaRepository.findConflictos(
                cancha.getIdCancha(), request.getFecha(), request.getHoraInicio(), request.getHoraFin());
        conflictos.removeIf(item -> item.getIdReserva().equals(id));
        if (!conflictos.isEmpty()) {
            throw new RuntimeException("La cancha no esta disponible en ese horario");
        }

        reserva.setFecha(request.getFecha());
        reserva.setHoraInicio(request.getHoraInicio());
        reserva.setHoraFin(request.getHoraFin());
        reserva.setCliente(cliente);
        reserva.setCancha(cancha);
        reserva.setEstadoReserva(normalizarEstadoReserva(request.getEstadoReserva()));
        reserva.setEstado(normalizarEstado(request.getEstado()));
        reserva.setAdelanto(request.getMonto() != null && request.getMonto() > 0
                ? BigDecimal.valueOf(request.getMonto())
                : null);

        Reserva reservaGuardada = reservaRepository.save(reserva);

        if (request.getMonto() != null && request.getMonto() > 0) {
            if (reservaGuardada.getPago() == null) {
                Pago pago = new Pago();
                pago.setMonto(BigDecimal.valueOf(request.getMonto()));
                pago.setReserva(reservaGuardada);
                pagoRepository.save(pago);
            } else {
                reservaGuardada.getPago().setMonto(BigDecimal.valueOf(request.getMonto()));
                pagoRepository.save(reservaGuardada.getPago());
            }
        }

        return reservaGuardada;
    }

    @Transactional
    public void eliminarReserva(Integer id) {
        reservaRepository.deleteById(id);
    }

    private void validarDatosBase(ReservaRequest request) {
        if (request.getFecha() == null || request.getHoraInicio() == null || request.getHoraFin() == null) {
            throw new RuntimeException("Complete fecha y horario");
        }

        if (request.getClienteDni() == null || request.getClienteDni().isBlank()
                || request.getClienteNombre() == null || request.getClienteNombre().isBlank()
                || request.getClienteApellido() == null || request.getClienteApellido().isBlank()) {
            throw new RuntimeException("Seleccione un cliente valido");
        }

        if (request.getCanchaId() == null) {
            throw new RuntimeException("Seleccione una cancha");
        }

        validarHorario(request.getHoraInicio(), request.getHoraFin());
    }

    private Cliente obtenerORegistrarCliente(ReservaRequest request) {
        return clienteRepository.findByDni(request.getClienteDni().trim())
                .orElseGet(() -> clienteRepository.save(
                        new Cliente(request.getClienteDni().trim(),
                                request.getClienteNombre().trim(),
                                request.getClienteApellido().trim())
                ));
    }

    private void validarHorario(LocalTime inicio, LocalTime fin) {
        if (!inicio.isBefore(fin)) {
            throw new RuntimeException("La hora de inicio debe ser menor a la hora de fin");
        }

        if (inicio.isBefore(HORA_APERTURA) || fin.isAfter(HORA_CIERRE)) {
            throw new RuntimeException("El horario de reserva es de 08:00 a 22:00");
        }
    }

    private void validarDisponibilidad(Integer canchaId, LocalDate fecha, LocalTime horaInicio, LocalTime horaFin) {
        if (!reservaRepository.findConflictos(canchaId, fecha, horaInicio, horaFin).isEmpty()) {
            throw new RuntimeException("La cancha no esta disponible en ese horario");
        }
    }

    private String normalizarEstadoReserva(String estadoReserva) {
        if (estadoReserva == null || estadoReserva.isBlank()) {
            return "RESERVADA";
        }
        return estadoReserva.trim().toUpperCase();
    }

    private String normalizarEstado(String estado) {
        if (estado == null || estado.isBlank()) {
            return "ACTIVA";
        }
        return estado.trim().toUpperCase();
    }
}
