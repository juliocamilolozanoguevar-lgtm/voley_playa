package com.senati.voley.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("status", "ok");
        payload.put("app", "voley");

        try (Connection connection = dataSource.getConnection()) {
            payload.put("database", "connected");
            payload.put("url", connection.getMetaData().getURL());
        } catch (Exception ex) {
            payload.put("status", "error");
            payload.put("database", "disconnected");
            payload.put("message", "No se pudo conectar con la base de datos.");
        }

        return payload;
    }
}
