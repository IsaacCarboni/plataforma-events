import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './src/config/db.config.js'; 
import eventRoutes from './src/routes/event.routes.js';   // 👈 Cambiado a .routes.js
import sessionRoutes from './src/routes/session.routes.js'; // 👈 Cambiado a .routes.js

dotenv.config();

const app = express();

// Inicialización de la persistencia de datos (Acá se conecta a Mongo Atlas)
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/events', eventRoutes);
app.use('/api/sessions', sessionRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'up', message: 'Servidor activo y operando correctamente.' });
});

export default app;