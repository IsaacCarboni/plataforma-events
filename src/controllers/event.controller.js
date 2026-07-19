import { EventModel } from '../models/event.model.js';

// 1. Lógica efectiva para CREAR un evento nuevo
export const createEvent = async (req, res) => {
    try {
        // Desestructuramos todos los campos necesarios que pusimos en el modelo
        const { title, description, date, capacity, location, price } = req.body;

        // Pasamos todos los datos recibidos por el molde del modelo
        // 🌟 NUEVO: Inyectamos dinámicamente el ID del usuario logueado como organizador
        const newEvent = new EventModel({ 
            title, 
            description, 
            date, 
            capacity, 
            location, 
            price,
            organizer: req.user.id || req.user._id 
        });
        
        // Guardamos de forma asíncrona en la base de datos
        await newEvent.save();

        // Si todo sale bien, respondemos con código 201 (Creado)
        res.status(201).json({
            status: 'success',
            message: '🎉 ¡Evento creado con éxito!',
            data: newEvent
        });
    } catch (error) {
        // Si falta un dato obligatorio (como location) o hay error, cae acá
        res.status(400).json({
            status: 'error',
            message: '❌ No se pudo crear el evento',
            error: error.message
        });
    }
};

// 2. Lógica efectiva para TRAER todos los eventos
export const getEvents = async (req, res) => {
    try {
        // Usamos EventModel que es tu molde importado arriba
        const events = await EventModel.find();

        // Si todo sale bien, respondemos con código 200 (OK) y la data
        res.status(200).json({
            status: 'success',
            message: '🎉 Eventos obtenidos con éxito',
            data: events
        });
    } catch (error) {
        // Atajamos cualquier drama que pueda pasar con la base de datos
        res.status(500).json({
            status: 'error',
            message: '❌ No se pudieron obtener los eventos',
            error: error.message
        });
    }
};

// 3. 🌟 NUEVO: Lógica efectiva para MODIFICAR o CANCELAR un evento
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Buscamos el evento existente en la base de datos
        const event = await EventModel.findById(id);

        if (!event) {
            return res.status(404).json({ 
                status: 'error', 
                message: '❌ Evento no encontrado' 
            });
        }

        // 🛡️ CONTROL DE PROPIEDAD DEL RECURSO (Exigido por la rúbrica):
        // Si el usuario es 'organizer', verificamos que el ObjectId del creador coincida con su ID de sesión.
        // Si es 'admin', este filtro se saltea y puede modificar cualquier evento.
        const userId = req.user.id || req.user._id;
        if (req.user.role === 'organizer' && event.organizer.toString() !== userId.toString()) {
            return res.status(403).json({ 
                status: 'error', 
                message: '❌ Acción denegada: Un organizador solo puede modificar sus propios eventos.' 
            });
        }

        // Si pasó el control, actualizamos de forma asíncrona devolviendo el documento nuevo
        const updatedEvent = await EventModel.findByIdAndUpdate(id, req.body, { new: true });
        
        res.status(200).json({ 
            status: 'success', 
            message: '🎉 ¡Evento modificado con éxito!', 
            data: updatedEvent 
        });
    } catch (error) {
        res.status(400).json({ 
            status: 'error', 
            message: '❌ No se pudo modificar el evento',
            error: error.message 
        });
    }
};