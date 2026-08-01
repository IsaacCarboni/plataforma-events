import { EventModel } from '../models/event.model.js';

export class EventDAO {
  async findById(id) {
    return await EventModel.findById(id);
  }

  async create(eventData) {
    return await EventModel.create(eventData);
  }

  async update(id, updateData) {
    return await EventModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async paginate(query, options) {
    return await EventModel.paginate(query, options);
  }
}