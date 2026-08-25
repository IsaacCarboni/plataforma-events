# 🚀 Plataforma de Eventos e Inscripciones

API REST profesional para la gestión integrada de eventos, usuarios e inscripciones en tiempo real con control dinámico de cupos, estrategia de caché de alta velocidad con **Redis**, documentación interactiva con **Swagger**, completamente aislada en contenedores mediante **Docker** y **Docker Compose**.

El proyecto implementa una **Arquitectura en Capas Independientes y Desacopladas** (Controllers, Services, Repositories, DAO, DTOs, Models, Middlewares) siguiendo los estándares de diseño Backend modernos, garantizando separación de responsabilidades, seguridad, alta escalabilidad y rendimiento óptimo.

---

## 🛠️ Tecnologías Utilizadas

* **Node.js & Express.js** - Entorno de ejecución en el servidor (ES Modules) y framework de ruteo HTTP.
* **Redis** - In-Memory Data Store para caché de lecturas, reduciendo los tiempos de respuesta a niveles sub-milisegundo.
* **MongoDB Atlas & Mongoose** - Base de datos NoSQL en la nube con modelado mediante Schemas estrictos.
* **Docker & Docker Compose** - Containerización y orquestación multi-contenedor para entorno aislado.
* **Swagger / OpenAPI 3.0** - Documentación interactiva de la API integrada.
* **Passport.js & JWT** - Estrategia centralizada de autenticación mediante cookies seguras `HTTP-Only`.
* **Nodemailer** - Servicio transaccional para envío automático de correos de confirmación.
* **Bcrypt** - Hashing criptográfico para protección de contraseñas.
* **Dotenv** - Gestión centralizada de variables de entorno.

---

## 📁 Arquitectura por Capas

La estructura del código sigue el patrón de diseño por capas recomendado para sistemas empresariales:

* `src/config/` - Configuración de base de datos (`db.config.js`), cliente Redis (`redis.config.js`), Swagger (`swagger.js`) y Passport (`passport.config.js`).
* `src/controllers/` - Manejo de peticiones HTTP, extracción de parámetros/queries y respuestas sanitizadas.
* `src/services/` - Capa de negocio pura: validaciones de fechas, control de cupos y servicio de correo (`MailService`).
* `src/repositories/` - Capa de abstracción intermedia para la orquestación de datos y aplicación de DTOs.
* `src/dtos/` - Data Transfer Objects (`UserDTO`, `EventDTO`, `TicketDTO`) para filtrar y proteger datos sensibles.
* `src/dao/` - Data Access Objects para la interacción directa con la base de datos MongoDB.
* `src/models/` - Esquemas y modelos Mongoose (`user.model.js`, `event.model.js`, `ticket.model.js`).
* `src/middlewares/` - Autenticación, control de accesos por roles (RBAC), interceptores de errores y middleware de caché de Redis.
* `src/routes/` - Definición de endpoints y desacople de rutas (`session.routes.js`, `event.routes.js`, `ticket.routes.js`).
* `src/utils/` - Helpers de hashing, firma de JWTs y utilidades generales.

---

## ⚡ Estrategia de Caché e Performance (Redis)

Para optimizar las lecturas frecuentes y reducir el tráfico a MongoDB Atlas:

* **Cache Miss:** Si la información no reside en RAM, se consulta la base de datos y se almacena en Redis con un tiempo de expiración (TTL).
* **Cache Hit:** Las solicitudes posteriores son servidas directamente desde la memoria de Redis, logrando tiempos de respuesta de **~1.9 ms**.
* **Invalidación Automática:** Cualquier creación, modificación o cancelación de evento/ticket invalida la caché correspondiente para mantener la consistencia de datos.

---

## ⚙️ Reglas de Negocio Principales

