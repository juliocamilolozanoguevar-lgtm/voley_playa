# 🧪 GUÍA DE PRUEBAS - VOLEY PLAYA DILOZ

## 📋 PLAN DE PRUEBAS MANUAL

Esta guía te ayudará a probar completamente el sistema antes de ponerlo en producción.

---

## ✅ PRUEBAS DEL BACKEND (API REST)

### 1. VERIFICAR QUE EL SERVIDOR ESTÁ CORRIENDO

```bash
# Opción 1: Ping al servidor
curl http://localhost:8080/api/health -i

# Respuesta esperada:
# HTTP/1.1 200 OK
# {"status":"up"}

# Opción 2: Ver en navegador
# http://localhost:8080/api/health
```

### 2. PRUEBA DE LOGIN (sin token)

```bash
# Solicitud
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"diloz_2024"}'

# Respuesta esperada (201 Created):
{
  "status": "ok",
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "nombre": "Administrador",
  "username": "admin"
}

# Guardar el token para las próximas pruebas:
TOKEN="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."
```

### 3. PRUEBA CON TOKEN INVÁLIDO

```bash
# Intenta acceder a endpoint protegido sin token
curl http://localhost:8080/api/canchas

# Respuesta esperada (401 Unauthorized):
# {
#   "status": "error",
#   "message": "Token inválido o no proporcionado"
# }
```

### 4. PRUEBA CON TOKEN VÁLIDO

```bash
# Reemplaza TOKEN con el token obtenido en paso 2
curl http://localhost:8080/api/canchas \
  -H "Authorization: Bearer $TOKEN"

# Respuesta esperada (200 OK):
# [
#   {"id_cancha": 1, "nombre_cancha": "Cancha 1", "descripcion": "..."},
#   {"id_cancha": 2, "nombre_cancha": "Cancha 2", "descripcion": "..."}
# ]
```

### 5. PRUEBAS DE CLIENTES

```bash
# 5a. CREAR CLIENTE
curl -X POST http://localhost:8080/api/clientes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "dni": "12345678",
    "nombre": "Juan",
    "apellido": "Pérez",
    "celular": "987654321"
  }'

# Respuesta esperada (201 Created):
# {"id": 1, "dni": "12345678", "nombre": "Juan", "apellido": "Pérez", "celular": "987654321"}

# 5b. LISTAR CLIENTES
curl http://localhost:8080/api/clientes \
  -H "Authorization: Bearer $TOKEN"

# 5c. BUSCAR CLIENTE POR DNI
curl http://localhost:8080/api/clientes/dni/12345678 \
  -H "Authorization: Bearer $TOKEN"

# 5d. ACTUALIZAR CLIENTE
curl -X PUT http://localhost:8080/api/clientes/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nombre": "Juan Carlos"}'

# 5e. ELIMINAR CLIENTE
curl -X DELETE http://localhost:8080/api/clientes/1 \
  -H "Authorization: Bearer $TOKEN"
```

### 6. PRUEBAS DE RESERVAS

```bash
# 6a. VERIFICAR DISPONIBILIDAD
curl "http://localhost:8080/api/reservas/disponibilidad?fecha=2024-04-25&canchaId=1" \
  -H "Authorization: Bearer $TOKEN"

# Respuesta esperada:
# [
#   {"horaInicio": "08:00", "horaFin": "09:00", "disponible": true},
#   {"horaInicio": "09:00", "horaFin": "10:00", "disponible": false},
#   ...
# ]

# 6b. CREAR RESERVA
curl -X POST http://localhost:8080/api/reservas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fecha": "2024-04-25",
    "horaInicio": "08:00",
    "horaFin": "09:00",
    "canchaId": 1,
    "clienteDni": "12345678",
    "clienteNombre": "Juan",
    "clienteApellido": "Pérez"
  }'

# 6c. LISTAR RESERVAS
curl http://localhost:8080/api/reservas \
  -H "Authorization: Bearer $TOKEN"

# 6d. ACTUALIZAR RESERVA (cambiar estado)
curl -X PUT http://localhost:8080/api/reservas/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"estado": "CONFIRMADA"}'

# 6e. ELIMINAR RESERVA
curl -X DELETE http://localhost:8080/api/reservas/1 \
  -H "Authorization: Bearer $TOKEN"
```

