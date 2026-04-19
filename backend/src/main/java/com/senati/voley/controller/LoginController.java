package com.senati.voley.controller;

import com.senati.voley.dto.LoginRequest;
import com.senati.voley.entity.Usuario;
import com.senati.voley.repository.UsuarioRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class LoginController {

    private final UsuarioRepository usuarioRepository;

    public LoginController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest datos) {
        if (datos.username() == null || datos.username().isBlank()
                || datos.password() == null || datos.password().isBlank()) {
            return respuesta("error", "Completa usuario y contrasena.", null);
        }

        Optional<Usuario> usuarioDb = usuarioRepository.findByUsername(datos.username().trim());
        if (usuarioDb.isEmpty()) {
            return respuesta("error", "El usuario no existe en la base de datos.", null);
        }

        Usuario usuario = usuarioDb.get();
        if (!usuario.getPassword().equals(datos.password())) {
            return respuesta("error", "Contrasena incorrecta.", null);
        }

        return respuesta("ok", null, usuario.getNombreAdmin() == null || usuario.getNombreAdmin().isBlank()
                ? "Administrador"
                : usuario.getNombreAdmin());
    }

    private Map<String, Object> respuesta(String status, String message, String nombre) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("status", status);
        if (message != null) {
            payload.put("message", message);
        }
        if (nombre != null) {
            payload.put("nombre", nombre);
        }
        return payload;
    }
}
