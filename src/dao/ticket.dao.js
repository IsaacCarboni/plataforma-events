import { TicketModel } from '../models/ticket.model.js';

export class TicketDAO {
  
  // Crea un nuevo ticket
  async create(ticketData) {
    return TicketModel.create(ticketData);
  }

  // Busca por ID manteniendo el documento de Mongoose (para poder usar .save() luego)
  async findById(id) {
    return TicketModel.findById(id);
  }

  // Verifica si el usuario ya posee un ticket activo en un evento
  async findActiveByUserAndEvent(userId, eventId) {
    return TicketModel.findOne({
      user: userId,
      event: eventId,
      status: { $ne: 'cancelled' },
    }).lean();
  }

  // Lista todos los tickets activos de un evento (para conteo o validación de cupos)
  async findActiveByEvent(eventId) {
    return TicketModel.find({
      event: eventId,
      status: { $ne: 'cancelled' },
    }).lean();
  }

  // Historial de tickets del usuario con datos esenciales del evento
  async findByUser(userId) {
    return TicketModel.find({ user: userId })
      .populate('event', 'title date location status price') // Trae solo campos útiles del evento
      .sort({ createdAt: -1 })
      .lean();
  }

  // Lista de inscriptos a un evento (para el organizador o admin)
  async findByEvent(eventId) {
    return TicketModel.find({ event: eventId })
      .populate('user', 'first_name last_name email') // Trae solo datos públicos del usuario
      .sort({ createdAt: -1 })
      .lean();
  }

  // Guarda cambios de una instancia de documento Mongoose
  async save(ticketDoc) {
    return ticketDoc.save();
  }
}