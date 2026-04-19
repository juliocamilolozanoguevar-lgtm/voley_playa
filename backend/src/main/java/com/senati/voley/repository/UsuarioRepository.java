package com.senati.voley.repository;

import com.senati.voley.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Este método buscará al usuario por su nombre en MySQL
    Optional<Usuario> findByUsername(String username);
}