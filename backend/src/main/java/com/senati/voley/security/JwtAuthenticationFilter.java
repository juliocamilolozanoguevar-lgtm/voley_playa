package com.senati.voley.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

/**
 * Filtro que intercepta cada request y valida el JWT en el header Authorization
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Obtener el token del header Authorization
        String token = getTokenFromRequest(request);

        if (token != null && jwtUtil.validateToken(token)) {
            // Extraer username del token
            String username = jwtUtil.extractUsername(token);

            // Crear autenticación y establecerla en SecurityContext
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    username, null, new ArrayList<>()
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extrae el token del header Authorization
     * Esperado formato: "Bearer <token>"
     */
    private String getTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);  // Extrae el token sin "Bearer "
        }

        return null;
    }
}