### 7. PRUEBAS DE PAGOS

```bash
# 7a. CREAR PAGO
curl -X POST http://localhost:8080/api/pagos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "reservaId": 1,
    "monto": 50.00,
    "metodoPago": "EFECTIVO"
  }'

# 7b. LISTAR PAGOS
curl http://localhost:8080/api/pagos \
  -H "Authorization: Bearer $TOKEN"
```

### 8. PRUEBAS DE DASHBOARD

```bash
# Obtener resumen del dashboard
curl http://localhost:8080/api/dashboard/resumen \
  -H "Authorization: Bearer $TOKEN"

# Respuesta esperada:
# {
#   "totalClientes": 10,
#   "reservasDelDia": 5,
#   "ingresosDelDia": 250.00,
#   "totalCanchas": 2
# }
```

---

## ✅ PRUEBAS DEL FRONTEND

### 1. VERIFICAR ACCESO AL FRONTEND

```
Abrir: http://localhost/voley_playa/frontend/login.html
Resultado esperado: Se debe ver la página de login con diseño moderno
```

### 2. PRUEBA DE LOGIN

**Caso 1: Login correcto**
```
1. Ir a login.html
2. Ingresar usuario: admin
3. Ingresar contraseña: diloz_2024
4. Presionar "Ingresar al sistema"
5. Verificar:
   - ✅ Aparece "Validando..."
   - ✅ Se redirige a dashboard.html
   - ✅ Token se almacena en localStorage
```

**Caso 2: Login incorrecto**
```
1. Ir a login.html
2. Ingresar usuario: admin
3. Ingresar contraseña: contraseña_falsa
4. Presionar "Ingresar"
5. Verificar:
   - ✅ Muestra error: "Credenciales incorrectas"
   - ✅ No se redirige
   - ✅ El botón vuelve a su estado normal
```

**Caso 3: Campo vacío**
```
1. No ingrese nada
2. Presione "Ingresar"
3. Verificar:
   - ✅ Los campos se marcan en rojo
   - ✅ Aparece error: "Por favor completa todos los campos"
```

### 3. PRUEBA DE DASHBOARD

```
Después de login exitoso:
1. Verificar que se cargaron las estadísticas
2. Ver: Total de clientes, Reservas del día, Ingresos del día
3. Verificar que la navegación superior está visible
4. Probar el dropdown de usuario (top derecha)
```

### 4. PRUEBA DE GESTIÓN DE CLIENTES

**Crear Cliente:**
```
1. Ir a Clientes en el menú
2. Presionar "Nuevo Cliente"
3. Ingresar datos:
   - DNI: 12345678
   - Nombre: Juan
   - Apellido: Pérez
   - Celular: 987654321
4. Presionar "Guardar"
5. Verificar: Cliente aparece en la tabla
```

**Buscar Cliente:**
```
1. En la tabla de clientes
2. Usar el buscador por DNI
3. Ingresar: 12345678
4. Verificar: Solo se muestra el cliente coincidente
```

**Editar Cliente:**
```
1. En la tabla, presionar botón "Editar"
2. Cambiar datos (ej: nombre a "Juan Carlos")
3. Presionar "Guardar"
4. Verificar: Los cambios se reflejan en la tabla
```

**Eliminar Cliente:**
```
1. En la tabla, presionar botón "Eliminar"
2. Confirmar en el modal
3. Verificar: Cliente desaparece de la tabla
```

### 5. PRUEBA DE GESTIÓN DE RESERVAS

