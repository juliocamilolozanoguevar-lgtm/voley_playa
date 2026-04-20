package com.senati.voley.service;

import com.senati.voley.entity.Cliente;
import com.senati.voley.exception.ResourceNotFoundException;
import com.senati.voley.repository.ClienteRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<Cliente> listarTodos() {
        return clienteRepository.findAll(Sort.by(Sort.Direction.ASC, "idCliente"));
    }

    public Optional<Cliente> buscarPorId(Integer id) {
        return clienteRepository.findById(id);
    }

    public Cliente guardarCliente(Cliente cliente) {
        validarDatos(cliente);

        String dni = cliente.getDni().trim();

        if (clienteRepository.findByDni(dni).isPresent()) {
            throw new IllegalArgumentException("Ya existe un cliente con ese DNI.");
        }

        cliente.setDni(dni);
        cliente.setNombre(cliente.getNombre().trim());
        cliente.setApellido(cliente.getApellido().trim());

        return clienteRepository.save(cliente);
    }

    public Cliente actualizarCliente(Integer id, Cliente datos) {
        validarDatos(datos);

        Cliente existente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El cliente no existe."));

        String dni = datos.getDni().trim();

        clienteRepository.findByDni(dni).ifPresent(otro -> {
            if (!otro.getIdCliente().equals(id)) {
                throw new IllegalArgumentException("Ya existe otro cliente con ese DNI.");
            }
        });

        existente.setDni(dni);
        existente.setNombre(datos.getNombre().trim());
        existente.setApellido(datos.getApellido().trim());

        return clienteRepository.save(existente);
    }

    public void eliminarCliente(Integer id) {
        if (!clienteRepository.existsById(id)) {
            throw new ResourceNotFoundException("El cliente no existe.");
        }

        clienteRepository.deleteById(id);
    }

    private void validarDatos(Cliente cliente) {
        if (cliente.getDni() == null || cliente.getDni().isBlank()
                || cliente.getNombre() == null || cliente.getNombre().isBlank()
                || cliente.getApellido() == null || cliente.getApellido().isBlank()) {
            throw new IllegalArgumentException("Completa los datos del cliente.");
        }

        if (cliente.getDni().trim().length() != 8) {
            throw new IllegalArgumentException("El DNI debe tener 8 dígitos.");
        }
    }
}