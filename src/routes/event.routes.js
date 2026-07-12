import { Router } from 'express';
import { createEvent, getEvents } from '../controllers/event.controller.js';
// Importamos la seguridad que armamos recién
import { authMiddleware, handleRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// 1. Obtener la lista completa de eventos mediante el controlador (Solo si está autenticado -> 401 si no)
router.get('/', authMiddleware, getEvents);

// 2. Crear un nuevo evento mediante el controlador (Solo organizer o admin -> 403 si es user)
router.post('/', authMiddleware, handleRoles(['organizer', 'admin']), createEvent);

export default router;