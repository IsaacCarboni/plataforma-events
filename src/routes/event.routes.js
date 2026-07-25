import { Router } from 'express';
import { EventController } from '../controllers/event.controller.js';
import { authMiddleware, handleRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/events (Público)
router.get('/', EventController.getEvents);

// GET /api/events/:id (Público)
router.get('/:id', EventController.getEventById);

// POST /api/events (Solo 'organizer' y 'admin')
router.post(
  '/',
  authMiddleware,
  handleRoles(['organizer', 'admin']),
  EventController.createEvent
);

// PUT /api/events/:id (Solo dueño del evento o 'admin')
router.put(
  '/:id',
  authMiddleware,
  handleRoles(['organizer', 'admin']),
  EventController.updateEvent
);

// PATCH /api/events/:id/status (Solo dueño del evento o 'admin')
router.patch(
  '/:id/status',
  authMiddleware,
  handleRoles(['organizer', 'admin']),
  EventController.changeStatus
);

export default router;