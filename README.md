# 🚀 Plataforma de Eventos e Inscripciones & Módulo de Gestión de Stock (ShipNow Base)

API RESTful empresarial para la gestión integral de eventos, reservas de tickets en tiempo real y administración modular de inventario/stock. Implementa una estrategia de caché de alta velocidad con **Redis**, documentación interactiva con **Swagger**, arquitectura desacoplada en **3 capas** y containerización completa con **Docker & Docker Compose**.

---

## 🛠️ Tecnologías Utilizadas

* **Node.js & Express.js** - Entorno de ejecución en el servidor (ES Modules) y framework HTTP.
* **Redis** - In-Memory Data Store para caché de lecturas, logrando tiempos de respuesta sub-milisegundo (~1.9 ms).
* **MongoDB Atlas & Mongoose** - Persistencia NoSQL con modelado mediante Schemas estrictos e índices compuestos.
* **Docker & Docker Compose** - Orquestación de contenedores en entorno aislado.
* **Swagger / OpenAPI 3.0** - Documentación interactiva de la API integrada.
* **Passport.js & JWT** - Autenticación centralizada mediante cookies seguras `HTTP-Only`.
* **Multer** - Middleware para procesamiento y carga de imágenes de productos sanitizadas.
* **Nodemailer** - Servicio transaccional para envío automático de confirmaciones.
* **Bcrypt** - Hashing criptográfico para protección de contraseñas.
* **Dotenv** - Manejo y validación centralizada de variables de entorno al arranque.

---

## 📐 Justificación de Arquitectura (Service vs Repository)

En cumplimiento con los requerimientos de arquitectura en 3 capas del proyecto:

* **Capa de Servicio (`src/services/`):** Concentra la **lógica de negocio pura** del dominio. Se encarga de procesar las reglas (validación de cupos, cálculo de vencimientos de stock, filtros de permisos) sin conocer detalles técnicos de la base de datos ni depender de Mongoose.
* **Capa de Repositorio (`src/repositories/`):** Abstrae la **persistencia y acceso a datos**. Es la única capa con conocimiento de Mongoose y MongoDB Atlas. Permite que, si en el futuro se cambia la base de datos o el ORM/ODM, la capa de servicio se mantenga intacta.

---

## 🏗️ Arquitectura por Capas

El proyecto sigue el patrón de arquitectura desacoplada y el principio de responsabilidad única (SRP):

* `src/config/` - Configuración y validación del entorno (`env.config.js`, `db.config.js`, `redis.config.js`, `swagger.js`, `passport.config.js`).
* `src/controllers/` - Manejo de peticiones HTTP, parseo de parámetros/queries y respuestas sanitizadas.
* `src/services/` - Lógica de negocio pura: validaciones temporales, control de cupos y alertas de stock/vencimientos.
* `src/repositories/` - Capa de abstracción de datos para desacoplar Mongoose/MongoDB de la capa de servicio.
* `src/dtos/` - Data Transfer Objects (`UserDTO`, `EventDTO`, `TicketDTO`) para filtrar y proteger datos sensibles.
* `src/models/` - Esquemas Mongoose (`user.model.js`, `event.model.js`, `ticket.model.js`, `product.model.js`).
* `src/constants/` - Diccionario congelado (`Object.freeze`) para roles y estados del sistema.
* `src/middlewares/` - Autenticación JWT, control de accesos por roles (RBAC), manejo de errores y caché con Redis.
* `src/routes/` - Definición de enrutadores principales (`session.routes.js`, `event.routes.js`, `ticket.routes.js`, `products.router.js`, `user.routes.js`).
* `src/utils/` - Helpers de hashing, firma de JWTs y cargador de archivos (`uploader`).

---

## ⚡ Estrategia de Caché y Performance (Redis)

* **Cache Miss:** Si los datos no residen en memoria, se consulta MongoDB y se almacenan en Redis con un TTL (Time-To-Live).
* **Cache Hit:** Las lecturas subsecuentes son servidas desde RAM en tiempo récord (~1.9 ms).
* **Invalidación Automática:** Mutaciones en base de datos (`POST`, `PUT`, `DELETE`, `PATCH`) invalidan la caché para asegurar la consistencia.

---

## ⚙️ Reglas de Negocio Principales

1. **Gestión de Stock y Trazabilidad:** Monitoreo de cortes de carne, volumen en kilos/unidades y control de fechas de vencimiento con alertas programadas.
2. **Inyecciones de Identidad:** El organizador/creador de eventos o productos se mapea automáticamente mediante el token autenticado (`req.user`).
3. **Control Dinámico de Cupos:** El cálculo de vacantes activas descuenta tickets cancelados de forma automática.
4. **Prevención de Duplicados:** Un usuario no puede registrar múltiples reservas activas simultáneas para el mismo evento.
5. **Borrado Lógico:** Las cancelaciones y bajas no destruyen registros físicos; actualizan estados a `'cancelled'` y registran timestamps de trazabilidad.

---

## 🛡️ Matriz de Permisos y Control de Acceso (RBAC)

| Acción | Endpoint | `user` | `organizer` | `admin` |
| :--- | :--- | :---: | :---: | :---: |
| Consultar eventos y catálogo de productos | `GET /api/events` / `GET /api/products` | ✅ | ✅ | ✅ |
| Consultar productos próximos a vencer | `GET /api/products/expiring` | ❌ | ✅ | ✅ |
| Crear eventos o productos | `POST /api/events` / `POST /api/products` | ❌ | ✅ | ✅ |
| Modificar o eliminar productos/eventos | `PUT` / `DELETE` | ❌ | Creador | ✅ |
| Reservar tickets | `POST /api/events/:eid/tickets` | ✅ | ✅ | ✅ |
| Consultar tickets propios | `GET /api/tickets/my-tickets` | ✅ | ✅ | ✅ |
| Cancelar reservación | `PATCH /api/tickets/:tid/cancel` | Dueño | Dueño | ✅ |

---

## 🛣️ Endpoints Principales

### 🔒 Autenticación (`/api/sessions`)
* `POST /api/sessions/register` - Registro público de usuarios.
* `POST /api/sessions/login` - Autenticación y generación de cookie `HTTP-Only`.
* `GET /api/sessions/current` - Perfil de sesión activa mediante DTO.
* `POST /api/sessions/logout` - Cierre de sesión y destrucción de cookie.

### 📅 Eventos (`/api/events`)
* `GET /api/events` - Listado de eventos paginado y cacheado en Redis.
* `POST /api/events` - Creación de evento (requiere rol `organizer` o `admin`).

### 🥩 Stock y Carnicería (`/api/products`)
* `GET /api/products` - Catálogo completo de productos con filtros y paginación.
* `GET /api/products/expiring` - Reporte de cortes/productos próximos a vencer.
* `POST /api/products` - Registro de nuevos productos con imagen vía Multer.

---

## 📄 Documentación Interactiva (Swagger)

Accedé a la documentación interactiva OpenAPI 3.0 con el servidor iniciado:
👉 **`http://localhost:8080/api/docs`**

---

## 🐳 Ejecución con Docker (Recomendado)

1. Crear el archivo `.env` en la raíz del proyecto basándose en `.env.example`.
2. Desplegar los servicios:
   ```bash
   docker-compose up --build
Detener los contenedores:

Bash
docker-compose down
👤 Autor
Isaac Carboni - Backend Developer

GitHub Profile