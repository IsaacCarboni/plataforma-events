import { UserDTO } from './user.dto.js';
import { EventDTO } from './event.dto.js';

export class TicketDTO {
  constructor(ticket) {
    this.id = ticket._id || ticket.id;
    this.quantity = ticket.quantity;
    this.reservationCode = ticket.reservationCode;
    this.status = ticket.status;
    this.createdAt = ticket.createdAt;
    this.cancelledAt = ticket.cancelledAt;

    if (ticket.user && typeof ticket.user === 'object' && ticket.user.email) {
      this.user = new UserDTO(ticket.user);
    } else {
      this.user = ticket.user;
    }

    if (ticket.event && typeof ticket.event === 'object' && ticket.event.title) {
      this.event = new EventDTO(ticket.event);
    } else {
      this.event = ticket.event;
    }
  }
}