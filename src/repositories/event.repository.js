import { EventDTO } from '../dtos/event.dto.js';

export class EventRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async getEventById(id) {
    const event = await this.dao.findById(id);
    return event ? new EventDTO(event) : null;
  }

  async createEvent(eventData) {
    const newEvent = await this.dao.create(eventData);
    return new EventDTO(newEvent);
  }

  async updateEvent(id, updateData) {
    const updated = await this.dao.update(id, updateData);
    return updated ? new EventDTO(updated) : null;
  }

  async getPaginatedEvents(query, options) {
    const result = await this.dao.paginate(query, options);
    return {
      ...result,
      docs: result.docs.map((doc) => new EventDTO(doc))
    };
  }
}