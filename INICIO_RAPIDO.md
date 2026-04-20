# 🎯 GUÍA DE INICIO RÁPIDO - VOLEY PLAYA DILOZ

## ✅ Estado del Proyecto

El proyecto está completamente implementado con:
- ✅ Backend Java Spring Boot (seguro con JWT y BCrypt)
- ✅ Frontend HTML5 + Bootstrap + CSS moderno
- ✅ Base de datos MySQL configurada
- ✅ Autenticación segura
- ✅ Diseño profesional y responsivo

---

## 🚀 CÓMO EJECUTAR EL PROYECTO

### PASO 1: Preparar la Base de Datos

```bash
# Abrir MySQL
mysql -u root -p

# Crear la base de datos (si no existe)
CREATE DATABASE voley_diloz;

# Usar la base de datos
USE voley_diloz;

# Ejecutar el script de migración de contraseñas
source C:/xampp/htdocs/voley_playa/MIGRACION_CONTRASENAS.sql;

# Verificar que el usuario admin está creado
SELECT * FROM usuario;

# Si la tabla usuario está vacía, insertar datos:
INSERT INTO usuario (username, password, nombre_admin) 
VALUES ('admin', '$2a$10$lBaLgJM5KVlCp3dL5V9c5Oh7v2p6J.c9Dq1R.X.rK.Q9L4v9x2dLu', 'Administrador');
```

### PASO 2: Compilar el Backend

```bash
# Navegar a la carpeta del backend
cd C:\xampp\htdocs\voley_playa\backend

# Compilar con Maven
mvn clean install

# (Esto descargará todas las dependencias - puede tomar 5-10 minutos la primera vez)
```

### PASO 3: Ejecutar el Backend

```bash
# Opción 1: Desde Maven (recomendado)
mvn spring-boot:run

# Opción 2: Ejecutar el JAR generado
java -jar target/voley-0.0.1-SNAPSHOT.jar
```

**Resultado esperado:**
```
Started VoleyApplication in X seconds
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| | | | | | | | | (_| |  ) ) ) )
  '  |____| |_| |_| |_|_| |_|\__,_| / / / /
 =========|_|====================/_/_/_/

El servidor está listo en: http://localhost:8080
API disponible en: http://localhost:8080/api
```

### PASO 4: Acceder al Frontend

Abre tu navegador y ve a:
```
http://localhost/voley_playa/frontend/login.html
```

---

## 🔐 CREDENCIALES DE PRUEBA

| Campo | Valor |
|-------|-------|
| **Usuario** | `admin` |
| **Contraseña** | `diloz_2024` |

> **Nota**: Si cambiaste la contraseña, usa el script de migración para actualizar

---

## 📱 PRUEBA RÁPIDA DEL BACKEND

### Probar Login (genera JWT)

```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"diloz_2024"}'
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "nombre": "Administrador",
  "username": "admin"
}
```

### Probar API Protegida (lista de canchas)

```bash
# Reemplazar TOKEN con el valor de arriba
curl http://localhost:8080/api/canchas \
  -H "Authorization: Bearer TOKEN"
```

### Probar sin Token (debe fallar)

```bash
# Esto retornará 401 Unauthorized
curl http://localhost:8080/api/canchas
```

---

## 🎨 CARACTERÍSTICAS DEL FRONTEND

### Login Mejorado
- ✅ Diseño moderno con gradiente
- ✅ Validación visual en tiempo real
- ✅ Mensajes de error claros
- ✅ Indicador de carga durante login
- ✅ Animaciones suaves

### Dashboard
- ✅ Tarjetas de estadísticas coloridas
- ✅ Datos en tiempo real desde BD
- ✅ Tablas con información clara
- ✅ Interfaz responsiva

### Gestión de Clientes
- ✅ CRUD completo
- ✅ Búsqueda por DNI
- ✅ Formularios validados
- ✅ Tabla con acciones

### Gestión de Reservas
- ✅ Crear reservas con cliente automático
- ✅ Verificar disponibilidad por horario
- ✅ Editar y eliminar reservas
- ✅ Estados de reserva (PENDIENTE, CONFIRMADA, CANCELADA)

### Reportes
- ✅ Estadísticas de reservas
- ✅ Top clientes
- ✅ Ingresos por método de pago

---

## 📂 ESTRUCTURA DE CARPETAS

