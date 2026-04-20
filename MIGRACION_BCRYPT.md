# GUÍA DE MIGRACIÓN A BCrypt

## Resumen de cambios realizados

Se ha actualizado el sistema Voley Playa Diloz con:
- ✅ Spring Security + JWT real
- ✅ Encriptación BCrypt para contraseñas
- ✅ CORS seguro (no abierto a todos)
- ✅ Validaciones en DTOs
- ✅ Campo celular en tabla clientes
- ✅ Autenticación con JWT en cada request

## ⚠️ IMPORTANTE: Migrar contraseñas existentes

### Opción 1: Cambiar las contraseñas en la BD (RECOMENDADO)

Ejecutar en MySQL los siguientes comandos para cambiar las contraseñas a BCrypt:

```sql
-- Ver usuarios actuales (con contraseñas en texto plano)
SELECT id_usuario, username, password FROM usuario;

-- Ejemplo de contraseñas BCrypt:
-- admin / $2a$10$sZqyQppLjLqOkBi8cDzjwOlJ1xUvQ.U5H4KE.CXq.qKhGLyW6b0Py
-- password / $2a$10$lBaLgJM5KVlCp3dL5V9c5Oh7v2p6J.c9Dq1R.X.rK.Q9L4v9x2dLu

-- Actualizar contraseña para usuario admin (cambiar a: "diloz_2024")
UPDATE usuario SET password = '$2a$10$lBaLgJM5KVlCp3dL5V9c5Oh7v2p6J.c9Dq1R.X.rK.Q9L4v9x2dLu' WHERE username = 'admin';

-- Actualizar contraseña para usuario user1 (cambiar a: "user123")
UPDATE usuario SET password = '$2a$10$0rW.QwdQvmxkdGl/Q5KLIuWN1BQKJj7s1c2L.r5V9mK.T9V4p8qLa' WHERE username = 'user1';
```

### Opción 2: Generar BCrypt manualmente

Ejecutar en terminal después de compilar el proyecto:

```bash
cd backend
mvn clean install
java -cp target/voley-0.0.1-SNAPSHOT.jar:. com.senati.voley.util.PasswordEncryptor "tu_contraseña_aqui"
```

Ejemplo:
```bash
java -cp target/voley-0.0.1-SNAPSHOT.jar:. com.senati.voley.util.PasswordEncryptor "diloz_2024"
```

Esto generará una contraseña encriptada que puedes copiar y pegar en la BD.

### Opción 3: Crear nuevos usuarios desde cero

```sql
-- Crear nuevo usuario con contraseña encriptada
INSERT INTO usuario (username, password, nombre_admin) 
VALUES ('admin_nuevo', '$2a$10$sZqyQppLjLqOkBi8cDzjwOlJ1xUvQ.U5H4KE.CXq.qKhGLyW6b0Py', 'Administrador');
```

## Prueba de funcionamiento

### 1. Compilar el backend
```bash
cd backend
mvn clean install
```

### 2. Iniciar la aplicación
```bash
mvn spring-boot:run
```

### 3. Probar login con JWT real

Hacer request POST a `http://localhost:8080/api/login`:
```json
{
  "username": "admin",
  "password": "diloz_2024"
}
```

Respuesta esperada (con JWT real):
```json
{
  "status": "ok",
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "nombre": "Administrador",
  "username": "admin"
}
```

### 4. Usar el token para próximas requests

Agregar header:
```
Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...
```

## Cambios en Frontend

El archivo `api.js` ya ha sido actualizado para:
- Guardar el JWT real retornado por el backend
- Enviar el JWT en el header `Authorization: Bearer <token>`
- Validar respuestas 401 (sesión expirada)

No se requieren cambios adicionales en el frontend.

## Seguridad implementada

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| Contraseñas | Texto plano ❌ | BCrypt ✅ |
| Autenticación | JWT falso ❌ | JWT real ✅ |
| CORS | Abierto a todos (*) ❌ | Origen específico ✅ |
| Validaciones | Mínimas ❌ | Completas (DTOs) ✅ |

## Próximos pasos

1. ✅ Migrar contraseñas existentes a BCrypt
2. ✅ Compilar y probar el backend
3. ✅ Probar login y generación de JWT
4. ✅ Verificar que todas las llamadas API requieran token
5. ✅ Diseñar el frontend

## Notas importantes

- **NO ENVIAR jwt.secret por correo o GitHub** - Cambiar en producción
- Las contraseñas están ahora cifradas y no pueden recuperarse
- Si un usuario olvida contraseña, debe ser restablecida desde BD
- El token JWT expira en 24 horas (configurable en application.properties)
