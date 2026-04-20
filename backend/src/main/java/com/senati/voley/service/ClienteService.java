package com.senati.voley.service;

import com.senati.voley.entity.Cliente;
import com.senati.voley.repository.ClienteRepository;
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
        return clienteRepository.findAll();
    }

    public Optional<Cliente> buscarPorId(Integer id) {
        return clienteRepository.findById(id);
    }

    public Optional<Cliente> buscarPorDni(String dni) {
        return clienteRepository.findByDni(dni);
    }

    public Cliente guardar(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    public void eliminar(Integer id) {
        clienteRepository.deleteById(id);
    }

    public long contarClientes() {
        return clienteRepository.count();
    }
}