1. **Asignación de Creador/Organizador:** El campo `organizer` se inyecta automáticamente desde la identidad autenticada (`req.user`). Se bloquea la manipulación manual.
2. **Validación Temporal y Expiración:** Se rechaza la creación o modificación de eventos cuya fecha sea pasada. Asimismo, se bloquean las inscripciones a eventos finalizados (`event.date < new Date()`).
3. **Capacidad y Precio:** Reglas estrictas que exigen `capacity > 0` y `price >= 0`.
4. **Control de Cupos Dinámico:** El cálculo de vacantes activas solo contabiliza tickets con estado distinto a `'cancelled'`. Al cancelar una reserva, el cupo se libera automáticamente.
5. **Prevención de Duplicados:** Un usuario no puede generar más de una inscripción activa simultánea para el mismo evento.
6. **Borrado Lógico y Estado:** No existen eliminaciones físicas en la base de datos. Las cancelaciones se gestionan mediante un cambio de estado a `'cancelled'` registrando la fecha en `cancelledAt`.

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
| **GET** | `/api/events` | Público | Listado paginado y filtrado de eventos (Optimizado con Redis). |
| **GET** | `/api/events/:id` | Público | Consulta de evento por ID (Optimizado con Redis). |
| **POST** | `/api/events` | `organizer`, `admin` | Creación de nuevo evento e invalidación de caché. |
| **PUT** | `/api/events/:id` | Dueño / `admin` | Modificación general de evento e invalidación de caché. |
| **PATCH** | `/api/events/:id/status` | Dueño / `admin` | Cambio de estado (`draft`, `published`, `cancelled`, `finished`). |

### 🎟️ Módulo de Inscripciones y Tickets (`/api/tickets` / `/api/events`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/events/:eid/tickets` | Autenticado | Inscripción a un evento (valida cupos, fecha vigente y envía email). |
| **GET** | `/api/tickets/my-tickets` | Autenticado | Consulta de las inscripciones del usuario en sesión (`populate`). |
| **GET** | `/api/events/:eid/tickets` | Creador / `admin` | Consulta de la lista de inscriptos a un evento propio. |
| **PATCH** | `/api/tickets/:tid/cancel` | Dueño / `admin` | Cancelación de reserva (borrado lógico y liberación de cupo). |

---

## 📄 Documentación Interactiva (Swagger)

La API cuenta con documentación viva generada mediante **OpenAPI 3.0**. Una vez iniciada la aplicación, podés explorar y probar todos los endpoints desde el navegador en:

👉 **`http://localhost:8080/api/docs`**

---

## 🐳 Ejecución con Docker (Recomendado)

El proyecto orquesta tanto el servicio Node.js como la instancia de **Redis Stack** en contenedores aislados:

1. **Configurar las variables de entorno:**
   Creá el archivo `.env` en la raíz del proyecto agregando las credenciales necesarias y la dirección del servicio Redis (`REDIS_URL=redis://plataforma-events-redis:6379`).

2. **Levantar la infraestructura completa:**
   ```bash
   docker-compose up --build
Detener la ejecución:

Bash
docker-compose down
🔧 Instalación Local Alternativa
Si preferís ejecutar la aplicación directamente en Node.js local (requiere un servidor Redis corriendo en local o remoto):

Clonar el repositorio:

Bash
git clone [https://github.com/IsaacCarboni/plataforma-events.git](https://github.com/IsaacCarboni/plataforma-events.git)
cd plataforma-events
Instalar dependencias:

Bash
npm install
Configurar variables de entorno (.env):

Fragmento de código
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb+srv://<usuario>:<password>@cluster0.xxx.mongodb.net/plataforma_events
REDIS_URL=redis://localhost:6379
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRES_IN=1h

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_email@gmail.com
MAIL_PASS=tu_app_password
MAIL_FROM="Plataforma Eventos <tu_email@gmail.com>"
Iniciar en desarrollo:

Bash
npm run dev
👤 Autor
Isaac Carboni - Backend Developer

GitHub Profile 