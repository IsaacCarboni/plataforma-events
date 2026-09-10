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
import productsRouter from './src/routes/products.router.js';
import errorHandler from './src/middlewares/errors/index.js';

dotenv.config();

const app = express();

// Inicialización de la base de datos MongoDB
connectDB();

// Middlewares globales de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Inicialización de Passport
initializePassport();
app.use(passport.initialize());

// Configuración de Swagger (Documentación OpenAPI)
const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentación de Plataforma Events API',
            version: '1.0.0',
            description: 'API RESTful para la gestión integral de eventos, reservas de tickets y módulo de carnicería (Alfa y Omega).'
        },
    },
    apis: ['./src/docs/**/*.yaml', './docs/**/*.yaml']
};

const specs = swaggerJSDoc(swaggerOptions);
app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// Endpoint de verificación de estado (Healthcheck)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'up', message: 'Servidor activo y operando correctamente.' });
});

// Mapeo de Enrutadores principales
app.use('/api/events', eventRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/products', productsRouter);
app.use('/api', ticketRoutes);

// Manejador para rutas no encontradas (404 Fallback)
app.use((req, res) => {
    res.status(404).json({ status: 'error', message: `Ruta no encontrada: ${req.originalUrl}` });
});

// Middleware de errores centralizado
app.use(errorHandler);

// Inicialización del servidor HTTP para Docker (escuchando en 0.0.0.0)
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando peticiones en el puerto: ${PORT}`);
});

export default app;