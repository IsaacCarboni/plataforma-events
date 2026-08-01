# 🚀 Plataforma de Eventos e Inscripciones

API REST profesional para la gestión integrada de eventos, usuarios e inscripciones en tiempo real con control dinámico de cupos y notificaciones por email, construida con **Node.js**, **Express** y **MongoDB Atlas**.

El proyecto implementa una **Arquitectura en Capas Independientes y Desacopladas** (Controllers, Services, Repositories, DAO, DTOs, Models, Middlewares) siguiendo los estándares de diseño Backend modernos, garantizando separación de responsabilidades, seguridad, alta escalabilidad y fácil mantenimiento.

---

## 🛠️ Tecnologías Utilizadas

* **Node.js** - Entorno de ejecución para JavaScript en el servidor (ES Modules nativo).
* **Express.js** - Framework web para el diseño y construcción de la API REST.
* **MongoDB Atlas & Mongoose** - Base de datos NoSQL en la nube y modelado de datos mediante Schemas estrictos.
* **Mongoose Paginate V2** - Plugin de paginación para consultas de catálogo optimizadas.
* **Passport.js & JWT** - Estrategia centralizada para autenticación segura basada en tokens.
* **Cookie-Parser** - Gestión de credenciales mediante cookies seguras `HTTP-Only` y `SameSite`.
* **Nodemailer** - Servicio transaccional para envío automático de correos de confirmación.
* **Bcrypt** - Algoritmo de hashing criptográfico para resguardo de contraseñas.
* **Dotenv** - Gestión centralizada de variables de entorno.

---

## 📁 Arquitectura por Capas

La estructura del código sigue el patrón de diseño por capas recomendado para sistemas empresariales:

* `src/config/` - Configuración global de conexión a base de datos (`db.config.js`) y estrategias de Passport (`passport.config.js`).
* `src/controllers/` - Manejo de peticiones HTTP, extracción de parámetros/queries y formateo de respuestas sanitizadas.
* `src/services/` - Capa de negocio pura: validaciones de fechas, control de cupos, reglas operativas y servicio de correo (`MailService`).
* `src/repositories/` - Capa de abstracción intermedia para la orquestación de datos y aplicación de DTOs.
* `src/dtos/` - Data Transfer Objects (`UserDTO`, `EventDTO`, `TicketDTO`) para filtrar y proteger datos sensibles expuestos a la API.
* `src/dao/` - Data Access Objects para la interacción directa con la base de datos MongoDB.
* `src/models/` - Esquemas y modelos Mongoose (`user.model.js`, `event.model.js`, `ticket.model.js`).
* `src/middlewares/` - Middlewares de autenticación, control de accesos por roles (RBAC) e interceptores.
* `src/routes/` - Definición de endpoints y desacople de rutas (`session.routes.js`, `event.routes.js`, `ticket.routes.js`).
* `src/utils/` - Helpers de hashing, firma de JWTs y utilidades generales.

---

## ⚙️ Reglas de Negocio Principales

1. **Asignación de Creador/Organizador:** El campo `organizer` se inyecta automáticamente desde la identidad autenticada (`req.user`). Se bloquea la manipulación manual de dicho campo.
2. **Validación Temporal y Expiración:** Se rechaza la creación o modificación de eventos cuya fecha sea pasada. Asimismo, se bloquean las inscripciones a eventos cuya fecha de realización ya haya transcurrido (`event.date < new Date()`).
3. **Capacidad y Precio:** Reglas estrictas que exigen `capacity > 0` y `price >= 0`.
4. **Control de Cupos Dinámico:** El cálculo de vacantes activas solo contabiliza tickets con estado distinto a `'cancelled'`. Al cancelar una reserva, el cupo se libera automáticamente.
5. **Prevención de Duplicados:** Un usuario no puede generar más de una inscripción activa simultánea para el mismo evento.
6. **Borrado Lógico y Estado:** No existen eliminaciones físicas en la base de datos. Las cancelaciones de eventos o tickets se gestionan mediante un cambio de estado a `'cancelled'` registrando la fecha exacta en `cancelledAt`.

---

## 🛡️ Matriz de Permisos y Control de Acceso (RBAC)

El sistema discrimina las acciones según tres roles jerárquicos:

| Acción | Endpoint | `user` | `organizer` | `admin` |
| :--- | :--- | :---: | :---: | :---: |
| Consultar catálogo de eventos | `GET /api/events` | ✅ | ✅ | ✅ |
| Consultar evento por ID | `GET /api/events/:id` | ✅ | ✅ | ✅ |
| Crear evento | `POST /api/events` | ❌ | ✅ | ✅ |
| Actualizar evento propio | `PUT /api/events/:id` | ❌ | ✅ | ✅ |
| Actualizar cualquier evento | `PUT /api/events/:id` | ❌ | ❌ | ✅ |
| Cambiar estado evento propio | `PATCH /api/events/:id/status` | ❌ | ✅ | ✅ |
| Inscribirse a un evento | `POST /api/events/:eid/tickets` | ✅ | ✅ | ✅ |
| Consultar inscripciones propias | `GET /api/tickets/my-tickets` | ✅ | ✅ | ✅ |
| Ver inscriptos de evento propio | `GET /api/events/:eid/tickets` | ❌ | ✅ | ✅ |
| Cancelar ticket propio | `PATCH /api/tickets/:tid/cancel` | ✅ | ✅ | ✅ |
| Cancelar ticket ajeno | `PATCH /api/tickets/:tid/cancel` | ❌ | ❌ | ✅ |

