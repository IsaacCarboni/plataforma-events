# 🚀 Plataforma de Eventos e Inscripciones

API REST profesional desarrollada con **Node.js** y **Express** para la gestión integrada de eventos, usuarios e inscripciones en tiempo real. 

Este sistema está diseñado bajo una **arquitectura limpia organizada por capas independientes** (Controllers, Services, DAO/Repositories, Models, Middlewares) para garantizar su escalabilidad, seguridad y fácil mantenimiento.

---

## 📁 Estructura de Arquitectura por Capas

El proyecto implementa una separación de intereses estricta basada en la siguiente estructura modular:

*   **`src/config/`** - Configuraciones globales del sistema (Base de datos MongoDB y estrategias de Passport).
*   **`src/routes/`** - Enrutadores encargados de capturar y redirigir las solicitudes HTTP.
*   **`src/controllers/`** - Controladores que gestionan la captura de solicitudes y respuestas HTTP.
*   **`src/models/`** - Esquemas y modelos de datos de Mongoose (`User`, `Event`).
*   **`src/services/`** - Capa central para el procesamiento estricto de las reglas de negocio.
*   **`src/dao/`** / **`src/repositories/`** - Abstracción de acceso a datos para aislar la persistencia en MongoDB.
*   **`src/middlewares/`** - Interceptores globales, control de roles (RBAC) y validación de sesiones/tokens.
*   **`src/utils/`** - Funciones auxiliares (Hashing con Bcrypt, firma de JWT).

---

## 🛠️ Tecnologías Utilizadas

*   **Node.js** - Entorno de ejecución para JavaScript en el servidor utilizando ES Modules (`import`/`export`).
*   **Express** - Framework web ágil para el desarrollo de la API.
*   **MongoDB Atlas & Mongoose** - Base de datos NoSQL en la nube y modelado de datos con validaciones de schema.
*   **Mongoose Paginate V2** - plugin de paginación para consultas eficientes en la base de datos.
*   **Passport.js** - Motor de autenticación centralizado mediante estrategias locales y JWT.
*   **JSON Web Tokens (JWT)** - Firma y manejo de tokens para la gestión de sesiones seguras.
*   **Cookie-parser** - Middleware para interceptar y gestionar cookies criptográficas del lado del cliente (`HTTP-Only`).
*   **Bcrypt** - Algoritmo de hashing seguro para la protección de contraseñas mediante salting.
*   **Dotenv** - Gestión de variables de entorno globales.

---

## 🛡️ Matriz de Permisos y Control de Acceso (RBAC)

El sistema cuenta con un motor de autorización basado en tres roles definidos de forma estricta:

| Acción / Endpoint | `user` | `organizer` | `admin` |
| :--- | :---: | :---: | :---: |
| Consultar eventos (`GET /api/events`) | ✅ | ✅ | ✅ |
| Consultar evento por ID (`GET /api/events/:id`) | ✅ | ✅ | ✅ |
| Crear eventos (`POST /api/events`) | ❌ | ✅ | ✅ |
| Modificar evento propio (`PUT /api/events/:id`) | ❌ | ✅ | ✅ |
| Modificar evento ajeno (`PUT /api/events/:id`) | ❌ | ❌ | ✅ |
| Cambiar estado / Cancelar evento propio | ❌ | ✅ | ✅ |
| Cambiar estado / Cancelar evento ajeno | ❌ | ❌ | ✅ |

---

## ⚙️ Reglas de Negocio Principales (Capa Services)

1. **Asignación de Organizador:** Al crear un evento, el campo `organizer` se asigna automáticamente a través del ID extraído de `req.user` (Token/Cookie activa). No se permite la inyección manual desde el cuerpo de la petición (`req.body`).
2. **Validación Temporaria de Fechas:** No se permite crear ni reprogramar eventos con fechas pasadas ni inválidas.
3. **Validación de Capacidad y Precio:** La capacidad debe ser estricta (`capacity > 0`) y el precio no puede ser negativo (`price >= 0`).
4. **Protección de Propiedad (Ownership):** Un usuario con rol `organizer` solo puede editar o cambiar el estado de los eventos que haya creado. El rol `admin` posee permisos globales de modificación.
5. **Control de Estados y Borrado Lógico:** Un evento cancelado (`status: 'cancelled'`) o finalizado (`status: 'finished'`) no puede ser modificado. La cancelación de un evento no elimina el registro de la base de datos, sino que realiza un cambio de estado a `'cancelled'`.

---

## 🛣️ Endpoints Disponibles

### 📅 Módulo de Eventos (`/api/events`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/events` | Público | Obtiene la lista paginada y filtrada de eventos. |
| **GET** | `/api/events/:id` | Público | Recupera un evento específico por su `ID`. |
| **POST** | `/api/events` | `organizer`, `admin` | Crea un nuevo evento en el sistema. |
| **PUT** | `/api/events/:id` | Dueño o `admin` | Modifica la información general de un evento. |
| **PATCH** | `/api/events/:id/status` | Dueño o `admin` | Actualiza el estado (`draft`, `published`, `cancelled`, `finished`). |

#### 🔍 Filtros y Paginación Disponibles (`GET /api/events`)
Permite aplicar parámetros mediante *Query Strings*:
*   `status`: Filtra por estado (`draft`, `published`, `cancelled`, `finished`).
*   `category`: Filtra por categoría exacta (ej: `workshop`, `conference`).
*   `location`: Búsqueda parcial por ubicación (insensible a mayúsculas).
*   `dateFrom` / `dateTo`: Filtro por rango de fechas (`YYYY-MM-DD`).
*   `page`: Número de página a consultar (por defecto: `1`).
*   `limit`: Cantidad de registros por página (por defecto: `10`).
*   `sort`: Criterio de ordenamiento (ej: `date` o `-date` para descendente).

---

### 🔒 Módulo de Autenticación & Sesiones (`/api/sessions`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/sessions/register` | Público | Registra un nuevo usuario con hash Bcrypt automático (asigna `user` por defecto). |
| **POST** | `/api/sessions/login` | Público | Valida credenciales, genera el JWT y lo almacena en una cookie `HTTP-Only`. |
| **GET** | `/api/sessions/current` | Autenticado | Retorna el perfil del usuario activo extraído del JWT. |
| **POST** | `/api/sessions/logout` | Autenticado | Elimina la cookie de sesión del cliente. |

---

## 🚫 Respuestas de Error Estándar

*   **`400 Bad Request`:** Errores de validación de negocio (fechas pasadas, capacidades negativas, estado inválido, etc.).
*   **`401 Unauthorized`:** Token/Cookie de sesión faltante, inválido o expirado.
*   **`403 Forbidden`:** El usuario no posee el rol necesario o intenta modificar un evento del cual no es creador.
*   **`404 Not Found`:** Recurso o evento no encontrado en la base de datos.

---

## 🔧 Instalación y Configuración

1. Clonar el repositorio localmente:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd plataforma-events
Instalar las dependencias del proyecto:

Bash
npm install
Crear el archivo .env en la raíz del proyecto basado en las siguientes variables:

Fragmento de código
PORT=8080
NODE_ENV=development
MONGO_URL=tu_cadena_de_conexion_de_mongo_atlas
JWT_SECRET=tu_palabra_secreta_para_firmar_tokens
Iniciar el servidor en desarrollo:

Bash
npm run dev
👤 Autor
Isaac Carboni - Desarrollador Full Stack en formación (Coderhouse).