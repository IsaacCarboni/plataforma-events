import { EventDAO } from '../dao/event.dao.js';
import { EventRepository } from '../repositories/event.repository.js';

const eventRepository = new EventRepository(new EventDAO());

export class EventService {
  static async createEvent(eventData, userId) {
    const eventDate = new Date(eventData.date);
    if (isNaN(eventDate.getTime())) {
      throw { statusCode: 400, message: 'La fecha proporcionada no es válida.' };
    }

    if (eventDate <= new Date()) {
      throw { statusCode: 400, message: 'No podés crear un evento con una fecha pasada.' };
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
      throw { statusCode: 404, message: 'Evento no encontrado.' };
    }
    return event;
  }

  static async updateEvent(id, updateData, user) {
    const event = await eventRepository.getEventById(id);
    if (!event) {
      throw { statusCode: 404, message: 'Evento no encontrado.' };
    }

    if (event.status === 'cancelled' || event.status === 'finished') {
      throw { statusCode: 400, message: `No se puede modificar un evento con estado '${event.status}'.` };
    }

    const organizerId = event.organizer?.id || event.organizer?._id || event.organizer;
    const isOwner = organizerId.toString() === user._id.toString() || organizerId.toString() === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw { statusCode: 403, message: 'Acceso denegado: No tenés permisos para modificar este evento.' };
    }

    if (updateData.date) {
      const newDate = new Date(updateData.date);
      if (newDate <= new Date()) {
        throw { statusCode: 400, message: 'No podés reprogramar el evento para una fecha pasada.' };
      }
    }

    delete updateData.organizer;
    return await eventRepository.updateEvent(id, updateData);
  }

  static async changeStatus(id, newStatus, user) {
    const validStatuses = ['draft', 'published', 'cancelled', 'finished'];
    if (!validStatuses.includes(newStatus)) {
      throw { statusCode: 400, message: `Estado inválido. Los estados permitidos son: ${validStatuses.join(', ')}` };
    }

    const event = await eventRepository.getEventById(id);
    if (!event) {
      throw { statusCode: 404, message: 'Evento no encontrado.' };
    }

    const organizerId = event.organizer?.id || event.organizer?._id || event.organizer;
    const isOwner = organizerId.toString() === user._id.toString() || organizerId.toString() === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw { statusCode: 403, message: 'Acceso denegado: No tenés permisos para cambiar el estado de este evento.' };
    }

    return await eventRepository.updateEvent(id, { status: newStatus });
  }
}