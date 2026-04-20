package com.senati.voley.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utilidad para encriptar contraseñas con BCrypt
 * Uso: BCryptPasswordEncoder().encode("password")
 */
public class PasswordEncryptor {
    
    public static void main(String[] args) {
        if (args.length < 1) {
            System.out.println("Uso: java PasswordEncryptor <contraseña>");
            System.exit(1);
        }
        
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = args[0];
        String encryptedPassword = encoder.encode(password);
        
        System.out.println("Contraseña original: " + password);
        System.out.println("Contraseña encriptada: " + encryptedPassword);
    }
}
