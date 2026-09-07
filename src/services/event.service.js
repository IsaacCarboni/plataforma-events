import { EventDAO } from '../dao/event.dao.js';
import { EventRepository } from '../repositories/event.repository.js';
import CustomError from './errors/CustomError.js';
import EErrors from './errors/enums.js';

const eventRepository = new EventRepository(new EventDAO());

export class EventService {
  static async createEvent(eventData, userId) {
    const eventDate = new Date(eventData.date);
    
    if (isNaN(eventDate.getTime())) {
      CustomError.createError({
        name: 'InvalidDateError',
        message: 'La fecha proporcionada no es válida.',
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    if (eventDate <= new Date()) {
      CustomError.createError({
        name: 'InvalidDateError',
        message: 'No podés crear un evento con una fecha pasada.',
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    const newEventData = {
      ...eventData,
      organizer: userId,
      status: eventData.status || 'published',
    };

    return await eventRepository.createEvent(newEventData);
  }

  static async getEvents(queryParams) {
    const { page = 1, limit = 10, status, category, location, dateFrom, dateTo, sort } = queryParams;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: sort ? { [sort.replace('-', '')]: sort.startsWith('-') ? -1 : 1 } : { date: 1 },
      populate: { path: 'organizer', select: 'first_name last_name email role' },
      lean: true,
    };

    const result = await eventRepository.getPaginatedEvents(filter, options);

    return {
      data: result.docs,
      page: result.page,
      limit: result.limit,
      total: result.totalDocs,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
    };
  }

  static async getEventById(id) {
    const event = await eventRepository.getEventById(id);
    if (!event) {
      CustomError.createError({
        name: 'NotFoundError',
        message: 'Evento no encontrado.',
        code: EErrors.RESOURCE_NOT_FOUND,
      });
    }
    return event;
  }

  static async updateEvent(id, updateData, user) {
    const event = await eventRepository.getEventById(id);
    if (!event) {
      CustomError.createError({
        name: 'NotFoundError',
        message: 'Evento no encontrado.',
        code: EErrors.RESOURCE_NOT_FOUND,
      });
    }

    if (event.status === 'cancelled' || event.status === 'finished') {
      CustomError.createError({
        name: 'InvalidStateError',
        message: `No se puede modificar un evento con estado '${event.status}'.`,
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    const organizerId = event.organizer?.id || event.organizer?._id || event.organizer;
    const currentUserId = user._id?.toString() || user.id?.toString();
    const isOwner = organizerId?.toString() === currentUserId;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      CustomError.createError({
        name: 'ForbiddenError',
        message: 'Acceso denegado: No tenés permisos para modificar este evento.',
        code: EErrors.AUTHORIZATION_ERROR,
      });
    }

    if (updateData.date) {
      const newDate = new Date(updateData.date);
      if (newDate <= new Date()) {
        CustomError.createError({
          name: 'InvalidDateError',
          message: 'No podés reprogramar el evento para una fecha pasada.',
          code: EErrors.INVALID_TYPES_ERROR,
        });
      }
    }

    delete updateData.organizer;
    return await eventRepository.updateEvent(id, updateData);
  }

  static async changeStatus(id, newStatus, user) {
    const validStatuses = ['draft', 'published', 'cancelled', 'finished'];
    if (!validStatuses.includes(newStatus)) {
      CustomError.createError({
        name: 'InvalidStatusError',
        message: `Estado inválido. Los estados permitidos son: ${validStatuses.join(', ')}`,
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    const event = await eventRepository.getEventById(id);
    if (!event) {
      CustomError.createError({
        name: 'NotFoundError',
        message: 'Evento no encontrado.',
        code: EErrors.RESOURCE_NOT_FOUND,
      });
    }

    const organizerId = event.organizer?.id || event.organizer?._id || event.organizer;
    const currentUserId = user._id?.toString() || user.id?.toString();
    const isOwner = organizerId?.toString() === currentUserId;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      CustomError.createError({
        name: 'ForbiddenError',
        message: 'Acceso denegado: No tenés permisos para cambiar el estado de este evento.',
        code: EErrors.AUTHORIZATION_ERROR,
      });
    }

    return await eventRepository.updateEvent(id, { status: newStatus });
  }
}