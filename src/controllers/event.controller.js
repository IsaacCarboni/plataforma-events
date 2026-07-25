import { EventService } from '../services/event.service.js';

/**
 * Controller para la gestión del módulo de Eventos.
 * Maneja las peticiones HTTP y delega la lógica de negocio al EventService.
 */
export class EventController {
  /**
   * POST /api/events
   * Crea un nuevo evento en la plataforma.
   * Acceso: Solo usuarios autenticados con rol 'organizer' o 'admin'.
   */
  static async createEvent(req, res) {
    try {
      // Extraemos el ID del usuario directamente de la sesión/token (req.user)
      const userId = req.user?._id || req.user?.id;

      const newEvent = await EventService.createEvent(req.body, userId);

      return res.status(201).json({
        status: 'success',
        payload: newEvent,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Error interno al crear el evento.',
      });
    }
  }

  /**
   * GET /api/events
   * Recupera una lista paginada y filtrada de eventos.
   * Acceso: Público.
   */
  static async getEvents(req, res) {
    try {
      const result = await EventService.getEvents(req.query);

      return res.status(200).json({
        status: 'success',
        payload: result.data,
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Error al recuperar los eventos.',
      });
    }
  }

  /**
   * GET /api/events/:id
   * Obtiene los detalles de un evento específico por su ID.
   * Acceso: Público.
   */
  static async getEventById(req, res) {
    try {
      const { id } = req.params;
      const event = await EventService.getEventById(id);

      return res.status(200).json({
        status: 'success',
        payload: event,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Error al consultar el evento.',
      });
    }
  }

  /**
   * PUT /api/events/:id
   * Actualiza la información de un evento existente.
   * Acceso: Solo el creador del evento ('organizer') o un 'admin'.
   */
  static async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const updatedEvent = await EventService.updateEvent(id, req.body, req.user);

      return res.status(200).json({
        status: 'success',
        message: 'Evento actualizado correctamente.',
        payload: updatedEvent,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Error al actualizar el evento.',
      });
    }
  }

  /**
   * PATCH /api/events/:id/status
   * Cambia el estado del evento ('draft', 'published', 'cancelled', 'finished').
   * Acceso: Solo el creador del evento ('organizer') o un 'admin'.
   */
  static async changeStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          status: 'error',
          message: 'Debes proporcionar el nuevo campo status en el cuerpo de la petición.',
        });
      }

      const updatedEvent = await EventService.changeStatus(id, status, req.user);

      return res.status(200).json({
        status: 'success',
        message: `El estado del evento fue actualizado a '${status}'.`,
        payload: updatedEvent,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Error al cambiar el estado del evento.',
      });
    }
  }
}