package com.senati.voley.controller;

import com.senati.voley.entity.Usuario;
import com.senati.voley.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class LoginController {

    @Autowired
    private UsuarioRepository usuarioRepository; // Conexión al Repositorio

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> datos) {
        // 1. Recibimos lo que Julio escribe en el JS
        String user = datos.get("username");
        String pass = datos.get("password");

        Map<String, Object> respuesta = new HashMap<>();

        // 2. Buscamos en la tabla 'usuario' de MySQL
        Optional<Usuario> usuarioDb = usuarioRepository.findByUsername(user);

        // 3. Verificamos si el usuario existe
        if (usuarioDb.isPresent()) {
            Usuario u = usuarioDb.get();

            // 4. Comparamos la clave enviada con la de la base de datos (admin123)
            if (u.getPassword().equals(pass)) {
                respuesta.put("status", "ok");

                // Como el nombre está en la tabla cliente, si tienes la relación hecha:
                // respuesta.put("nombre", u.getCliente().getNombre());

                // Si aún no haces la relación, puedes ponerlo así para probar:
                respuesta.put("nombre", "Julio Lozano");

            } else {
                respuesta.put("status", "error");
                respuesta.put("message", "Contraseña incorrecta");
            }
        } else {
            respuesta.put("status", "error");
            respuesta.put("message", "El usuario no existe en la base de datos");
        }

        return respuesta;
    }
}