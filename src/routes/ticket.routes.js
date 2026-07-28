import { Router } from 'express';
import passport from 'passport';
import { TicketController } from '../controllers/ticket.controller.js';

const router = Router();

// Middleware helper para proteger rutas con Passport JWT
const passportAuth = passport.authenticate('current', { session: false });

/**
 * 🎟️ Módulo de Inscripciones y Tickets
 */

// POST /api/events/:eid/tickets -> Inscribirse a un evento (Autenticado)
router.post('/events/:eid/tickets', passportAuth, TicketController.createTicket);

// GET /api/tickets/my-tickets -> Consultar mis entradas (Autenticado)
router.get('/tickets/my-tickets', passportAuth, TicketController.getMyTickets);

// GET /api/events/:eid/tickets -> Consultar participantes de un evento (Organizer/Admin)
router.get('/events/:eid/tickets', passportAuth, TicketController.getEventTickets);

// PATCH /api/tickets/:tid/cancel -> Cancelar ticket y liberar cupo (Dueño/Admin)
router.patch('/tickets/:tid/cancel', passportAuth, TicketController.cancelTicket);

export default router;
