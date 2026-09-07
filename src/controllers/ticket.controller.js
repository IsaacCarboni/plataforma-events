import { TicketService } from '../services/ticket.service.js';
import { clearEventsCache } from '../utils/cache.util.js';

export class TicketController {

  // 1️⃣ Crear ticket / reserva
  static async createTicket(req, res) {
    try {
      const { eid } = req.params;
      const { quantity = 1 } = req.body;
      const user = req.user;

      const newTicket = await TicketService.createTicket(eid, user, quantity);

      // Limpieza preventiva de caché para refrescar el stock actualizado en lecturas
      clearEventsCache().catch(err => 
        console.error('⚠️ Error no bloqueante al limpiar el caché:', err.message)
      );

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

  // 2️⃣ Obtener tickets del usuario autenticado
  static async getMyTickets(req, res) {
    try {
      // Extracción segura del ID sin importar la firma del JWT
      const userId = req.user?._id || req.user?.id;

      if (!userId) {
        return res.status(401).json({ 
          status: 'error', 
          message: 'Identificador de usuario no válido.' 
        });
      }

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

  // 3️⃣ Obtener participantes de un evento (Organizador/Admin)
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

  // 4️⃣ Cancelar ticket y liberar cupo
  static async cancelTicket(req, res) {
    try {
      const { tid } = req.params;
      const user = req.user;

      const cancelledTicket = await TicketService.cancelTicket(tid, user);

      // Al liberar cupo, se desactiva el caché previo para mostrar la disponibilidad real
      clearEventsCache().catch(err => 
        console.error('⚠️ Error no bloqueante al limpiar el caché:', err.message)
      );

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