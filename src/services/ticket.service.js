import { TicketModel } from '../models/ticket.model.js';
import { EventModel } from '../models/event.model.js';
import { MailService } from './mail.service.js';
import crypto from 'crypto';

export class TicketService {
  /**
   * Crea un nuevo ticket con validación estricta de cupos, estados y duplicados
   */
  static async createTicket(eventId, user, quantity) {
    const numQuantity = Number(quantity);

    // 1. Validar cantidad válida
    if (!numQuantity || numQuantity <= 0) {
      throw { statusCode: 400, message: 'Debes solicitar al menos 1 entrada válida.' };
    }

    // 2. Validar existencia del evento
    const event = await EventModel.findById(eventId);
    if (!event) {
      throw { statusCode: 404, message: 'El evento solicitado no existe.' };
    }

    // 3. Validar estado del evento
    if (event.status !== 'published') {
      throw {
        statusCode: 400,
        message: `No es posible inscribirse. El evento se encuentra en estado '${event.status}'.`,
      };
    }

    // 4. Validar si el usuario ya tiene un ticket activo para este evento (Duplicado)
    const existingTicket = await TicketModel.findOne({
      user: user._id,
      event: eventId,
      status: { $ne: 'cancelled' },
    });

    if (existingTicket) {
      throw {
        statusCode: 400,
        message: 'Ya cuentas con una inscripción activa para este evento.',
      };
    }

    // 5. Calcular cupos disponibles (ignorando tickets cancelados)
    const activeTickets = await TicketModel.find({
      event: eventId,
      status: { $ne: 'cancelled' },
    });

    const occupiedCapacity = activeTickets.reduce((acc, ticket) => acc + ticket.quantity, 0);
    const availableCapacity = event.capacity - occupiedCapacity;

    if (numQuantity > availableCapacity) {
      throw {
        statusCode: 400,
        message: `Cupos insuficientes. Solicitaste ${numQuantity} entrada(s), pero solo quedan ${availableCapacity} disponible(s).`,
      };
    }

    // 6. Generar código de reserva único
    const reservationCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    // 7. Crear el Ticket
    const newTicket = await TicketModel.create({
      user: user._id,
      event: eventId,
      quantity: numQuantity,
      reservationCode,
      status: 'confirmed',
    });

    // 8. Enviar correo de confirmación en segundo plano
    if (user.email) {
      MailService.sendTicketConfirmation(user.email, {
        eventTitle: event.title,
        reservationCode,
        quantity: numQuantity,
      }).catch((err) => console.error('Error enviando notificación por email:', err));
    }

    return newTicket;
  }

  /**
   * Obtiene los tickets del usuario autenticado (con populate de datos del evento)
   */
  static async getMyTickets(userId) {
    return await TicketModel.find({ user: userId })
      .populate('event', 'title date location price status')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Obtiene todos los tickets de un evento (solo organizer del evento o admin)
   */
  static async getEventTickets(eventId, user) {
    const event = await EventModel.findById(eventId);
    if (!event) {
      throw { statusCode: 404, message: 'El evento no existe.' };
    }

    // Validar permisos: creador del evento o rol admin
    const isOrganizer = event.organizer.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOrganizer && !isAdmin) {
      throw {
        statusCode: 403,
        message: 'No tienes autorización para consultar las inscripciones de este evento.',
      };
    }

    return await TicketModel.find({ event: eventId })
      .populate('user', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Cancela un ticket (borrado lógico) y libera cupo automáticamente
   */
  static async cancelTicket(ticketId, user) {
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) {
      throw { statusCode: 404, message: 'El ticket solicitado no existe.' };
    }

    // Validar permisos: dueño del ticket o rol admin
    const isOwner = ticket.user.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw {
        statusCode: 403,
        message: 'No tienes autorización para cancelar este ticket.',
      };
    }

    if (ticket.status === 'cancelled') {
      throw { statusCode: 400, message: 'Este ticket ya se encuentra cancelado.' };
    }

    ticket.status = 'cancelled';
    ticket.cancelledAt = new Date();
    await ticket.save();

    return ticket;
  }
}