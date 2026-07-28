import { Schema, model } from 'mongoose';

const ticketSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El ID de usuario es obligatorio.'],
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'El ID de evento es obligatorio.'],
    },
    status: {
      type: String,
      enum: {
        values: ['confirmed', 'pending', 'cancelled'],
        message: 'El estado del ticket debe ser confirmed, pending o cancelled.',
      },
      default: 'confirmed',
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
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

export const TicketModel = model('Ticket', ticketSchema);