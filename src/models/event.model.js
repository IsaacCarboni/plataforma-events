import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del evento es obligatorio.'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria.'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria.'],
      trim: true,
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'La fecha del evento es obligatoria.'],
    },
    location: {
      type: String,
      required: [true, 'La ubicación es obligatoria.'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'La capacidad es obligatoria.'],
      min: [1, 'La capacidad debe ser mayor a 0.'],
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio.'],
      min: [0, 'El precio no puede ser negativo.'],
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'cancelled', 'finished'],
        message: '{VALUE} no es un estado válido. Usa: draft, published, cancelled o finished.',
      },
      default: 'draft',
      index: true,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, 'El organizador es obligatorio.'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para acelerar consultas de cartelera (Eventos publicados ordenados por fecha)
eventSchema.index({ status: 1, date: 1 });

eventSchema.plugin(mongoosePaginate);

export const EventModel = model('events', eventSchema);