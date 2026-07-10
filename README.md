# 🚀 Plataforma de Eventos e Inscripciones

API REST profesional desarrollada con Node.js y Express para la gestión integrada de eventos, usuarios e inscripciones en tiempo real. Este sistema está diseñado bajo una arquitectura limpia organizada por capas independientes para garantizar su escalabilidad y mantenibilidad.

---

## 📁 Estructura de Arquitectura por Capas
El proyecto implementa una separación de intereses estricta basada en la siguiente estructura:
* `src/config/` - Configuraciones globales del sistema (Bases de datos y estrategias de Passport).
* `src/routes/` - Enrutadores encargados de capturar y redirigir las solicitudes HTTP.
* `src/controllers/` - Controladores que gestionan la lógica de negocio principal.
* `src/models/` - Esquemas y modelos de datos definidos con Mongoose.
* `src/services/` - Capa intermedia para el procesamiento de reglas de negocio.
* `src/repositories/` - Capa encargada de aislar el acceso a datos.
* `src/dao/` - Objetos de Acceso a Datos (Data Access Objects).
* `src/middlewares/` - Interceptores globales y de validación de peticiones.
* `src/utils/` - Funciones auxiliares (Hashing, JWT) y herramientas reutilizables.

---

## 🛠️ Tecnologías Utilizadas
* **Node.js** - Entorno de ejecución para JavaScript en el servidor.
* **Express** - Framework web para el desarrollo de la API.
* **MongoDB Atlas & Mongoose** - Base de datos NoSQL y modelado de datos corporativo.
* **Passport.js** - Motor centralizado de autenticación mediante estrategias locales y JWT.
* **JSON Web Tokens (JWT)** - Firma y manejo de tokens para sesiones seguras de usuario.
* **Cookie-parser** - Middleware para interceptar y gestionar cookies criptográficas del lado del cliente.
* **Bcrypt** - Algoritmo de hashing seguro para la protección de contraseñas.
* **Dotenv** - Gestión estricta de variables de entorno globales.

---

## 🛣️ Endpoints Disponibles

### 📡 Estado del Servidor
* `GET /api/health` - Devuelve el estado actual de salud y operatividad del servidor.

### 📅 Módulo de Eventos (`/api/events`)
* `GET /api/events` - Recupera la lista completa de eventos registrados mediante el controlador.
* `POST /api/events` - Registra un nuevo evento en el sistema de manera persistente.

### 🔒 Módulo de Autenticación & Sesiones (`/api/sessions`)
Lógica de autenticación robusta gestionada íntegramente por middlewares de **Passport**:

| Método | Endpoint | Descripción | Middleware de Seguridad |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/sessions/register` | Registra un nuevo usuario aplicando hash Bcrypt automático a la contraseña. | `passport-local` ('register') |
| **POST** | `/api/sessions/login` | Valida credenciales, genera el JWT y lo almacena en una cookie HTTP Only (`currentUser`). | `passport-local` ('login') |
| **GET** | `/api/sessions/current` | Extrae la cookie del request de forma transparente, valida el token y retorna el perfil activo. | `passport-jwt` ('current') |
| **POST** | `/api/sessions/logout` | Limpia de manera definitiva la cookie criptográfica, destruyendo la sesión del cliente. | Controlador Directo |

---

## 🔧 Instalación y Configuración

1. Clonar el repositorio de forma local de manera independiente.
2. Ejecutar la instalación de dependencias esenciales de Node.js:
   ```bash
   npm install
Configurar el entorno creando un archivo .env en la raíz basado en la plantilla .env.example:

Fragmento de código
PORT=8080
NODE_ENV=development
MONGO_URL=tu_cadena_de_conexion_de_mongo_atlas
JWT_SECRET=tu_palabra_secreta_para_firmar_tokens
Iniciar el servidor en modo de desarrollo utilizando Nodemon:

Bash
npm run dev
👤 Autor
Isaac Carboni - Desarrollador Full Stack en formación (Coderhouse) - GitHub