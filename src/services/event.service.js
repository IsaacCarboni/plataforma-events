import { EventModel } from '../models/event.model.js';

export class EventService {
  /**
   * Crear un nuevo evento
   * Regla de negocio: La fecha debe ser futura.
   */
  static async createEvent(eventData, userId) {
    const eventDate = new Date(eventData.date);
    if (isNaN(eventDate.getTime())) {
      const error = new Error('La fecha proporcionada no es válida.');
      error.statusCode = 400;
      throw error;
    }

    if (eventDate <= new Date()) {
      const error = new Error('No podés crear un evento con una fecha pasada.');
      error.statusCode = 400;
      throw error;
    }

    // Asignación automática del organizador desde el usuario autenticado
    const newEvent = {
      ...eventData,
      organizer: userId,
      status: eventData.status || 'published',
    };

    return await EventModel.create(newEvent);
  }

  /**
   * Obtener eventos paginados y filtrados
   */
  static async getEvents(queryParams) {
    const { page = 1, limit = 10, status, category, location, dateFrom, dateTo, sort } = queryParams;

    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' }; // Búsqueda parcial e insensible a mayúsculas

    // Filtro por rango de fechas
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: sort ? { [sort.replace('-', '')]: sort.startsWith('-') ? -1 : 1 } : { date: 1 },
      populate: { path: 'organizer', select: 'first_name last_name email role' }, // Trae datos básicos del organizador
      lean: true,
    };

    const result = await EventModel.paginate(filter, options);

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

  /**
   * Obtener evento por ID
   */
  static async getEventById(id) {
    const event = await EventModel.findById(id).populate('organizer', 'first_name last_name email role').lean();
    if (!event) {
      const error = new Error('Evento no encontrado.');
      error.statusCode = 404;
      throw error;
    }
    return event;
  }

  /**
   * Actualizar evento
   * Reglas de negocio:
   * 1. No se pueden modificar eventos cancelados o finalizados.
   * 2. Solo el dueño (organizer) o un admin pueden modificar.
   */
  static async updateEvent(id, updateData, user) {
    const event = await EventModel.findById(id);
    if (!event) {
      const error = new Error('Evento no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    // Regla de negocio: Control de estado
    if (event.status === 'cancelled' || event.status === 'finished') {
      const error = new Error(`No se puede modificar un evento con estado '${event.status}'.`);
      error.statusCode = 400;
      throw error;
    }

    // Regla de negocio: Control de propiedad (Owner o Admin)
    const isOwner = event.organizer.toString() === user._id.toString() || event.organizer.toString() === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      const error = new Error('Acceso denegado: No tenés permisos para modificar este evento ya que no sos su creador.');
      error.statusCode = 403;
      throw error;
    }

    // Validar fecha futura si intenta cambiar la fecha
    if (updateData.date) {
      const newDate = new Date(updateData.date);
      if (newDate <= new Date()) {
        const error = new Error('No podés reprogramar el evento para una fecha pasada.');
        error.statusCode = 400;
        throw error;
      }
    }

    // Evitar que sobrescriban el organizer desde la actualización
    delete updateData.organizer;

    return await EventModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
  }

  /**
   * Cambiar estado del evento (PATCH /api/events/:id/status)
   */
  static async changeStatus(id, newStatus, user) {
    const validStatuses = ['draft', 'published', 'cancelled', 'finished'];
    if (!validStatuses.includes(newStatus)) {
      const error = new Error(`Estado inválido. Los estados permitidos son: ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const event = await EventModel.findById(id);
    if (!event) {
      const error = new Error('Evento no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    // Control de propiedad
    const isOwner = event.organizer.toString() === user._id.toString() || event.organizer.toString() === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      const error = new Error('Acceso denegado: No tenés permisos para cambiar el estado de este evento.');
      error.statusCode = 403;
      throw error;
    }

    event.status = newStatus;
    return await event.save();
  }
}