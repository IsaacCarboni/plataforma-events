import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

import initializePassport from './src/config/passport.config.js';
import eventRoutes from './src/routes/event.routes.js';
import sessionRoutes from './src/routes/session.routes.js';
import ticketRoutes from './src/routes/ticket.routes.js';
import productsRouter from './src/routes/products.router.js';
import errorHandler from './src/middlewares/errors/index.js';

dotenv.config();

const app = express();

// 1. Configuración de Middlewares de Seguridad y Red
app.use(helmet({ contentSecurityPolicy: false })); // Protege cabeceras HTTP (desactiva CSP para Swagger UI)
app.use(cors({ origin: true, credentials: true })); // Habilita peticiones cruzadas enviando cookies

// 2. Middlewares globales de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Inicialización de Estrategias de Autenticación
initializePassport();
app.use(passport.initialize());

// 4. Documentación OpenAPI con Swagger UI
const swaggerOptions = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'Documentación de Plataforma Events API',
      version: '1.0.0',
      description: 'API RESTful para la gestión integral de eventos, reservas de tickets y módulo de stock.',
    },
  },
  apis: ['./src/docs/**/*.yaml', './docs/**/*.yaml'],
};

const specs = swaggerJSDoc(swaggerOptions);
app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// 5. Healthcheck Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'up', message: 'Servidor activo y operando correctamente.' });
});

// 6. Mapeo de Rutas Principales
app.use('/api/events', eventRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/products', productsRouter);
app.use('/api', ticketRoutes);

// 7. Manejador Fallback 404
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Ruta no encontrada: ${req.originalUrl}` });
});

// 8. Middleware de Errores Centralizado (Siempre al final de los routers)
app.use(errorHandler);

export default app;