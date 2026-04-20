package com.senati.voley.service;

import com.senati.voley.dto.DashboardSummaryDTO;
import com.senati.voley.repository.*;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final ReservaRepository reservaRepository;
    private final ClienteRepository clienteRepository;
    private final CanchaRepository canchaRepository;
    private final PagoRepository pagoRepository;

    public DashboardService(ReservaRepository reservaRepository,
                            ClienteRepository clienteRepository,
                            CanchaRepository canchaRepository,
                            PagoRepository pagoRepository) {
        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
        this.canchaRepository = canchaRepository;
        this.pagoRepository = pagoRepository;
    }

    public DashboardSummaryDTO obtenerResumen() {
        DashboardSummaryDTO dto = new DashboardSummaryDTO();

        dto.setTotalReservasHoy(reservaRepository.countReservasHoy());
        dto.setTotalClientes(clienteRepository.count());
        dto.setTotalCanchas(canchaRepository.count());
        dto.setIngresosHoy(pagoRepository.sumIngresosHoy());

        return dto;
    }
}