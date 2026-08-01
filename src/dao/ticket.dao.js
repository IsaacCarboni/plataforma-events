import { TicketModel } from '../models/ticket.model.js';

export class TicketDAO {
  async create(ticketData) {
    return await TicketModel.create(ticketData);
  }

  async findById(id) {
    return await TicketModel.findById(id);
  }

  async findActiveByUserAndEvent(userId, eventId) {
    return await TicketModel.findOne({
      user: userId,
      event: eventId,
      status: { $ne: 'cancelled' },
    });
  }

  async findActiveByEvent(eventId) {
    return await TicketModel.find({
      event: eventId,
      status: { $ne: 'cancelled' },
    });
  }

  async findByUser(userId) {
    return await TicketModel.find({ user: userId })
      .populate('event')
      .sort({ createdAt: -1 });
  }

  async findByEvent(eventId) {
    return await TicketModel.find({ event: eventId })
      .populate('user')
      .sort({ createdAt: -1 });
  }

  async save(ticketDoc) {
    return await ticketDoc.save();
  }
}