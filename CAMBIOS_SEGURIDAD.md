# CAMBIOS REALIZADOS - Voley Playa Diloz

## 🔒 IMPLEMENTACIÓN DE SEGURIDAD

Se han realizado los siguientes cambios de conexión y seguridad al proyecto:

### 1. **Spring Security + JWT Real** ✅
   - **Archivo creado**: `security/SecurityConfig.java`
   - **Funcionalidad**: Configuración centralizada de seguridad
   - **Cambio**: Login ahora genera JWT real (no falso)

### 2. **Encriptación de Contraseñas con BCrypt** ✅
   - **Archivo creado**: `util/PasswordEncryptor.java`
   - **Cambio**: Contraseñas en BD ahora encriptadas
   - **Acción requerida**: Ejecutar `MIGRACION_CONTRASENAS.sql`

### 3. **JWT Utility** ✅
   - **Archivo creado**: `security/JwtUtil.java`
   - **Funcionalidad**: Generar y validar tokens JWT
   - **Expiración**: 24 horas (configurable)

### 4. **Filtro JWT para cada Request** ✅
   - **Archivo creado**: `security/JwtAuthenticationFilter.java`
   - **Funcionalidad**: Valida JWT en cada request
   - **Header esperado**: `Authorization: Bearer <token>`

### 5. **CORS Restrictivo** ✅
   - **Antes**: `@CrossOrigin(origins = "*")` (INSEGURO)
   - **Ahora**: Configurado en `SecurityConfig.java`
   - **Orígenes permitidos**: `localhost:3000`, `localhost:8080`, `localhost`
   - **Controllers actualizados**:
     - `LoginController.java`
     - `CanchaController.java`
     - `ClienteController.java`
     - `ReservaController.java`
     - `PagoController.java`
     - `DashboardController.java`

### 6. **Validaciones en DTOs** ✅
   - **Archivo actualizado**: `dto/ReservaRequest.java`
   - **Validaciones agregadas**:
     - `@NotNull` para campos obligatorios
     - `@NotBlank` para strings no vacíos
     - `@Size` para rango de caracteres
     - `@Future` para fechas futuras
     - `@Positive` para montos

### 7. **Tabla Cliente - Campo Celular** ✅
   - **Archivo actualizado**: `entity/Cliente.java`
   - **Campo agregado**: `String celular` (VARCHAR(20))
   - **Cambio**: Frontend puede enviar `celular` y será guardado

### 8. **Validación de Datos en Servicio** ✅
   - **Archivo actualizado**: `service/ReservaService.java`
   - **Validación**: Nombre y apellido obligatorios
   - **Beneficio**: No se crean clientes vacíos

### 9. **LoginController Actualizado** ✅
   - **Cambio**: Usa `PasswordEncoder` para validar BCrypt
   - **Retorna**: JWT real en campo `token`
   - **Respuesta**: Incluye token, nombre y username

### 10. **Frontend API actualizado** ✅
   - **Archivo actualizado**: `frontend/js/api.js`
   - **Cambio**: Usa JWT real del backend (no falso)
   - **Headers**: Envía `Authorization: Bearer <token>`

### 11. **Archivos Duplicados Eliminados** ✅
   - ❌ `frontend/js/api-config.js` (eliminado)
   - ❌ `frontend/js/cliente.js` (eliminado)

---

## 📋 CONFIGURACIÓN REQUERIDA

### 1. Actualizar `application.properties`
Ya actualizado con:
```properties
jwt.secret=voley_playa_diloz_secret_key_2024_super_seguro_cambiar_en_produccion
jwt.expiration=86400000
```

**IMPORTANTE**: En producción, cambiar `jwt.secret` a un valor seguro y único.

### 2. Migrar Contraseñas a BCrypt

Ejecutar el script `MIGRACION_CONTRASENAS.sql` en MySQL:

```bash
# Opción 1: Desde línea de comando
mysql -u root voley_diloz < MIGRACION_CONTRASENAS.sql

# Opción 2: Desde MySQL Workbench o phpMyAdmin
# Copiar y pegar el contenido del archivo
```

**O generar manualmente**:
```bash
cd backend
mvn clean install
java -cp target/voley-0.0.1-SNAPSHOT.jar:. com.senati.voley.util.PasswordEncryptor "tu_contraseña"
```

---

## 🧪 PRUEBA DEL SISTEMA

### 1. Compilar el backend
```bash
cd backend
mvn clean install
```

