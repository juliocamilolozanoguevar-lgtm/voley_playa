package com.senati.voley.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalException {
    // Este método atrapa errores cuando algo no se encuentra (ej: una reserva que no existe)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> manejarErroresDeLogica(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    // Este método atrapa CUALQUIER otro error inesperado
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> manejarErrorGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error interno: El servidor tuvo un problema. Intente más tarde.");
    }
}

