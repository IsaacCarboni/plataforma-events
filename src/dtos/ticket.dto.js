import { UserDTO } from './user.dto.js';
import { EventDTO } from './event.dto.js';

export class TicketDTO {
  constructor(ticket = {}) {
    this.id = ticket._id?.toString() || ticket.id || null;
    this.quantity = ticket.quantity ?? 1;
    this.reservationCode = ticket.reservationCode ?? '';
    this.status = ticket.status ?? 'active';
    this.createdAt = ticket.createdAt ? new Date(ticket.createdAt).toISOString() : null;
    this.cancelledAt = ticket.cancelledAt ? new Date(ticket.cancelledAt).toISOString() : null;

    // Sanitización segura de la relación Usuario
    if (ticket.user && typeof ticket.user === 'object' && 'email' in ticket.user) {
      this.user = new UserDTO(ticket.user);
    } else {
      this.user = ticket.user?.toString() || null;
    }

    // Sanitización segura de la relación Evento (reutiliza EventDTO)
    if (ticket.event && typeof ticket.event === 'object' && 'title' in ticket.event) {
      this.event = new EventDTO(ticket.event);
    } else {
      this.event = ticket.event?.toString() || null;
    }
  }
}