# 🚀 Plataforma de Eventos e Inscripciones

API REST para la gestión integrada de eventos, usuarios e inscripciones en tiempo real, construida con **Node.js**, **Express** y **MongoDB Atlas**.

El proyecto implementa una **arquitectura por capas independientes** (Controllers, Services, DAO/Repositories, Models, Middlewares) garantizando la separación de responsabilidades, alta escalabilidad y fácil mantenimiento.

---

## 🛠️ Tecnologías Utilizadas

*   **Node.js** - Entorno de ejecución de JavaScript en el servidor (ES Modules).
*   **Express.js** - Framework web para el desarrollo de la API REST.
*   **MongoDB Atlas & Mongoose** - Base de datos NoSQL y modelado con validaciones de schema.
*   **Mongoose Paginate V2** - Plugin de paginación para consultas optimizadas.
*   **Passport.js & JWT** - Estrategia centralizada para autenticación segura mediante tokens.
*   **Cookie-parser** - Gestión de cookies criptográficas `HTTP-Only` del lado del cliente.
*   **Bcrypt** - Hashing de contraseñas con salting.
*   **Dotenv** - Manejo seguro de variables de entorno.

---

## 📁 Arquitectura por Capas

*   `src/config/` - Configuración global de conexión a MongoDB y estrategias de Passport.
*   `src/controllers/` - Captura de peticiones HTTP, parseo de parámetros y formateo de respuestas.
*   `src/services/` - Núcleo del sistema: reglas de negocio y validaciones del dominio.
*   `src/dao/` / `src/repositories/` - Abstracción para el acceso y persistencia de datos.
*   `src/models/` - Esquemas y modelos Mongoose (`User`, `Event`).
*   `src/middlewares/` - Autenticación, control de acceso basado en roles (RBAC) e interceptores.
*   `src/routes/` - Definición de endpoints y mapeo de middlewares.
*   `src/utils/` - Funciones auxiliares de hashing y tokens.

---

## ⚙️ Reglas de Negocio Principales

1.  **Asignación de Organizador:** El campo `organizer` se inyecta automáticamente desde la identidad autenticada (`req.user`). No se permite la manipulación manual de dicho campo en el cuerpo de la petición.
2.  **Validación Temporal:** Se rechaza la creación o modificación de eventos cuya fecha sea pasada o no válida.
3.  **Capacidad y Precio:** Reglas estrictas que exigen `capacity > 0` y `price >= 0`.
4.  **Control de Propiedad (Ownership):** Un usuario con rol `organizer` únicamente puede modificar o alterar el estado de sus propios eventos. El usuario `admin` posee permisos globales.
5.  **Borrado Lógico y Estado:** No existen eliminaciones físicas en la base de datos. La cancelación se realiza mediante un cambio de estado a `'cancelled'`. Los eventos cancelados o finalizados quedan bloqueados para futuras ediciones.

---

## 🛡️ Matriz de Permisos y Control de Acceso (RBAC)

El sistema discrimina las acciones según tres roles jerárquicos:

| Acción | Endpoint | `user` | `organizer` | `admin` |
| :--- | :--- | :---: | :---: | :---: |
| Consultar catálogo | `GET /api/events` | ✅ | ✅ | ✅ |
| Consultar por ID | `GET /api/events/:id` | ✅ | ✅ | ✅ |
| Crear evento | `POST /api/events` | ❌ | ✅ | ✅ |
| Actualizar evento propio | `PUT /api/events/:id` | ❌ | ✅ | ✅ |
| Actualizar cualquier evento | `PUT /api/events/:id` | ❌ | ❌ | ✅ |
| Cambiar estado evento propio | `PATCH /api/events/:id/status` | ❌ | ✅ | ✅ |
| Cambiar estado cualquier evento | `PATCH /api/events/:id/status` | ❌ | ❌ | ✅ |

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

#### 🔍 Parámetros de Búsqueda y Paginación (`GET /api/events`)
*   `status`: Filtra por estado exacto.
*   `category`: Filtra por categoría.
*   `location`: Búsqueda parcial por ubicación (case-insensitive).
*   `dateFrom` / `dateTo`: Rango de fechas.
*   `page`: Número de página (default: `1`).
*   `limit`: Límite de registros por página (default: `10`).
*   `sort`: Criterio de ordenamiento (ej: `date` o `-date`).

---

## ⚡ Guía de Prueba Rápida (Quick Start)

1. **Registrar un usuario** en `POST /api/sessions/register`.
2. **Iniciar sesión** en `POST /api/sessions/login` para recibir la cookie `HTTP-Only`.
3. **Crear un evento** en `POST /api/events` asegurándote de que la cuenta tenga el rol `organizer` o `admin`.
4. **Consultar el catálogo** en `GET /api/events?page=1&limit=5` para verificar la paginación.

---

## 🚫 Manejo de Errores

*   **`400 Bad Request`:** Fallas en validaciones de negocio (fechas pasadas, datos inválidos, capacidades negativas).
*   **`401 Unauthorized`:** Ausencia o invalidez del token JWT / cookie de sesión.
*   **`403 Forbidden`:** Permisos insuficientes (rol no autorizado o intento de modificar un evento ajeno).
*   **`404 Not Found`:** Recurso inexistente en la base de datos.

---

## 🔧 Instalación y Configuración

1. Clonar el repositorio:
   ```bash
   git clone [https://github.com/IsaacCarboni/plataforma-events.git](https://github.com/IsaacCarboni/plataforma-events.git)
   cd plataforma-events
Instalar dependencias:

Bash
npm install
Crear un archivo .env en la raíz del proyecto:

Fragmento de código
PORT=8080
NODE_ENV=development
MONGO_URL=tu_cadena_de_conexion_mongodb
JWT_SECRET=tu_clave_secreta_jwt
Iniciar en entorno de desarrollo:

Bash
npm run dev
👤 Autor
Isaac Carboni - Full Stack Developer en formación (Coderhouse).