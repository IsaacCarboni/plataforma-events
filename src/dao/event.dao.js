import { EventModel } from '../models/event.model.js';

export class EventDAO {
  
  // Busca un evento por ID (usa lean() para acelerar la respuesta si solo es lectura)
  async findById(id) {
    return EventModel.findById(id).lean();
  }

  // Crea un nuevo documento
  async create(eventData) {
    return EventModel.create(eventData);
  }

  // Actualiza y retorna el documento modificado
  async update(id, updateData) {
    return EventModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
  }

  // Paginación con Mongoose-Paginate
  async paginate(query, options) {
    return EventModel.paginate(query, { ...options, lean: true });
  }

  // Elimina un evento por ID
  async delete(id) {
    return EventModel.findByIdAndDelete(id);
  }
}