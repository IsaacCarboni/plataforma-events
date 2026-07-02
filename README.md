# Plataforma de Eventos e Inscripciones

API REST profesional desarrollada con Node.js y Express para la gestión integrada de eventos, usuarios e inscripciones en tiempo real. Este sistema está diseñado bajo una arquitectura limpia organizada por capas independientes para garantizar su escalabilidad.

## 🚀 Tecnologías Utilizadas
* **Node.js** - Entorno de ejecución para JavaScript en el servidor.
* **Express** - Framework web para el desarrollo de la API.
* **MongoDB & Mongoose** - Base de datos NoSQL y modelado de datos.
* **Dotenv** - Gestión de variables de entorno seguras.

## 📁 Estructura de Arquitectura por Capas
El proyecto implementa una separación de intereses estricta basada en la siguiente estructura:
* `src/config/` - Configuraciones globales del sistema y bases de datos.
* `src/routes/` - Enrutadores encargados de capturar y redirigir las solicitudes HTTP.
* `src/controllers/` - Controladores que gestionan la lógica de negocio principal.
* `src/models/` - Esquemas y modelos de datos definidos con Mongoose.
* `src/services/` - Capa intermedia para el procesamiento de reglas de negocio.
* `src/repositories/` - Capa encargada de aislar el acceso a datos.
* `src/dao/` - Objetos de Acceso a Datos (Data Access Objects).
* `src/middlewares/` - Interceptores globales y de validación de peticiones.
* `src/utils/` - Funciones auxiliares y herramientas reutilizables.

## 🛠️ Instalación y Configuración

1. Clonar el repositorio de forma local.
2. Ejecutar la instalación de dependencias esenciales:
   ```bash
   npm install
Configurar el entorno creando un archivo .env basado en .env.example:

Plaintext
PORT=8080
NODE_ENV=development
MONGO_URL=tu_cadena_de_conexion_de_mongo_atlas
JWT_SECRET=tu_palabra_secreta
Iniciar el servidor en modo de desarrollo:

Bash
npm run dev
🛣️ Endpoints Disponibles
GET /api/health - Devuelve el estado actual de salud y operatividad del servidor.

GET /api/events - Recupera la lista completa de eventos registrados.

Recurso /api/sessions - Estructura base lista para implementar la lógica de autenticación.