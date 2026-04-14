package com.senati.gotagota.service;

import com.senati.gotagota.entity.Cliente;
import com.senati.gotagota.repository.ClienteRepository;
import org.springframework.stereotype.Service;
import java.util.List;
//Importamos la anotacion @service
//Esto es la capa de la logica de negocio, aqui van las validaciones, calculos, etc.
@Service
public class ClienteService {
    //Inyectamos el repositorio para poder acceder a la base de datos
    private final ClienteRepository clienteRepository;

    //Contructor: Spring inyecta automaticamente el repositorio(las dependencias)
    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }
    //Retorna o recive la lista de todos los clientes
    public List<Cliente> listarTodos(){
        return clienteRepository.findAll();
    }
}
