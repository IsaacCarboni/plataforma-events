import { Router } from 'express';
import { createEvent, getEvents } from '../controllers/event.controller.js';

const router = Router();

// 1. Obtener la lista completa de eventos mediante el controlador
router.get('/', getEvents);

// 2. Crear un nuevo evento mediante el controlador
router.post('/', createEvent);

export default router;