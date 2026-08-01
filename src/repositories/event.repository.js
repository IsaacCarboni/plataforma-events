import { EventDTO } from '../dtos/event.dto.js';

export class EventRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async getEventById(id) {
    const event = await this.dao.findById(id);
    if (!event) return null;
    return new EventDTO(event);
  }

  async createEvent(eventData) {
    const newEvent = await this.dao.create(eventData);
    return new EventDTO(newEvent);
  }

  async updateEvent(id, updateData) {
    const updated = await this.dao.update(id, updateData);
    if (!updated) return null;
    return new EventDTO(updated);
  }

  async getPaginatedEvents(query, options) {
    return await this.dao.paginate(query, options);
  }
}