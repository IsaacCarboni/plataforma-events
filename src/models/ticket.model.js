import { Schema, model } from 'mongoose';

const ticketSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, 'El ID de usuario es obligatorio.'],
      index: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'events',
      required: [true, 'El ID de evento es obligatorio.'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['confirmed', 'pending', 'cancelled'],
        message: 'El estado del ticket debe ser confirmed, pending o cancelled.',
      },
      default: 'confirmed',
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'La cantidad de entradas es obligatoria.'],
      min: [1, 'Debes solicitar al menos 1 entrada.'],
    },
    reservationCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para acelerar la búsqueda de entradas de un usuario en un evento específico
ticketSchema.index({ user: 1, event: 1 });

export const TicketModel = model('tickets', ticketSchema);