import { UserDTO } from './user.dto.js';

export class EventDTO {
  constructor(event) {
    this.id = event._id || event.id;
    this.title = event.title;
    this.description = event.description;
    this.date = event.date;
    this.location = event.location;
    this.capacity = event.capacity;
    this.price = event.price;
    this.status = event.status;
    this.category = event.category;

    // Si organizer está populado como objeto, lo pasa por UserDTO
    if (event.organizer && typeof event.organizer === 'object' && event.organizer.email) {
      this.organizer = new UserDTO(event.organizer);
    } else {
      this.organizer = event.organizer;
    }
  }
}