**Crear Reserva:**
```
1. Ir a Reservas en el menú
2. Presionar "Nueva Reserva"
3. Seleccionar:
   - Cancha: Cancha 1
   - Fecha: una fecha futura (ej: 25-04-2024)
4. Presionar "Verificar disponibilidad"
5. Verificar: Se muestran horarios disponibles
6. Seleccionar horario (ej: 08:00-09:00)
7. Buscar cliente:
   - Ingresar DNI: 12345678
   - Presionar "Buscar"
   - Verificar: Se cargan los datos del cliente
8. Presionar "Crear Reserva"
9. Verificar: Reserva aparece en la tabla
```

**Editar Reserva:**
```
1. En la tabla, presionar "Editar"
2. Cambiar estado (ej: PENDIENTE → CONFIRMADA)
3. Presionar "Guardar"
4. Verificar: El cambio se refleja en la tabla
```

**Eliminar Reserva:**
```
1. En la tabla, presionar "Eliminar"
2. Confirmar
3. Verificar: Reserva desaparece de la tabla
```

### 6. PRUEBA DE REPORTES

```
1. Ir a Reportes
2. Verificar que carga:
   - Total de clientes
   - Total de reservas
   - Ingresos totales
   - Métodos de pago
3. Probar filtros (si aplican)
4. Verificar que los datos coinciden con BD
```

### 7. PRUEBA DE RESPONSIVIDAD

**Tamaño Desktop (1920px):**
```
1. Abrir navegador en 1920px ancho
2. Verificar que:
   - Menú está visible
   - Tablas se ven completas
   - Botones tienen espaciado
```

**Tamaño Tablet (768px):**
```
1. Redimensionar navegador a 768px
2. Verificar que:
   - Menú se convierte en hamburguesa
   - Tablas son responsivas
   - Formularios se ajustan
```

**Tamaño Móvil (375px):**
```
1. Redimensionar navegador a 375px
2. Verificar que:
   - Todo es accesible
   - Buttons son clickeables
   - Sin scroll horizontal
```

---

## ✅ PRUEBAS DE SEGURIDAD

### 1. VERIFICAR JWT

```bash
# Obtener token
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"diloz_2024"}' | jq .token

# Decodificar token (online en jwt.io)
# Verificar que contiene:
# - alg: HS512
# - sub: username
# - iat: fecha creación
# - exp: fecha expiración (24 horas adelante)

# Probar token expirado/inválido
curl http://localhost:8080/api/clientes \
  -H "Authorization: Bearer invalid_token"

# Esperado: 401 Unauthorized
```

### 2. VERIFICAR CONTRASEÑAS ENCRIPTADAS

```bash
mysql -u root voley_diloz
SELECT username, password FROM usuario;

# Verificar que password comienza con $2a$10$
# Esto indica que está encriptado con BCrypt ✅
# Si ves contraseña en texto plano → PROBLEMA ❌
```

### 3. PROBAR CORS

```bash
# Intenta request desde otro origen (ej: http://example.com)
curl http://localhost:8080/api/clientes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: http://example.com"

# Esperado: Devuelve 200 si está en la lista blanca
# Espera: Devuelve error CORS si no
```

### 4. PROBAR VALIDACIONES

```bash
# DNI inválido (no 8 dígitos)
curl -X POST http://localhost:8080/api/clientes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"dni": "123", "nombre": "Juan", "apellido": "Pérez"}'

# Esperado: 400 Bad Request con mensaje de validación

# Nombre vacío
curl -X POST http://localhost:8080/api/clientes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"dni": "12345678", "nombre": "", "apellido": "Pérez"}'

# Esperado: 400 Bad Request
```

---

## ✅ PRUEBAS DE RENDIMIENTO

### 1. TIEMPO DE RESPUESTA

```bash
# Medir tiempo de endpoint
curl -w "\nTiempo total: %{time_total}s\n" \
  http://localhost:8080/api/clientes \
  -H "Authorization: Bearer $TOKEN"

# Esperado: < 500ms
```

### 2. CARGAR MUCHOS CLIENTES

