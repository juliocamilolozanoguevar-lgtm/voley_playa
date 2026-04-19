package com.senati.voley.service;

import com.senati.voley.dto.DashboardChartItem;
import com.senati.voley.dto.DashboardReportSeriesDTO;
import com.senati.voley.dto.DashboardSummaryDTO;
import com.senati.voley.dto.ReservaResumenDTO;
import com.senati.voley.entity.Pago;
import com.senati.voley.entity.Reserva;
import com.senati.voley.repository.CanchaRepository;
import com.senati.voley.repository.ClienteRepository;
import com.senati.voley.repository.PagoRepository;
import com.senati.voley.repository.ReservaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.WeekFields;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;

@Service
public class DashboardService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");
    private static final List<DayOfWeek> DAY_ORDER = List.of(
            DayOfWeek.MONDAY,
            DayOfWeek.TUESDAY,
            DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY,
            DayOfWeek.FRIDAY,
            DayOfWeek.SATURDAY,
            DayOfWeek.SUNDAY
    );

    private final ReservaRepository reservaRepository;
    private final ClienteRepository clienteRepository;
    private final CanchaRepository canchaRepository;
    private final PagoRepository pagoRepository;

    public DashboardService(
            ReservaRepository reservaRepository,
            ClienteRepository clienteRepository,
            CanchaRepository canchaRepository,
            PagoRepository pagoRepository
    ) {
        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
        this.canchaRepository = canchaRepository;
        this.pagoRepository = pagoRepository;
    }

    public DashboardSummaryDTO obtenerResumen() {
        List<Reserva> reservas = reservaRepository.findAllByOrderByFechaDescHoraInicioDesc();
        LocalDate hoy = LocalDate.now();
        YearMonth mesActual = YearMonth.now();

        long reservasHoy = reservas.stream()
                .filter(reserva -> hoy.equals(reserva.getFecha()))
                .count();

        long horasOcupadasHoy = reservas.stream()
                .filter(reserva -> hoy.equals(reserva.getFecha()))
                .mapToLong(this::calcularHoras)
                .sum();

        BigDecimal ingresosMes = pagoRepository.findAll().stream()
                .filter(pago -> pago.getFechaPago() != null && YearMonth.from(pago.getFechaPago()).equals(mesActual))
                .map(Pago::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        DashboardReportSeriesDTO reportes = new DashboardReportSeriesDTO(
                construirReservasPorDia(reservas),
                construirReservasPorSemana(reservas),
                construirReservasPorMes(reservas)
        );
        String diaMasReservas = obtenerDiaMasReservas(reportes.dias());
        String horaPico = obtenerHoraPico(reservas);

        List<ReservaResumenDTO> reservasRecientes = reservas.stream()
                .limit(8)
                .map(this::mapearReservaResumen)
                .toList();

        return new DashboardSummaryDTO(
                ingresosMes,
                reservasHoy,
                horasOcupadasHoy,
                canchaRepository.count(),
                clienteRepository.count(),
                diaMasReservas,
                horaPico,
                reportes,
                reservasRecientes
        );
    }

    private List<DashboardChartItem> construirReservasPorDia(List<Reserva> reservas) {
        Map<DayOfWeek, Long> contador = new EnumMap<>(DayOfWeek.class);
        DAY_ORDER.forEach(day -> contador.put(day, 0L));

        reservas.forEach(reserva -> {
            DayOfWeek dia = reserva.getFecha().getDayOfWeek();
            contador.put(dia, contador.getOrDefault(dia, 0L) + 1);
        });

        List<DashboardChartItem> items = new ArrayList<>();
        DAY_ORDER.forEach(day -> items.add(new DashboardChartItem(etiquetaDia(day), contador.getOrDefault(day, 0L))));
        return items;
    }

    private List<DashboardChartItem> construirReservasPorSemana(List<Reserva> reservas) {
        LocalDate hoy = LocalDate.now();
        WeekFields weekFields = WeekFields.of(Locale.getDefault());
        Map<String, Long> contador = new LinkedHashMap<>();

        for (int offset = 5; offset >= 0; offset--) {
            LocalDate fecha = hoy.minusWeeks(offset);
            int semana = fecha.get(weekFields.weekOfWeekBasedYear());
            contador.put("Sem " + semana, 0L);
        }

        reservas.forEach(reserva -> {
            if (reserva.getFecha() == null) {
                return;
            }

            LocalDate fecha = reserva.getFecha();
            if (fecha.isBefore(hoy.minusWeeks(5))) {
                return;
            }

            String etiqueta = "Sem " + fecha.get(weekFields.weekOfWeekBasedYear());
            if (contador.containsKey(etiqueta)) {
                contador.put(etiqueta, contador.get(etiqueta) + 1);
            }
        });

        return contador.entrySet().stream()
                .map(entry -> new DashboardChartItem(entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<DashboardChartItem> construirReservasPorMes(List<Reserva> reservas) {
        LocalDate hoy = LocalDate.now();
        Map<YearMonth, Long> contador = new LinkedHashMap<>();

        for (int offset = 5; offset >= 0; offset--) {
            YearMonth mes = YearMonth.from(hoy.minusMonths(offset));
            contador.put(mes, 0L);
        }

        reservas.forEach(reserva -> {
            if (reserva.getFecha() == null) {
                return;
            }

            YearMonth mes = YearMonth.from(reserva.getFecha());
            if (contador.containsKey(mes)) {
                contador.put(mes, contador.get(mes) + 1);
            }
        });

        return contador.entrySet().stream()
                .map(entry -> new DashboardChartItem(etiquetaMes(entry.getKey()), entry.getValue()))
                .toList();
    }

    private String obtenerDiaMasReservas(List<DashboardChartItem> reservasPorDia) {
        return reservasPorDia.stream()
                .reduce((actual, siguiente) -> siguiente.total() > actual.total() ? siguiente : actual)
                .filter(item -> item.total() > 0)
                .map(DashboardChartItem::label)
                .orElse("Sin datos");
    }

    private String obtenerHoraPico(List<Reserva> reservas) {
        int[] horas = new int[24];

        reservas.forEach(reserva -> {
            if (reserva.getHoraInicio() == null || reserva.getHoraFin() == null) {
                return;
            }

            int inicio = reserva.getHoraInicio().getHour();
            int fin = reserva.getHoraFin().getMinute() > 0
                    ? reserva.getHoraFin().getHour()
                    : reserva.getHoraFin().getHour() - 1;

            for (int hora = inicio; hora <= Math.max(inicio, fin); hora++) {
                if (hora >= 0 && hora < horas.length) {
                    horas[hora]++;
                }
            }
        });

        int horaPico = -1;
        int maximo = 0;
        for (int i = 0; i < horas.length; i++) {
            if (horas[i] > maximo) {
                maximo = horas[i];
                horaPico = i;
            }
        }

        if (horaPico < 0) {
            return "Sin datos";
        }

        String horaFin = horaPico == 23 ? "24:00" : String.format("%02d:00", horaPico + 1);
        return String.format("%02d:00 - %s", horaPico, horaFin);
    }

    private ReservaResumenDTO mapearReservaResumen(Reserva reserva) {
        String cliente = reserva.getCliente() == null
                ? "Cliente anonimo"
                : String.format("%s %s", valor(reserva.getCliente().getNombre()), valor(reserva.getCliente().getApellido())).trim();

        String cancha = reserva.getCancha() == null
                ? "Sin cancha"
                : valor(reserva.getCancha().getNombreCancha());

        return new ReservaResumenDTO(
                reserva.getIdReserva(),
                reserva.getFecha().format(DATE_FORMAT),
                reserva.getHoraInicio().format(TIME_FORMAT),
                reserva.getHoraFin().format(TIME_FORMAT),
                cliente.isBlank() ? "Sin cliente" : cliente,
                cancha,
                resolverEstado(reserva)
        );
    }

    private long calcularHoras(Reserva reserva) {
        if (reserva.getHoraInicio() == null || reserva.getHoraFin() == null) {
            return 0;
        }

        int inicio = reserva.getHoraInicio().getHour() * 60 + reserva.getHoraInicio().getMinute();
        int fin = reserva.getHoraFin().getHour() * 60 + reserva.getHoraFin().getMinute();
        if (fin <= inicio) {
            return 0;
        }

        return Math.round((fin - inicio) / 60.0);
    }

    private String etiquetaDia(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> "Lun";
            case TUESDAY -> "Mar";
            case WEDNESDAY -> "Mie";
            case THURSDAY -> "Jue";
            case FRIDAY -> "Vie";
            case SATURDAY -> "Sab";
            case SUNDAY -> "Dom";
        };
    }

    private String etiquetaMes(YearMonth mes) {
        return switch (mes.getMonth()) {
            case JANUARY -> "Ene";
            case FEBRUARY -> "Feb";
            case MARCH -> "Mar";
            case APRIL -> "Abr";
            case MAY -> "May";
            case JUNE -> "Jun";
            case JULY -> "Jul";
            case AUGUST -> "Ago";
            case SEPTEMBER -> "Sep";
            case OCTOBER -> "Oct";
            case NOVEMBER -> "Nov";
            case DECEMBER -> "Dic";
        };
    }

    private String resolverEstado(Reserva reserva) {
        if (reserva.getEstadoReserva() != null && !reserva.getEstadoReserva().isBlank()) {
            return reserva.getEstadoReserva();
        }
        return "PENDIENTE PAGO";
    }

    private String valor(String texto) {
        return texto == null ? "" : texto;
    }
}
