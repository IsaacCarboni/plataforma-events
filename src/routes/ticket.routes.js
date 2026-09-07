import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller.js';
import { authMiddleware, handleRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/events/:eid/tickets -> Inscribirse a un evento (Autenticado)
router.post('/events/:eid/tickets', authMiddleware, TicketController.createTicket);

// GET /api/tickets/my-tickets -> Consultar mis entradas (Autenticado)
router.get('/tickets/my-tickets', authMiddleware, TicketController.getMyTickets);

// GET /api/events/:eid/tickets -> Consultar participantes (Solo Organizer / Admin)
router.get(
  '/events/:eid/tickets',
  authMiddleware,
  handleRoles(['organizer', 'admin']),
  TicketController.getEventTickets
);

// PATCH /api/tickets/:tid/cancel -> Cancelar ticket y liberar cupo (Autenticado)
router.patch('/tickets/:tid/cancel', authMiddleware, TicketController.cancelTicket);

export default router;