---

## 🛣️ Endpoints Disponibles

### 🔒 Módulo de Autenticación (`/api/sessions`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/sessions/register` | Público | Registro de usuario (asigna rol `user` por defecto). |
| **POST** | `/api/sessions/login` | Público | Autentica credenciales y emite cookie `HTTP-Only`. |
| **GET** | `/api/sessions/current` | Autenticado | Retorna el DTO con el perfil del usuario activo. |
| **POST** | `/api/sessions/logout` | Autenticado | Destruye la cookie de sesión activa. |

### 📅 Módulo de Eventos (`/api/events`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/events` | Público | Listado paginado y filtrado de eventos. |
| **GET** | `/api/events/:id` | Público | Consulta de evento por ID. |
| **POST** | `/api/events` | `organizer`, `admin` | Creación de nuevo evento. |
| **PUT** | `/api/events/:id` | Dueño / `admin` | Modificación general de evento. |
| **PATCH** | `/api/events/:id/status` | Dueño / `admin` | Cambio de estado (`draft`, `published`, `cancelled`, `finished`). |

### 🎟️ Módulo de Inscripciones y Tickets (`/api/tickets` / `/api/events`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/events/:eid/tickets` | Autenticado | Inscripción a un evento (valida cupos, fecha vigente y envía email). |
| **GET** | `/api/tickets/my-tickets` | Autenticado | Consulta de las inscripciones del usuario en sesión (`populate`). |
| **GET** | `/api/events/:eid/tickets` | Creador / `admin` | Consulta de la lista de inscriptos a un evento propio. |
| **PATCH** | `/api/tickets/:tid/cancel` | Dueño / `admin` | Cancelación de reserva (borrado lógico y liberación de cupo). |

#### 🔍 Parámetros de Búsqueda y Paginación (`GET /api/events`)
* `status`: Filtra por estado exacto (`draft`, `published`, `cancelled`, `finished`).
* `category`: Filtra por categoría de evento.
* `location`: Búsqueda parcial por ubicación (insensible a mayúsculas/minúsculas).
* `dateFrom` / `dateTo`: Filtro por rango de fechas (`YYYY-MM-DD`).
* `page`: Número de página a consultar (por defecto: `1`).
* `limit`: Cantidad de registros por página (por defecto: `10`).
* `sort`: Criterio de ordenamiento (ej: `date` o `-date`).

---

## 🚫 Manejo de Errores Estándar

La API responde utilizando códigos de estado HTTP estandarizados y mensajes explicativos:

* **`400 Bad Request`**: Fallas de validación (cupos insuficientes, eventos pasados o finalizados, inscripciones duplicadas, evento no publicado).
* **`401 Unauthorized`**: Ausencia o invalidez del token JWT o de la cookie de sesión.
* **`403 Forbidden`**: Permisos insuficientes (p. ej., intentar modificar o consultar recursos de otro organizador).
* **`404 Not Found`**: Evento, usuario o ticket inexistente en la base de datos.
* **`500 Internal Server Error`**: Errores no controlados en el servidor o problemas de conectividad con la base de datos.

---

## ⚡ Guía de Prueba Rápida (Quick Start)

1. **Registrar un usuario:** Enviar petición a `POST /api/sessions/register`.
2. **Iniciar sesión:** Enviar credenciales a `POST /api/sessions/login` para recibir la cookie de sesión `HTTP-Only`.
3. **Inscribirse a un evento:** Enviar `POST /api/events/:eid/tickets` especificando la cantidad deseada (`quantity`).
4. **Verificar email:** Revisar la bandeja de entrada para verificar la recepción del correo de confirmación enviado vía Nodemailer.
5. **Consultar mis entradas:** Ejecutar `GET /api/tickets/my-tickets` para comprobar la relación poblada (`populate`) formateada por el DTO.

---

## 🔧 Instalación y Configuración

1. **Clonar el repositorio localmente:**
   ```bash
   git clone [https://github.com/IsaacCarboni/plataforma-events.git](https://github.com/IsaacCarboni/plataforma-events.git)
   cd plataforma-events
Instalar las dependencias del proyecto:

Bash
npm install
Crear el archivo .env en la raíz del proyecto basado en .env.example:

Fragmento de código
PORT=8080
NODE_ENV=development
MONGO_URL=tu_cadena_de_conexion_mongodb
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRES_IN=1h

# Configuración de Email (Nodemailer)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_email@gmail.com
MAIL_PASS=tu_app_password
MAIL_FROM="Plataforma Eventos <tu_email@gmail.com>"
Iniciar el servidor en entorno de desarrollo:

Bash
npm run dev
👤 Autor
Isaac Carboni - Full Stack Developer en formación (Coderhouse).