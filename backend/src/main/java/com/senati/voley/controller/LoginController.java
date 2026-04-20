package com.senati.voley.controller;

import com.senati.voley.dto.LoginRequest;
import com.senati.voley.entity.Usuario;
import com.senati.voley.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("")
@CrossOrigin(origins = "*")
public class LoginController {

    private final UsuarioRepository usuarioRepository;

    public LoginController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        Map<String, Object> response = new HashMap<>();

        if (request.getUsername() == null || request.getUsername().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {
            response.put("status", "error");
            response.put("message", "Complete usuario y contraseña");
            return ResponseEntity.badRequest().body(response);
        }

        Optional<Usuario> usuarioDb = usuarioRepository.findByUsername(request.getUsername().trim());

        if (usuarioDb.isEmpty()) {
            response.put("status", "error");
            response.put("message", "Usuario no existe");
            return ResponseEntity.status(401).body(response);
        }

        Usuario usuario = usuarioDb.get();

        // Comparación directa (sin BCrypt por ahora)
        if (!usuario.getPassword().equals(request.getPassword())) {
            response.put("status", "error");
            response.put("message", "Contraseña incorrecta");
            return ResponseEntity.status(401).body(response);
        }

        response.put("status", "ok");
        response.put("message", "Login exitoso");
        response.put("nombre", usuario.getNombreAdmin() != null ? usuario.getNombreAdmin() : "Administrador");
        response.put("username", usuario.getUsername());

        return ResponseEntity.ok(response);
    }
}