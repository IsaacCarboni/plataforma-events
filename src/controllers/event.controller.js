import { EventService } from '../services/event.service.js';
import { clearEventsCache } from '../utils/cache.util.js';

export class EventController {

  static async createEvent(req, res) {
    try {
      const userId = req.user?._id || req.user?.id;

      // 1. Lógica principal (Persistencia en DB)
      const newEvent = await EventService.createEvent(req.body, userId);

      // 2. Limpieza de caché segura (si falla Redis, la API no se cae)
      clearEventsCache().catch(err => 
        console.error('⚠️ Error no bloqueante al limpiar el caché de Redis:', err.message)
      );

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

  static async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const updatedEvent = await EventService.updateEvent(id, req.body, req.user);

      // Limpieza de caché no bloqueante
      clearEventsCache().catch(err => 
        console.error('⚠️ Error no bloqueante al limpiar el caché de Redis:', err.message)
      );

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

      // Limpieza de caché no bloqueante
      clearEventsCache().catch(err => 
        console.error('⚠️ Error no bloqueante al limpiar el caché de Redis:', err.message)
      );

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