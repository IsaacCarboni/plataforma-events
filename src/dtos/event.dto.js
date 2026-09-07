import { UserDTO } from './user.dto.js';

export class EventDTO {
  constructor(event = {}) {
    this.id = event._id?.toString() || event.id || null;
    this.title = event.title ?? '';
    this.description = event.description ?? '';
    this.date = event.date ? new Date(event.date).toISOString() : null;
    this.location = event.location ?? '';
    this.capacity = event.capacity ?? 0;
    this.price = event.price ?? 0;
    this.status = event.status ?? 'draft';
    this.category = event.category ?? 'general';

    // Verificación segura de objeto populado (evita la trampa de typeof null === 'object')
    if (event.organizer && typeof event.organizer === 'object' && 'email' in event.organizer) {
      this.organizer = new UserDTO(event.organizer);
    } else {
      this.organizer = event.organizer?.toString() || null;
    }
  }
}