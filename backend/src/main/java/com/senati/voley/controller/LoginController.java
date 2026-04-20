package com.senati.voley.controller;

import com.senati.voley.dto.LoginRequest;
import com.senati.voley.entity.Usuario;
import com.senati.voley.repository.UsuarioRepository;
import com.senati.voley.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("")
public class LoginController {

    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public LoginController(UsuarioRepository usuarioRepository, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
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

        // Comparar contraseña con BCryptPasswordEncoder
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            response.put("status", "error");
            response.put("message", "Contraseña incorrecta");
            return ResponseEntity.status(401).body(response);
        }

        // Generar JWT real
        String token = jwtUtil.generateToken(usuario.getUsername());

        response.put("status", "ok");
        response.put("message", "Login exitoso");
        response.put("token", token);
        response.put("nombre", usuario.getNombreAdmin() != null ? usuario.getNombreAdmin() : "Administrador");
        response.put("username", usuario.getUsername());

        return ResponseEntity.ok(response);
    }
}