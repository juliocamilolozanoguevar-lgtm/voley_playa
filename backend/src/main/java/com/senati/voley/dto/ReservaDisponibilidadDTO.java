package com.senati.voley.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class ReservaDisponibilidadDTO {
    private Integer canchaId;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private boolean disponible;
    private List<String> horariosOcupados;
    private List<String> horariosLibres;

    public Integer getCanchaId() {
        return canchaId;
    }

    public void setCanchaId(Integer canchaId) {
        this.canchaId = canchaId;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(LocalTime horaFin) {
        this.horaFin = horaFin;
    }

    public boolean isDisponible() {
        return disponible;
    }

    public void setDisponible(boolean disponible) {
        this.disponible = disponible;
    }

    public List<String> getHorariosOcupados() {
        return horariosOcupados;
    }

    public void setHorariosOcupados(List<String> horariosOcupados) {
        this.horariosOcupados = horariosOcupados;
    }

    public List<String> getHorariosLibres() {
        return horariosLibres;
    }

    public void setHorariosLibres(List<String> horariosLibres) {
        this.horariosLibres = horariosLibres;
    }
}
