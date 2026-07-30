Acá tenés el README.md completo, impecable y con la nueva regla de negocio de validación de fecha integrada en la sección correspondiente, listo para copiar y pegar sin errores sintácticos de Markdown.

Markdown
# 🚀 Plataforma de Eventos e Inscripciones

API REST para la gestión integrada de eventos, usuarios e inscripciones en tiempo real con control dinámico de cupos y notificaciones por email, construida con **Node.js**, **Express** y **MongoDB Atlas**.

El proyecto implementa una **arquitectura por capas independientes** (Controllers, Services, DAO/Repositories, Models, Middlewares) garantizando la separación de responsabilidades, alta escalabilidad y fácil mantenimiento.

---

## 🛠️ Tecnologías Utilizadas

*   **Node.js** - Entorno de ejecución de JavaScript en el servidor (ES Modules).
*   **Express.js** - Framework web para el desarrollo de la API REST.
*   **MongoDB Atlas & Mongoose** - Base de datos NoSQL y modelado de datos con validaciones de schema.
*   **Mongoose Paginate V2** - Plugin de paginación para consultas optimizadas.
*   **Passport.js & JWT** - Estrategia centralizada para autenticación segura mediante tokens.
*   **Cookie-parser** - Gestión de cookies criptográficas `HTTP-Only` del lado del cliente.
*   **Nodemailer** - Servicio de envío automático de correos electrónicos transaccionales.
*   **Bcrypt** - Hashing seguro de contraseñas mediante salting.
*   **Dotenv** - Manejo seguro de variables de entorno.

---

## 📁 Arquitectura por Capas

*   `src/config/` - Configuración global de conexión a MongoDB y estrategias de Passport.
*   `src/controllers/` - Captura de peticiones HTTP, parseo de parámetros y formateo de respuestas.
*   `src/services/` - Núcleo del sistema: reglas de negocio, control de cupos y servicio de correo (`MailService`).
*   `src/dao/` / `src/repositories/` - Abstracción para el acceso y persistencia de datos.
*   `src/models/` - Esquemas y modelos Mongoose (`User`, `Event`, `Ticket`).
*   `src/middlewares/` - Autenticación, control de acceso basado en roles (RBAC) e interceptores.
*   `src/routes/` - Definición de endpoints y mapeo de middlewares.
*   `src/utils/` - Funciones auxiliares de hashing y tokens.

---

## ⚙️ Reglas de Negocio Principales

1.  **Asignación de Creador/Organizador:** El campo `organizer` se inyecta automáticamente desde la identidad autenticada (`req.user`). No se permite la manipulación manual de dicho campo.
2.  **Validación Temporal y Expiración:** Se rechaza la creación o modificación de eventos cuya fecha sea pasada. Asimismo, se bloquean las inscripciones a eventos cuya fecha de realización ya haya finalizado (`event.date < new Date()`).
3.  **Capacidad y Precio:** Reglas estrictas que exigen `capacity > 0` y `price >= 0`.
4.  **Control de Cupos Dinámico:** El cálculo de vacantes activas solo contabiliza tickets con estado distinto a `'cancelled'`. Al cancelar una reserva, el cupo se libera automáticamente.
5.  **Prevención de Duplicados:** Un usuario no puede generar más de una inscripción activa simultánea para el mismo evento.
6.  **Borrado Lógico y Estado:** No existen eliminaciones físicas en la base de datos. Las cancelaciones de eventos o tickets se gestionan mediante un cambio de estado a `'cancelled'` registrando la fecha en `cancelledAt`.

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
| **GET** | `/api/sessions/current` | Autenticado | Retorna el perfil del usuario activo. |
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
*   `status`: Filtra por estado exacto (`draft`, `published`, `cancelled`, `finished`).
*   `category`: Filtra por categoría de evento.
*   `location`: Búsqueda parcial por ubicación (insensible a mayúsculas).
*   `dateFrom` / `dateTo`: Filtro por rango de fechas (`YYYY-MM-DD`).
*   `page`: Número de página a consultar (default: `1`).
*   `limit`: Cantidad de registros por página (default: `10`).
*   `sort`: Criterio de ordenamiento (ej: `date` o `-date`).

---

## ⚡ Guía de Prueba Rápida (Quick Start)

1. **Registrar un usuario** en `POST /api/sessions/register`.
2. **Iniciar sesión** en `POST /api/sessions/login` para recibir la cookie de sesión `HTTP-Only`.
3. **Inscribirse a un evento** enviando `POST /api/events/:eid/tickets` con la cantidad deseada (`quantity`).
4. **Verificar email:** Revisar la bandeja de entrada para verificar la recepción del correo de confirmación enviado vía Nodemailer.
5. **Consultar mis entradas:** Ejecutar `GET /api/tickets/my-tickets` para comprobar la relación poblada (`populate`) con el evento.

---

## ✉️ Configuración de Notificaciones (Nodemailer)

El sistema genera notificaciones por correo de forma automática tras completar cada reserva exitosamente. Requiere definir las siguientes variables en el entorno (`.env`):

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_email@gmail.com
MAIL_PASS=tu_contraseña_de_aplicacion
MAIL_FROM="Plataforma Eventos <tu_email@gmail.com>"
🚫 Manejo de Errores Estándar
400 Bad Request: Fallas de validación (cupos insuficientes, eventos finalizados, inscripciones duplicadas, evento no publicado).

401 Unauthorized: Ausencia o invalidez del token JWT / cookie de sesión.

403 Forbidden: Permisos insuficientes (intentar cancelar un ticket ajeno o consultar inscriptos sin ser el organizador).

404 Not Found: Evento o ticket inexistente en la base de datos.

🔧 Instalación y Configuración
Clonar el repositorio localmente:

Bash
git clone [https://github.com/IsaacCarboni/plataforma-events.git](https://github.com/IsaacCarboni/plataforma-events.git)
cd plataforma-events
Instalar las dependencias del proyecto:

Bash
npm install
Crear un archivo .env en la raíz del proyecto basado en .env.example:

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