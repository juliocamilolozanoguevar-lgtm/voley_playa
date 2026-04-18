package com.senati.voley.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Esto evita el error de conexión que ves en tu imagen
public class LoginController {

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> datos) {
        String user = datos.get("username");
        String pass = datos.get("password");

        Map<String, Object> respuesta = new HashMap<>();

        // Validación simple para tu proyecto SENATI
        if ("admin".equals(user) && "1234".equals(pass)) {
            respuesta.put("status", "ok");
            respuesta.put("nombre", "Julio Lozano"); // Este nombre irá al Dashboard
        } else {
            respuesta.put("status", "error");
        }

        return respuesta;
    }
}