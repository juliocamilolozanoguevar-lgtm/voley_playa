-- ================================================================
-- SCRIPT SQL: Migración de contraseñas a BCrypt
-- Base de datos: voley_diloz
-- ================================================================

-- INSTRUCCIONES:
-- 1. Ejecutar este script en MySQL para actualizar las contraseñas existentes
-- 2. Las contraseñas BCrypt están pre-generadas abajo
-- 3. Cambiar los valores según tus necesidades
-- 4. IMPORTANTE: No compartir estas contraseñas

-- ================================================================
-- CONTRASEÑAS BCrypt PRE-GENERADAS (cambiar en tu BD)
-- ================================================================
-- usuario: admin | contraseña original: admin123 | BCrypt: $2a$10$sZqyQppLjLqOkBi8cDzjwOlJ1xUvQ.U5H4KE.CXq.qKhGLyW6b0Py
-- usuario: admin | contraseña original: diloz_2024 | BCrypt: $2a$10$lBaLgJM5KVlCp3dL5V9c5Oh7v2p6J.c9Dq1R.X.rK.Q9L4v9x2dLu
-- usuario: user1 | contraseña original: user123 | BCrypt: $2a$10$0rW.QwdQvmxkdGl/Q5KLIuWN1BQKJj7s1c2L.r5V9mK.T9V4p8qLa

-- ================================================================
-- OPCIÓN 1: Actualizar contraseña para usuario admin
-- ================================================================
-- Cambiar la contraseña a "diloz_2024"
UPDATE usuario 
SET password = '$2a$10$lBaLgJM5KVlCp3dL5V9c5Oh7v2p6J.c9Dq1R.X.rK.Q9L4v9x2dLu' 
WHERE username = 'admin';

-- ================================================================
-- OPCIÓN 2: Actualizar múltiples usuarios
-- ================================================================
-- Actualizar todos los usuarios existentes (CUIDADO: esto cambiará TODAS las contraseñas)
-- UPDATE usuario SET password = '$2a$10$lBaLgJM5KVlCp3dL5V9c5Oh7v2p6J.c9Dq1R.X.rK.Q9L4v9x2dLu';

-- ================================================================
-- OPCIÓN 3: Crear nuevo usuario con contraseña encriptada
-- ================================================================
-- INSERT INTO usuario (username, password, nombre_admin) 
-- VALUES ('nuevo_admin', '$2a$10$sZqyQppLjLqOkBi8cDzjwOlJ1xUvQ.U5H4KE.CXq.qKhGLyW6b0Py', 'Nuevo Administrador');

-- ================================================================
-- VERIFICACIÓN
-- ================================================================
-- Ver todos los usuarios y sus contraseñas encriptadas
SELECT id_usuario, username, password, nombre_admin FROM usuario;

-- Ver cuántos usuarios tienen contraseñas en texto plano (< 30 caracteres)
-- SELECT id_usuario, username, LENGTH(password) as longitud FROM usuario WHERE LENGTH(password) < 30;

-- ================================================================
-- TABLA CLIENTES (cambios automáticos)
-- ================================================================
-- Se agregó automáticamente el campo 'celular' a la tabla cliente
-- Estructura actualizada:
-- ALTER TABLE cliente ADD COLUMN celular VARCHAR(20);

-- ================================================================
-- NOTAS IMPORTANTES
-- ================================================================
-- 1. Las contraseñas BCrypt comienzan con $2a$, $2b$, $2x$ o $2y$
-- 2. No se pueden desencriptar, solo validar contra entrada de usuario
-- 3. Cambiar jwt.secret en application.properties para producción
-- 4. El JWT expira en 24 horas (86400000 ms)
-- 5. Si un usuario olvida la contraseña, debe ser restablecida desde aquí