```
voley_playa/
├── backend/                 # Java Spring Boot
│   ├── pom.xml             # Dependencias Maven
│   ├── src/
│   │   ├── main/java/com/senati/voley/
│   │   │   ├── security/       # JWT, BCrypt, Security Config
│   │   │   ├── controller/     # REST endpoints
│   │   │   ├── service/        # Lógica de negocio
│   │   │   ├── entity/         # Modelos JPA
│   │   │   ├── dto/            # Data Transfer Objects
│   │   │   ├── repository/     # Acceso a BD
│   │   │   └── util/           # Utilidades
│   │   └── resources/
│   │       └── application.properties  # Configuración
│   └── target/              # JAR compilado
│
├── frontend/                # HTML + JS + CSS
│   ├── login.html          # Login mejorado
│   ├── dashboard.html      # Panel principal
│   ├── clientes.html       # Gestión de clientes
│   ├── reservas.html       # Gestión de reservas
│   ├── reportes.html       # Reportes
│   ├── js/
│   │   ├── api.js          # Cliente HTTP con JWT real
│   │   ├── login.js        # Lógica de login
│   │   ├── auth.js         # Validación de sesión
│   │   ├── clientes.js     # CRUD clientes
│   │   ├── reservas.js     # CRUD reservas
│   │   ├── dashboard.js    # Datos del dashboard
│   │   ├── reportes.js     # Lógica de reportes
│   │   └── ui-shell.js     # Componentes comunes
│   └── css/
│       ├── style.css       # Estilos base
│       ├── login.css       # Estilos login
│       └── modern.css      # Estilos modernos (NUEVO)
│
├── MIGRACION_BCRYPT.md     # Guía de migración
├── MIGRACION_CONTRASENAS.sql  # Script SQL
├── CAMBIOS_SEGURIDAD.md    # Resumen de cambios
└── CHECKLIST_IMPLEMENTACION.md  # Verificación
```

---

## 🔧 CONFIGURACIÓN

### Backend (application.properties)

```properties
# Puerto del servidor
server.port=8080
server.servlet.context-path=/api

# Base de datos
spring.datasource.url=jdbc:mysql://localhost:3306/voley_diloz
spring.datasource.username=root
spring.datasource.password=

# JWT
jwt.secret=voley_playa_diloz_secret_key_2024_super_seguro_cambiar_en_produccion
jwt.expiration=86400000  # 24 horas
```

### Frontend (api.js)

```javascript
// Base URL del API (detectada automáticamente)
window.VoleyApi.baseUrl = "http://localhost:8080/api"

// Token almacenado en localStorage
localStorage.voley_token  // JWT
localStorage.voley_username  // Usuario conectado
```

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### ❌ Error: "No se pudo conectar con el backend"

**Solución:**
```bash
# Verificar que el servidor está corriendo
# Abrir terminal en backend/ y ejecutar:
mvn spring-boot:run

# Verificar que no hay otro servicio en puerto 8080
netstat -ano | findstr :8080

# En la meta de login.html, verificar URL:
<meta name="voley-api-origin" content="http://localhost:8080">
```

### ❌ Error: "Contraseña incorrecta" con usuario correcto

**Solución:**
```bash
# Verificar que la contraseña está encriptada en BD
mysql -u root voley_diloz
SELECT username, LENGTH(password) FROM usuario;

# Si length < 60, necesita ser encriptada con BCrypt
# Ejecutar script MIGRACION_CONTRASENAS.sql
```

### ❌ Error: "Port 8080 already in use"

**Solución 1:** Usar otro puerto
```properties
server.port=8090
```

**Solución 2:** Matar el proceso
```bash
# En PowerShell
Get-Process | Where-Object {$_.Handles -like "8080"}
Stop-Process -Id <PID>

# En CMD
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### ❌ Error de compilación Maven

**Solución:**
```bash
# Limpiar caché de Maven
mvn clean install -DskipTests

# Si sigue fallando, eliminar carpeta .m2 local y reintentar
```

---

## 📊 FLUJO DE FUNCIONALIDAD

```
USUARIO
   ↓
LOGIN (api.js genera JWT real desde backend)
   ↓
DASHBOARD (muestra estadísticas)
   ├── CLIENTES (CRUD)
   │   ├── Crear cliente
   │   ├── Editar cliente
   │   ├── Eliminar cliente
   │   └── Ver lista
   ├── RESERVAS (CRUD con validación)
   │   ├── Crear reserva (con cliente inline)
   │   ├── Verificar disponibilidad
   │   ├── Editar estado
   │   ├── Eliminar reserva
   │   └── Ver lista
   └── REPORTES (Estadísticas)
       ├── Total de clientes
       ├── Ingresos del día
       └── Reservas por estado
   ↓
LOGOUT (limpia token y vuelve a LOGIN)
```

---

## 🎯 PRÓXIMOS PASOS (OPCIONAL)

1. **Agregar más funcionalidades**
   - Email para recordatorios de reservas
   - Pagos integrados
   - Facturación automática

2. **Mejorar seguridad**
   - Cambiar jwt.secret en producción
   - Usar HTTPS en producción
   - Agregar rate limiting

3. **Optimizar rendimiento**
   - Agregar caché
   - Paginación en tablas
   - Compresión de imágenes

4. **Agregar tests**
   - Tests unitarios (JUnit)
   - Tests E2E (Selenium/Cypress)

---

## 📞 SOPORTE

Si encuentras problemas:

1. **Revisa los logs:**
   ```bash
   # Backend: Mira la consola de ejecución
   # Frontend: F12 → Console → Revisa errores
   ```

2. **Verifica la base de datos:**
   ```bash
   mysql -u root voley_diloz
   SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;
   ```

3. **Prueba el API con curl:**
   ```bash
   curl http://localhost:8080/api/health
   ```

4. **Revisa los documentos:**
   - `CAMBIOS_SEGURIDAD.md`
   - `MIGRACION_BCRYPT.md`
   - `CHECKLIST_IMPLEMENTACION.md`

---

**Última actualización**: 20 de Abril, 2026
**Versión**: 1.0 - Producción
**Estado**: ✅ Lista para usar
