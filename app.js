import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
import initializePassport from './src/config/passport.config.js';
import { connectDB } from './src/config/db.config.js'; 
import eventRoutes from './src/routes/event.routes.js';
import sessionRoutes from './src/routes/session.routes.js';
import ticketRoutes from './src/routes/ticket.routes.js';
import errorHandler from './src/middlewares/errors/index.js'; // 👈 1. Importación del manejador centralizado de errores

dotenv.config();

const app = express();

// Inicialización de la base de datos MongoDB Atlas
connectDB();

// Middlewares globales de parsing de datos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Inicialización de Passport y estrategias de autenticación
initializePassport();
app.use(passport.initialize());

// Configuración de opciones para Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentación de Plataforma Events API',
            version: '1.0.0',
            description: 'API RESTful para la gestión integral de eventos, reservas de tickets y autenticación basada en JWT.'
        },
    },
    apis: ['./src/docs/**/*.yaml']
};

// Generación del esquema OpenAPI
const specs = swaggerJSDoc(swaggerOptions);

// Endpoint visual interactivo (Swagger UI)
app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// Mapeo de Enrutadores principales
app.use('/api/events', eventRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api', ticketRoutes);

// Endpoint de verificación de estado (Healthcheck)
app.get('/api/health', (req, res) => {
    res.json({ status: 'up', message: 'Servidor activo y operando correctamente.' });
});

// 👈 2. Middleware de errores centralizado (SIEMPRE después de todas las rutas)
app.use(errorHandler);

export default app;