### 2. Ejecutar la aplicación
```bash
mvn spring-boot:run
```

### 3. Probar Login (POST)
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"diloz_2024"}'
```

**Respuesta esperada**:
```json
{
  "status": "ok",
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "nombre": "Administrador",
  "username": "admin"
}
```

### 4. Usar Token para próximas llamadas
```bash
curl http://localhost:8080/api/canchas \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."
```

---

## 📊 COMPARACIÓN: ANTES vs DESPUÉS

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Autenticación** | JWT falso sin validación | JWT real validado ✅ |
| **Contraseñas** | Texto plano | BCrypt encriptadas ✅ |
| **CORS** | Abierto a todos (*) | Origen específico ✅ |
| **Validaciones** | Mínimas | Completas con anotaciones ✅ |
| **Seguridad API** | Sin validación | Token en cada request ✅ |
| **Campo Celular** | No existe | Agregado ✅ |
| **Duplicación código** | api-config.js, cliente.js | Eliminados ✅ |

---

## 🔑 ENDPOINTS PÚBLICOS Y PROTEGIDOS

### Públicos (sin token)
- `POST /login` - Login
- `GET /health` - Estado del sistema

### Protegidos (requieren token)
- `GET /canchas` - Listar canchas
- `GET /clientes` - Listar clientes
- `POST /clientes` - Crear cliente
- `GET /clientes/{id}` - Buscar por ID
- `GET /clientes/dni/{dni}` - Buscar por DNI
- `PUT /clientes/{id}` - Actualizar cliente
- `DELETE /clientes/{id}` - Eliminar cliente
- `GET /reservas` - Listar reservas
- `POST /reservas` - Crear reserva
- `GET /reservas/disponibilidad` - Consultar disponibilidad
- `PUT /reservas/{id}` - Actualizar reserva
- `DELETE /reservas/{id}` - Eliminar reserva
- `GET /pagos` - Listar pagos
- `GET /dashboard/resumen` - Resumen del dashboard

---

## 📁 ESTRUCTURA DE CARPETAS ACTUALIZADAS

```
backend/src/main/java/com/senati/voley/
├── security/                    ← NUEVA
│   ├── JwtUtil.java            ✨
│   ├── JwtAuthenticationFilter.java  ✨
│   └── SecurityConfig.java      ✨
├── util/                        ← ACTUALIZADO
│   └── PasswordEncryptor.java   ✨
├── controller/
│   ├── LoginController.java     (actualizado)
│   ├── CanchaController.java    (CORS removido)
│   ├── ClienteController.java   (CORS removido)
│   ├── ReservaController.java   (CORS removido)
│   ├── PagoController.java      (CORS removido)
│   └── DashboardController.java (CORS removido)
├── dto/
│   └── ReservaRequest.java      (validaciones agregadas)
├── entity/
│   └── Cliente.java             (celular agregado)
└── service/
    └── ReservaService.java      (validaciones de datos)

frontend/js/
├── api.js                       (JWT real)
├── (api-config.js)             ❌ ELIMINADO
├── (cliente.js)                ❌ ELIMINADO
└── ...
```

---

## 🚀 PRÓXIMOS PASOS

1. ✅ **Completado**: Implementación de seguridad
2. **En curso**: Diseño del frontend
3. **Pendiente**: Testing E2E
4. **Pendiente**: Documentación API (Swagger)
5. **Pendiente**: Deploy a producción

---

## ⚠️ CONSIDERACIONES IMPORTANTES

1. **Cambiar jwt.secret en producción**
   ```properties
   jwt.secret=cambiar_a_valor_muy_seguro_en_produccion
   ```

2. **HTTPS en producción**
   - Los tokens deben transmitirse por HTTPS solo

3. **Secreto de BD**
   - No incluir credenciales en `application.properties`
   - Usar variables de entorno o archivos de configuración

4. **Documentación**
   - Ver `MIGRACION_BCRYPT.md` para más detalles
   - Ver `MIGRACION_CONTRASENAS.sql` para scripts SQL

---

## 📞 SOPORTE

Si tienes dudas:
1. Revisar `MIGRACION_BCRYPT.md`
2. Verificar logs en `target/logs/`
3. Ejecutar test de conexión

---

**Última actualización**: 20/04/2026
**Estado**: ✅ Todos los cambios de seguridad implementados
**Siguiente fase**: Diseño del frontend
