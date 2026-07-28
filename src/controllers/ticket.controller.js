import { TicketService } from '../services/ticket.service.js';

export class TicketController {
  /**
   * POST /api/events/:eid/tickets
   * Crear inscripción / ticket
   */
  static async createTicket(req, res) {
    try {
      const { eid } = req.params;
      const { quantity = 1 } = req.body;
      const user = req.user; // Usuario inyectado por el middleware de Passport/JWT

      const newTicket = await TicketService.createTicket(eid, user, quantity);

      return res.status(201).json({
        status: 'success',
        message: 'Inscripción realizada con éxito.',
        payload: newTicket,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Error al procesar la inscripción.',
      });
    }
  }

  /**
   * GET /api/tickets/my-tickets
   * Obtener inscripciones del usuario autenticado
   */
  static async getMyTickets(req, res) {
    try {
      const userId = req.user._id;
      const tickets = await TicketService.getMyTickets(userId);

      return res.status(200).json({
        status: 'success',
        payload: tickets,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Error al obtener tus tickets.',
      });
    }
  }

  /**
   * GET /api/events/:eid/tickets
   * Obtener participantes de un evento (organizer del evento o admin)
   */
  static async getEventTickets(req, res) {
    try {
      const { eid } = req.params;
      const user = req.user;

      const tickets = await TicketService.getEventTickets(eid, user);

      return res.status(200).json({
        status: 'success',
        payload: tickets,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Error al obtener los tickets del evento.',
      });
    }
  }

  /**
   * PATCH /api/tickets/:tid/cancel
   * Cancelar un ticket y liberar el cupo (dueño del ticket o admin)
   */
  static async cancelTicket(req, res) {
    try {
      const { tid } = req.params;
      const user = req.user;

      const cancelledTicket = await TicketService.cancelTicket(tid, user);

      return res.status(200).json({
        status: 'success',
        message: 'Inscripción cancelada exitosamente. El cupo ha sido liberado.',
        payload: cancelledTicket,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Error al cancelar la inscripción.',
      });
    }
  }
}