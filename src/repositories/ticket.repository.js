import { TicketDTO } from '../dtos/ticket.dto.js';

export class TicketRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async createTicket(ticketData) {
    const newTicket = await this.dao.create(ticketData);
    return new TicketDTO(newTicket);
  }

  async getTicketById(id) {
    return await this.dao.findById(id);
  }

  async hasActiveTicket(userId, eventId) {
    const ticket = await this.dao.findActiveByUserAndEvent(userId, eventId);
    return !!ticket;
  }

  async getOccupiedCapacity(eventId) {
    const activeTickets = await this.dao.findActiveByEvent(eventId);
    return activeTickets.reduce((acc, t) => acc + t.quantity, 0);
  }

  async getTicketsByUser(userId) {
    const tickets = await this.dao.findByUser(userId);
    return tickets.map((t) => new TicketDTO(t));
  }

  async getTicketsByEvent(eventId) {
    const tickets = await this.dao.findByEvent(eventId);
    return tickets.map((t) => new TicketDTO(t));
  }

  async saveTicket(ticketDoc) {
    const saved = await this.dao.save(ticketDoc);
    return new TicketDTO(saved);
  }
}