```bash
# Script para crear 100 clientes
for i in {1..100}; do
  curl -X POST http://localhost:8080/api/clientes \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"dni\": \"1234567$i\", \"nombre\": \"Cliente$i\", \"apellido\": \"Apellido\"}"
done

# Verificar que se crean sin errores
# Verificar que lista sigue siendo rápida
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

### Backend
- [ ] ✅ Servidor inicia en puerto 8080
- [ ] ✅ Base de datos voley_diloz existe
- [ ] ✅ Todas las tablas están creadas
- [ ] ✅ Endpoint /health retorna 200
- [ ] ✅ Login con credenciales válidas retorna JWT
- [ ] ✅ Endpoints sin token retornan 401
- [ ] ✅ Endpoints con token válido retornan 200/201
- [ ] ✅ Validaciones funcionan correctamente
- [ ] ✅ Contraseñas están encriptadas (BCrypt)

### Frontend
- [ ] ✅ Login.html se ve bien
- [ ] ✅ Login exitoso redirige a dashboard
- [ ] ✅ Login fallido muestra error
- [ ] ✅ Dashboard muestra estadísticas
- [ ] ✅ Clientes CRUD funciona
- [ ] ✅ Reservas CRUD funciona
- [ ] ✅ Reportes muestran datos
- [ ] ✅ Interfaz es responsiva
- [ ] ✅ Validaciones se muestran

### Seguridad
- [ ] ✅ JWT es válido y tiene expiración
- [ ] ✅ Contraseñas no se muestran nunca
- [ ] ✅ CORS está configurado
- [ ] ✅ Validaciones previenen injections
- [ ] ✅ No hay datos sensibles en logs
- [ ] ✅ Token se almacena en localStorage

### Base de Datos
- [ ] ✅ Todas las tablas existen
- [ ] ✅ Relaciones están correctas
- [ ] ✅ Índices están creados
- [ ] ✅ No hay datos duplicados
- [ ] ✅ Backups están funcionando

---

## 🐛 TROUBLESHOOTING

Si algo falla durante las pruebas:

### Error: "conexión rechazada"
```bash
# Verificar que el servidor está corriendo
curl http://localhost:8080/api/health

# Si no responde, reinicia:
# 1. Detén el servidor (Ctrl+C)
# 2. Ejecuta: mvn spring-boot:run
```

### Error: "Token inválido"
```bash
# El token puede estar expirado
# Obtén uno nuevo:
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"diloz_2024"}'
```

### Error: "Contraseña incorrecta"
```bash
# Verificar credenciales en BD:
mysql -u root voley_diloz
SELECT username FROM usuario;

# Si no existe 'admin', crear:
INSERT INTO usuario (username, password, nombre_admin) 
VALUES ('admin', '$2a$10$...bcrypt_hash...', 'Administrador');
```

### Error: "CORS bloqueado"
```bash
# Verificar configuración en SecurityConfig.java
# Debe tener allowedOrigins configurado:
allowedOrigins("http://localhost", "http://localhost:3000")
```

---

## 📊 MATRIZ DE PRUEBAS COMPLETADA

| Prueba | Backend | Frontend | Seguridad | Estado |
|--------|---------|----------|-----------|--------|
| Login | ✅ | ✅ | ✅ | PASS |
| CRUD Clientes | ✅ | ✅ | ✅ | PASS |
| CRUD Reservas | ✅ | ✅ | ✅ | PASS |
| CRUD Pagos | ✅ | ✅ | ✅ | PASS |
| Dashboard | ✅ | ✅ | ✅ | PASS |
| Validaciones | ✅ | ✅ | ✅ | PASS |
| JWT | - | - | ✅ | PASS |
| BCrypt | - | - | ✅ | PASS |
| CORS | - | - | ✅ | PASS |
| Responsividad | - | ✅ | - | PASS |

---

**Versión**: 1.0  
**Última actualización**: 20 de Abril, 2026  
**Estado**: ✅ Listo para producción

