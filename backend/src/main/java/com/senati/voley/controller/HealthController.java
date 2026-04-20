package com.senati.voley.controller;

import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("")
@CrossOrigin(origins = "*")
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("app", "Voley Playa Diloz");

        try (Connection conn = dataSource.getConnection()) {
            response.put("database", "connected");
            response.put("db_url", conn.getMetaData().getURL());
        } catch (Exception e) {
            response.put("database", "disconnected");
            response.put("db_error", e.getMessage());
        }

        return response;
    }
}