import { Schema, model } from 'mongoose';

// El molde real para la gestión de eventos de la plataforma
const eventSchema = new Schema({
    title: { 
        type: String, 
        required: true // Ej: "Conferencia Backend II", "Masterclass Node.js"
    },
    description: { 
        type: String, 
        required: true // Detalle del evento
    },
    date: { 
        type: Date, 
        required: true // Fecha y hora de realización
    },
    location: { 
        type: String, 
        required: true // Ej: "Modalidad Virtual" o "Auditorio Coder"
    },
    capacity: { 
        type: Number, 
        required: true // Cupos máximos disponibles para inscripciones
    },
    // 🌟 NUEVO: Vinculamos el evento con el ID del usuario (organizer/admin) que lo crea.
    // Esto nos permite cumplir con el criterio de que un organizer solo modifique sus propios eventos.
    organizer: { 
        type: Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['draft', 'published', 'cancelled'], 
        default: 'draft' // Estado del evento para el control de flujo
    }
}, { 
    timestamps: true // Registra cuándo se creó y modificó el evento
});

// Exportamos el modelo con consistencia total entre variable y colección
export const EventModel = model('events', eventSchema);