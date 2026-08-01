import { TicketDAO } from '../dao/ticket.dao.js';
import { EventDAO } from '../dao/event.dao.js';
import { TicketRepository } from '../repositories/ticket.repository.js';
import { EventRepository } from '../repositories/event.repository.js';
import { MailService } from './mail.service.js';
import crypto from 'crypto';

// Instanciamos los repositorios mediante sus DAOs correspondientes
const ticketRepository = new TicketRepository(new TicketDAO());
const eventRepository = new EventRepository(new EventDAO());

export class TicketService {
  /**
   * Crea un nuevo ticket con validación estricta de cupos, estados, fecha y duplicados
   */
  static async createTicket(eventId, user, quantity) {
    const numQuantity = Number(quantity);

    // 1. Validar cantidad válida
    if (!numQuantity || numQuantity <= 0) {
      throw { statusCode: 400, message: 'Debes solicitar al menos 1 entrada válida.' };
    }

    // 2. Validar existencia del evento (vía Repository)
    const event = await eventRepository.getEventById(eventId);
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

    // 3.1. 🛑 Validar si el evento ya finalizó por fecha
    if (new Date(event.date) < new Date()) {
      throw {
        statusCode: 400,
        message: 'No es posible inscribirse. El evento ya ha finalizado.',
      };
    }

    // 4. Validar si el usuario ya tiene un ticket activo (vía Repository)
    const hasDuplicate = await ticketRepository.hasActiveTicket(user._id, eventId);
    if (hasDuplicate) {
      throw {
        statusCode: 400,
        message: 'Ya cuentas con una inscripción activa para este evento.',
      };
    }

    // 5. Calcular cupos disponibles (vía Repository)
    const occupiedCapacity = await ticketRepository.getOccupiedCapacity(eventId);
    const availableCapacity = event.capacity - occupiedCapacity;

    if (numQuantity > availableCapacity) {
      throw {
        statusCode: 400,
        message: `Cupos insuficientes. Solicitaste ${numQuantity} entrada(s), pero solo quedan ${availableCapacity} disponible(s).`,
      };
    }

    // 6. Generar código de reserva único
    const reservationCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    // 7. Crear el Ticket (vía Repository - devuelve TicketDTO)
    const newTicket = await ticketRepository.createTicket({
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
   * Obtiene los tickets del usuario autenticado (vía Repository - devuelven DTOs)
   */
  static async getMyTickets(userId) {
    return await ticketRepository.getTicketsByUser(userId);
  }

  /**
   * Obtiene todos los tickets de un evento (solo organizer del evento o admin)
   */
  static async getEventTickets(eventId, user) {
    const event = await eventRepository.getEventById(eventId);
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

    return await ticketRepository.getTicketsByEvent(eventId);
  }

  /**
   * Cancela un ticket (borrado lógico) y libera cupo automáticamente
   */
  static async cancelTicket(ticketId, user) {
    const ticketDoc = await ticketRepository.getTicketById(ticketId);
    if (!ticketDoc) {
      throw { statusCode: 404, message: 'El ticket solicitado no existe.' };
    }

    // Validar permisos: dueño del ticket o rol admin
    const isOwner = ticketDoc.user.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw {
        statusCode: 403,
        message: 'No tienes autorización para cancelar este ticket.',
      };
    }

    if (ticketDoc.status === 'cancelled') {
      throw { statusCode: 400, message: 'Este ticket ya se encuentra cancelado.' };
    }

    ticketDoc.status = 'cancelled';
    ticketDoc.cancelledAt = new Date();

    return await ticketRepository.saveTicket(ticketDoc);
  }
}