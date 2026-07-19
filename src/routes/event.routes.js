import { Router } from 'express';
import { createEvent, getEvents, updateEvent } from '../controllers/event.controller.js';
// Importamos la seguridad que armamos recién
import { authMiddleware, handleRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// 1. Obtener la lista completa de eventos mediante el controlador (Solo si está autenticado -> 401 si no)
router.get('/', authMiddleware, getEvents);

// 2. Crear un nuevo evento mediante el controlador (Solo organizer o admin -> 403 si es user)
router.post('/', authMiddleware, handleRoles(['organizer', 'admin']), createEvent);

// 3. 🌟 NUEVO: Modificar o cancelar un evento (Solo organizer o admin -> Pasa a la lógica de propiedad en el controlador)
router.put('/:id', authMiddleware, handleRoles(['organizer', 'admin']), updateEvent);

// 4. 🌟 NUEVO: Ruta Administrativa exigida por la rúbrica (Exclusiva para Admin -> 403 si entra un organizer o user)
router.get('/admin/users', authMiddleware, handleRoles(['admin']), async (req, res) => {
    try {
        // Importación dinámica para mantener el desacoplamiento de capas
        const { UserModel } = await import('../models/user.model.js');
        // Traemos todos los usuarios del sistema ocultando la contraseña por seguridad
        const users = await UserModel.find({}, '-password'); 
        
        res.status(200).json({ 
            status: 'success', 
            message: '🎉 Listado de usuarios obtenido con éxito (Acceso Administrativo)',
            data: users 
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: '❌ Error en el servidor administrativo',
            error: error.message 
        });
    }
});

export default router;