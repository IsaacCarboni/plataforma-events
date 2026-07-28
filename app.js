import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './src/config/db.config.js'; 
import eventRoutes from './src/routes/event.routes.js';
import sessionRoutes from './src/routes/session.routes.js';
import ticketRoutes from './src/routes/ticket.routes.js'; // 👈 1. Importamos las rutas de tickets

dotenv.config();

const app = express();

// Inicialización de la persistencia de datos (Conexión a MongoDB)
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mapeo de Enrutadores
app.use('/api/events', eventRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api', ticketRoutes); // 👈 2. Registramos el router de tickets

app.get('/api/health', (req, res) => {
    res.json({ status: 'up', message: 'Servidor activo y operando correctamente.' });
});

export default app;