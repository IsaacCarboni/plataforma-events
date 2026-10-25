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
import mockRouter from './src/routes/mock.routes.js';
import errorHandler from './src/middlewares/errors/index.js';
import logger from './src/utils/logger.js'; // 👈 Importamos Winston

dotenv.config();

const app = express();

// 1. Configuración de Middlewares de Seguridad y Red
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));

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
  logger.http('Healthcheck consultado correctamente');
  res.status(200).json({ status: 'up', message: 'Servidor activo y operando correctamente.' });
});

// 5.1 Endpoint de prueba del Logger (Requerimiento Módulo 4)
app.get('/api/logger-test', (req, res) => {
  logger.debug('Prueba de log nivel: DEBUG');
  logger.http('Prueba de log nivel: HTTP');
  logger.info('Prueba de log nivel: INFO');
  logger.warning('Prueba de log nivel: WARNING');
  logger.error('Prueba de log nivel: ERROR');
  logger.fatal('Prueba de log nivel: FATAL');

  res.status(200).json({
    status: 'success',
    message: '¡Logs generados en todos los niveles correctamente! Revisá la consola y la carpeta logs/.'
  });
});

// 6. Mapeo de Rutas Principales
app.use('/api/events', eventRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/products', productsRouter);
app.use('/api/mocks', mockRouter);
app.use('/api', ticketRoutes);

// 7. Manejador Fallback 404 (Registrado como warning con Winston)
app.use((req, res) => {
  logger.warning(`Ruta no encontrada (404): ${req.method} ${req.originalUrl}`);
  res.status(404).json({ status: 'error', message: `Ruta no encontrada: ${req.originalUrl}` });
});

// 8. Middleware de Errores Centralizado (Siempre al final de los routers)
app.use(errorHandler);

export default app;