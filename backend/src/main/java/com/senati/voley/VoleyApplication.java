package com.senati.voley;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class VoleyApplication {
	public static void main(String[] args) {
		SpringApplication.run(VoleyApplication.class, args);
		System.out.println("========================================");
		System.out.println(" VOLEY PLAYA DILOZ - BACKEND INICIADO");
		System.out.println("========================================");
		System.out.println(" API disponible: http://localhost:8080/api");
		System.out.println(" Health check: http://localhost:8080/api/health");
		System.out.println("========================================");
	}
}