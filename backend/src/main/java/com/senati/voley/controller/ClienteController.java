package com.senati.voley.controller;

import com.senati.voley.entity.Cliente;
import com.senati.voley.service.ClienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador para la gestión de Clientes.
 * Mantiene la estructura profesional de inyección por constructor.
 */
@RestController
@RequestMapping("api/clientes")
@CrossOrigin(origins = "*") // Permite la conexión con tu diseño de Figma
public class ClienteController {

    private final ClienteService clienteService;

    // Inyección por constructor (Identico al estilo de gota a gota)
    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    // Listar todos los clientes - GET /api/clientes
    @GetMapping
    public List<Cliente> listar() {
        return clienteService.listarTodos();
    }

    // Buscar un cliente por ID - GET /api/clientes/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Cliente> buscarPorId(@PathVariable Integer id) {
        return clienteService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Guardar nuevo cliente - POST /api/clientes
    @PostMapping
    public ResponseEntity<Cliente> guardar(@RequestBody Cliente cliente) {
        Cliente nuevoCliente = clienteService.guardarCliente(cliente);
        return ResponseEntity.ok(nuevoCliente);
    }

    // Eliminar cliente - DELETE /api/clientes/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        clienteService.eliminarCliente(id);
        return ResponseEntity.noContent().build();
    }
}