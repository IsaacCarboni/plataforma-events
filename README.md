# 🚀 Plataforma de Eventos e Inscripciones

API REST profesional desarrollada con **Node.js** y **Express** para la gestión integrada de eventos, usuarios e inscripciones en tiempo real. 

Este sistema está diseñado bajo una **arquitectura limpia organizada por capas independientes** para garantizar su escalabilidad, seguridad y fácil mantenimiento.

---

## 📁 Estructura de Arquitectura por Capas

El proyecto implementa una separación de intereses estricta basada en la siguiente estructura modular:

*   **`src/config/`** - Configuraciones globales del sistema (Bases de datos y estrategias de Passport).
*   **`src/routes/`** - Enrutadores encargados de capturar y redirigir las solicitudes HTTP.
*   **`src/controllers/`** - Controladores que gestionan la lógica de negocio principal y las respuestas.
*   **`src/models/`** - Esquemas y modelos de datos de Mongoose.
*   **`src/services/`** - Capa intermedia para el procesamiento de reglas de negocio.
*   **`src/dao/`** - Objetos de Acceso a Datos (Data Access Objects) para aislar la persistencia en MongoDB.
*   **`src/middlewares/`** - Interceptores globales, control de roles y validación de peticiones.
*   **`src/utils/`** - Funciones auxiliares (Hashing con Bcrypt, firma de JWT).

### 🗺️ Mapa Completo de Archivos

```text
plataforma-events/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── passport.config.js
│   ├── controllers/
│   │   ├── event.controller.js
│   │   └── session.controller.js
│   ├── dao/
│   │   └── user.dao.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── event.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── event.router.js
│   │   └── session.router.js
│   ├── services/
│   │   ├── index.js
│   │   └── session.service.js
│   ├── utils/
│   │   ├── hash.js
│   │   └── jwt.js
│   └── hash.test.js
├── .env
├── .gitignore
├── package.json
└── README.md
🛠️ Tecnologías UtilizadasNode.js - Entorno de ejecución para JavaScript en el servidor utilizando ES Modules (import/export).Express - Framework web ágil para el desarrollo de la API.MongoDB Atlas & Mongoose - Base de datos NoSQL en la nube y modelado de datos de nivel corporativo.Passport.js - Motor de autenticación centralizado mediante estrategias locales y JWT.JSON Web Tokens (JWT) - Firma y manejo de tokens para la gestión de sesiones seguras.Cookie-parser - Middleware para interceptar y gestionar cookies criptográficas del lado del cliente.Bcrypt - Algoritmo de hashing seguro para la protección de contraseñas mediante salting.Dotenv - Gestión estricta de variables de entorno globales.⚙️ Centralización de Autenticación y Terceros💡 Criterio de Aceptación: La arquitectura de autenticación en src/config/passport.config.js ha sido completamente modularizada y desacoplada. Gracias a esto, el sistema queda estructurado y 100% preparado para incorporar proveedores externos de identidad (como Google, GitHub o Facebook OAuth) de manera directa, requiriendo únicamente la adición de la estrategia correspondiente en el archivo de configuración, sin necesidad de alterar el servidor principal (app.js).🛣️ Endpoints Disponibles📅 Módulo de Eventos (/api/events)GET /api/events - Recupera la lista completa de eventos registrados. (Requiere autenticación previa -> Retorna 401 si no está autenticado).POST /api/events - Registra un nuevo evento en el sistema. (Requiere rol organizer o admin -> Retorna 403 si es un rol sin privilegios).🔒 Módulo de Autenticación & Sesiones (/api/sessions)Lógica de autenticación robusta gestionada íntegramente por middlewares de Passport:MétodoEndpointDescripciónMiddleware de SeguridadPOST/api/sessions/registerRegistra un nuevo usuario aplicando hash Bcrypt automático a la contraseña.passport-local ('register')POST/api/sessions/loginValida credenciales, genera el JWT y lo almacena en una cookie HTTP Only (currentUser).passport-local ('login')GET/api/sessions/currentExtrae la cookie de forma transparente, valida el token y retorna el perfil activo { id, email, role } sin exponer datos sensibles.passport-jwt ('current')POST/api/sessions/logoutLimpia de manera definitiva la cookie criptográfica, destruyendo la sesión en el cliente.Controlador Directo🧪 Pruebas Unitarias NativasEl proyecto cuenta con un conjunto de pruebas unitarias esenciales diseñadas para validar la robustez de los mecanismos de hashing y el correcto flujo de parámetros en la autenticación. Se utiliza el Test Runner nativo de Node.js, optimizando el rendimiento y evitando dependencias externas de terceros.Para ejecutar la suite de testing, ejecute en su terminal:Bashnpm test
🔧 Instalación y ConfiguraciónClonar el repositorio de forma local.Instalar las dependencias de Node.js:Bashnpm install
Configurar el entorno creando un archivo .env en la raíz del proyecto basado en el siguiente bloque:Ini, TOMLPORT=8080
NODE_ENV=development
MONGO_URL=tu_cadena_de_conexion_de_mongo_atlas
JWT_SECRET=tu_palabra_secreta_para_firmar_tokens
Iniciar el servidor en modo de desarrollo utilizando Nodemon:Bashnpm run dev
👤 AutorIsaac Carboni - Desarrollador Full Stack en formación (Coderhouse).