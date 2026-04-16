# Sistema Web de Gestión de Reservas - Voley Playa Diloz
Sistema web para la gestión de alquiler de canchas deportivas con control de horarios y registro de pagos en tiempo real. Desarrollado como proyecto para el curso de desarrollo de software en SENATI.

## Descripción del negocio
**Nombre:** VOLEY PLAYA DILOZ <br>
**Giro:** Alquiler de espacios deportivos (Canchas de Voley Playa) <br>
**Tamaño:** Pequeña empresa de servicios deportivos <br>
**Contexto:** Negocio ubicado en el sector de recreación donde la gestión de reservas y cobros se realiza actualmente de forma manual en cuadernos, lo que genera desorden en los horarios y falta de control financiero 
**Justificación:** Se requiere un sistema digital para centralizar la información, evitar cruces de horarios (duplicidad) y permitir una consulta rápida de la disponibilidad de las canchas .

## Identificar el problema y solución
**Problema:** La gestión manual en papel provoca errores en el registro de fechas, pérdida de datos de clientes, dificultad para verificar qué canchas están libres en horas pico y falta de trazabilidad en los adelantos o pagos totales de las reservas . <br>
**Solución tecnológica:** Desarrollar una plataforma web con Java Spring Boot y MariaDB que permita automatizar el flujo de reservas, validar la disponibilidad de horarios automáticamente y generar reportes de ingresos mensuales .

## Requerimientos Funcionales
| Código | Descripción |
|---|---|
| RF01 | El sistema debe permitir el inicio de sesión seguro para el administrador. |
| RF02 | El sistema debe permitir registrar y gestionar datos de clientes (Nombre, Apellido) . |
| RF03 | El sistema debe registrar reservas asociando un cliente a una cancha en una fecha y rango horario específico . |
| RF04 | El sistema debe validar automáticamente que no existan dos reservas en la misma cancha y horario . |
| RF05 | El sistema debe registrar pagos (monto y fecha) vinculados a cada reserva . |

## Requerimientos No Funcionales
| Código | Tipo | Descripción |
|---|---|---|
| RNF01 | Seguridad | El acceso al sistema está restringido solo a usuarios autorizados mediante contraseña . |
| RNF02 | Usabilidad | La interfaz debe ser intuitiva, organizada y fácil de operar para el administrador. |
| RNF03 | Integridad | La base de datos debe garantizar que cada pago esté correctamente vinculado a una reserva válida. |

## Stack completo
1. **Figma** = Diseño de la interfaz de usuario (UI/UX) y prototipo interactivo.
2. **MariaDB / MySQL Workbench** = Diseño, administración y persistencia de la base de datos.
3. **IntelliJ IDEA** = IDE principal para el desarrollo del Backend (Spring Boot) y Frontend.
4. [cite_start]**Spring Boot** = Framework para la creación de la API REST y lógica de negocio .

## Tecnologías utilizadas
- **Java 17** (Lenguaje de programación).
- **Spring Boot 3** (Framework Backend).
- **MariaDB** (Motor de base de datos relacional).
- **HTML5, CSS3, JavaScript** (Tecnologías de Frontend) .
- **Figma** (Diseño de interfaces).

## Base de datos
El sistema cuenta con 5 tablas principales diseñadas para la gestión del negocio :

| Tabla | Descripción |
|---|---|
| **USUARIO** | Credenciales de acceso para el administrador del sistema (Login). |
| **CLIENTE** | Registro de las personas que solicitan el alquiler de canchas. |
| **CANCHA** | Catálogo de las canchas disponibles para alquiler. |
| **RESERVA** | Tabla central que gestiona los horarios, fechas y estados de alquiler. |
| **PAGO** | Registro detallado de los montos abonados por cada reserva. |

### Diagrama de Modelo Relacional (MR)
![Modelo Relacional](recursos/Modelo_Relacional.png)
*Descripción: Este diagrama representa la estructura lógica de los datos. La tabla **Reserva** actúa como eje central, conectando a los **Clientes** con las **Canchas**. La entidad **Usuario** se mantiene independiente para fines estrictos de autenticación, asegurando que solo el personal autorizado gestione la información .*



