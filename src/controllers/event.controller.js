import { EventService } from '../services/event.service.js';
import { clearEventsCache } from '../utils/cache.util.js';

/**
 * Controller para la gestión del módulo de Eventos.
 * Implementa una arquitectura estática orientada a objetos (POO).
 * Responsabilidad principal: Manejar la capa HTTP (request/response), invocar 
 * la lógica de negocio (Services) y gestionar la invalidez del Caché (Redis).
 */
export class EventController {

  /**
   * POST /api/events
   * Crea un nuevo evento en la base de datos.
   * Acceso: Solo usuarios autenticados con rol 'organizer' o 'admin'.
   */
  static async createEvent(req, res) {
    try {
      // 1. Extraemos el ID del usuario autenticado previamente por el middleware authMiddleware
      const userId = req.user?._id || req.user?.id;

      // 2. Delegamos la creación a la capa de servicio (reglas de negocio y MongoDB)
      const newEvent = await EventService.createEvent(req.body, userId);

      // 3. INVALIDACIÓN DE CACHÉ (REDIS):
      // Como agregamos un nuevo evento a la base de datos, las búsquedas cacheadas en Redis 
      // (ej: "events:/api/events") quedaron desactualizadas. Limpiamos las claves viejas para 
      // forzar a que la próxima lectura traiga la lista completa renovada desde MongoDB Atlas.
      await clearEventsCache();

      // 4. Respondemos al cliente con código 201 (Created)
      return res.status(201).json({
        status: 'success',
        payload: newEvent,
      });
    } catch (error) {
      // Manejo centralizado de errores según el código HTTP del CustomError (o 500 por defecto)
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
   * NOTA: Este método no maneja directamente Redis porque el almacenamiento y lectura
   * en caché fue encapsulado en el middleware 'cacheEvents' en el archivo de rutas.
   */
  static async getEvents(req, res) {
    try {
      // Si la petición llegó hasta acá, significa que hubo un "Cache Miss" en Redis 
      // (los datos no estaban en memoria RAM o el TTL expiró).
      // Por lo tanto, consultamos directamente a la base de datos MongoDB Atlas.
      const result = await EventService.getEvents(req.query);

      // La respuesta enviada por res.json es interceptada automáticamente por el middleware 
      // 'cacheEvents' para guardarse en Redis durante los próximos X segundos antes de ir al cliente.
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

      // Al igual que getEvents, si entra acá es porque el ID no estaba en la RAM de Redis.
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
   * Actualiza la información completa de un evento existente.
   * Acceso: Solo el creador del evento ('organizer') o un 'admin'.
   */
  static async updateEvent(req, res) {
    try {
      const { id } = req.params;

      // 1. Ejecutamos la actualización en MongoDB Atlas
      const updatedEvent = await EventService.updateEvent(id, req.body, req.user);

      // 2. INVALIDACIÓN DE CACHÉ (REDIS):
      // Al modificar las propiedades de un evento (título, precio, fecha, etc.), los datos 
      // cacheados previamente están desactualizados ("Stale Data"). Eliminamos el caché de eventos.
      await clearEventsCache();

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

      // 1. Validación rápida de presencia del parámetro requerido en el body
      if (!status) {
        return res.status(400).json({
          status: 'error',
          message: 'Debes proporcionar el nuevo campo status en el cuerpo de la petición.',
        });
      }

      // 2. Actualizamos el estado mediante el servicio
      const updatedEvent = await EventService.changeStatus(id, status, req.user);

      // 3. INVALIDACIÓN DE CACHÉ (REDIS):
      // Si un evento cambió a 'published' o 'cancelled', las listas públicas de eventos 
      // visibles para los usuarios deben renovarse de inmediato.
      await clearEventsCache();

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