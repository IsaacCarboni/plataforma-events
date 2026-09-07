import { TicketDAO } from '../dao/ticket.dao.js';
import { EventDAO } from '../dao/event.dao.js';
import { TicketRepository } from '../repositories/ticket.repository.js';
import { EventRepository } from '../repositories/event.repository.js';
import { MailService } from './mail.service.js';
import CustomError from './errors/CustomError.js';
import EErrors from './errors/enums.js';
import crypto from 'crypto';

const ticketRepository = new TicketRepository(new TicketDAO());
const eventRepository = new EventRepository(new EventDAO());

export class TicketService {
  /**
   * Crea un nuevo ticket con validación estricta de cupos, estados, fecha y duplicados
   */
  static async createTicket(eventId, user, quantity) {
    const numQuantity = Number(quantity);

    if (!numQuantity || numQuantity <= 0) {
      CustomError.createError({
        name: 'InvalidQuantityError',
        message: 'Debes solicitar al menos 1 entrada válida.',
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    const event = await eventRepository.getEventById(eventId);
    if (!event) {
      CustomError.createError({
        name: 'NotFoundError',
        message: 'El evento solicitado no existe.',
        code: EErrors.RESOURCE_NOT_FOUND,
      });
    }

    if (event.status !== 'published') {
      CustomError.createError({
        name: 'InvalidStateError',
        message: `No es posible inscribirse. El evento se encuentra en estado '${event.status}'.`,
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    if (new Date(event.date) < new Date()) {
      CustomError.createError({
        name: 'EventExpiredError',
        message: 'No es posible inscribirse. El evento ya ha finalizado.',
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    const userId = user._id?.toString() || user.id?.toString();

    const hasDuplicate = await ticketRepository.hasActiveTicket(userId, eventId);
    if (hasDuplicate) {
      CustomError.createError({
        name: 'DuplicateTicketError',
        message: 'Ya cuentas con una inscripción activa para este evento.',
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    const occupiedCapacity = await ticketRepository.getOccupiedCapacity(eventId);
    const availableCapacity = event.capacity - occupiedCapacity;

    if (numQuantity > availableCapacity) {
      CustomError.createError({
        name: 'CapacityExceededError',
        message: `Cupos insuficientes. Solicitaste ${numQuantity} entrada(s), pero solo quedan ${availableCapacity} disponible(s).`,
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    const reservationCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const newTicket = await ticketRepository.createTicket({
      user: userId,
      event: eventId,
      quantity: numQuantity,
      reservationCode,
      status: 'confirmed',
    });

    if (user.email) {
      MailService.sendTicketConfirmation(user.email, {
        eventTitle: event.title,
        reservationCode,
        quantity: numQuantity,
      }).catch((err) => console.error('[TicketService] Error enviando correo:', err.message));
    }

    return newTicket;
  }

  /**
   * Obtiene los tickets del usuario autenticado
   */
  static async getMyTickets(userId) {
    return await ticketRepository.getTicketsByUser(userId);
  }

  /**
   * Obtiene todos los tickets de un evento (solo organizer o admin)
   */
  static async getEventTickets(eventId, user) {
    const event = await eventRepository.getEventById(eventId);
    if (!event) {
      CustomError.createError({
        name: 'NotFoundError',
        message: 'El evento no existe.',
        code: EErrors.RESOURCE_NOT_FOUND,
      });
    }

    const organizerId = event.organizer?.id || event.organizer?._id || event.organizer;
    const currentUserId = user._id?.toString() || user.id?.toString();

    const isOrganizer = organizerId?.toString() === currentUserId;
    const isAdmin = user.role === 'admin';

    if (!isOrganizer && !isAdmin) {
      CustomError.createError({
        name: 'ForbiddenError',
        message: 'No tienes autorización para consultar las inscripciones de este evento.',
        code: EErrors.AUTHORIZATION_ERROR,
      });
    }

    return await ticketRepository.getTicketsByEvent(eventId);
  }

  /**
   * Cancela un ticket y libera el cupo
   */
  static async cancelTicket(ticketId, user) {
    const ticketDoc = await ticketRepository.getTicketById(ticketId);
    if (!ticketDoc) {
      CustomError.createError({
        name: 'NotFoundError',
        message: 'El ticket solicitado no existe.',
        code: EErrors.RESOURCE_NOT_FOUND,
      });
    }

    const ticketUserId = ticketDoc.user?.id || ticketDoc.user?._id || ticketDoc.user;
    const currentUserId = user._id?.toString() || user.id?.toString();

    const isOwner = ticketUserId?.toString() === currentUserId;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      CustomError.createError({
        name: 'ForbiddenError',
        message: 'No tienes autorización para cancelar este ticket.',
        code: EErrors.AUTHORIZATION_ERROR,
      });
    }

    if (ticketDoc.status === 'cancelled') {
      CustomError.createError({
        name: 'AlreadyCancelledError',
        message: 'Este ticket ya se encuentra cancelado.',
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    ticketDoc.status = 'cancelled';
    ticketDoc.cancelledAt = new Date();

    return await ticketRepository.saveTicket(ticketDoc);
  }
}