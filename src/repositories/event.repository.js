import { EventModel } from '../models/event.model.js';
import { EventDTO } from '../dtos/event.dto.js';

export class EventRepository {
  async getEventById(id) {
    const event = await EventModel.findById(id).lean();
    return event ? new EventDTO(event) : null;
  }

  async createEvent(eventData) {
    const newEvent = await EventModel.create(eventData);
    return new EventDTO(newEvent);
  }

  async updateEvent(id, updateData) {
    const updated = await EventModel.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    }).lean();
    return updated ? new EventDTO(updated) : null;
  }

  async getPaginatedEvents(query, options) {
    const result = await EventModel.paginate(query, { ...options, lean: true });
    return {
      ...result,
      docs: result.docs.map((doc) => new EventDTO(doc))
    };
  }

  async deleteEvent(id) {
    return await EventModel.findByIdAndDelete(id).lean();
  }
}

export const eventRepository = new EventRepository();