import { TicketModel } from '../models/ticket.model.js';
import { TicketDTO } from '../dtos/ticket.dto.js';
import { TICKET_STATUS } from '../constants/index.js';

export class TicketRepository {
  async createTicket(ticketData) {
    const newTicket = await TicketModel.create(ticketData);
    return new TicketDTO(newTicket);
  }

  async getTicketById(id) {
    const ticket = await TicketModel.findById(id).lean();
    return ticket ? new TicketDTO(ticket) : null;
  }

  async hasActiveTicket(userId, eventId) {
    const ticket = await TicketModel.findOne({ 
      user: userId, 
      event: eventId, 
      status: TICKET_STATUS.ACTIVE || 'active' 
    }).lean();
    return Boolean(ticket);
  }

  async getOccupiedCapacity(eventId) {
    const activeTickets = await TicketModel.find({ 
      event: eventId, 
      status: TICKET_STATUS.ACTIVE || 'active' 
    }).lean();
    return activeTickets.reduce((acc, t) => acc + (t.quantity || 0), 0);
  }

  async getTicketsByUser(userId) {
    const tickets = await TicketModel.find({ user: userId }).lean();
    return tickets.map((t) => new TicketDTO(t));
  }

  async getTicketsByEvent(eventId) {
    const tickets = await TicketModel.find({ event: eventId }).lean();
    return tickets.map((t) => new TicketDTO(t));
  }

  async saveTicket(ticketDoc) {
    const saved = await TicketModel.findByIdAndUpdate(ticketDoc._id, ticketDoc, { new: true }).lean();
    return new TicketDTO(saved);
  }
}

export const ticketRepository = new TicketRepository();