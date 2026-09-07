import { Router } from 'express';
import { EventController } from '../controllers/event.controller.js';
import { authMiddleware, handleRoles } from '../middlewares/auth.middleware.js';
import { cacheEvents } from '../middlewares/cache.middleware.js';

const router = Router();

// GET /api/events (Público - Caché 120s)
router.get('/', cacheEvents(120), EventController.getEvents);

// GET /api/events/:id (Público - Caché 60s)
router.get('/:id', cacheEvents(60), EventController.getEventById);

// POST /api/events (Solo 'organizer' y 'admin')
router.post(
  '/',
  authMiddleware,
  handleRoles(['organizer', 'admin']),
  EventController.createEvent
);

// PUT /api/events/:id (Solo 'organizer' y 'admin')
router.put(
  '/:id',
  authMiddleware,
  handleRoles(['organizer', 'admin']),
  EventController.updateEvent
);

// PATCH /api/events/:id/status (Solo 'organizer' y 'admin')
router.patch(
  '/:id/status',
  authMiddleware,
  handleRoles(['organizer', 'admin']),
  EventController.changeStatus
);

export default router;