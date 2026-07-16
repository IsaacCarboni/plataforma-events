import { sessionService } from './session.service.js';
import { userDAO } from '../dao/user.dao.js';

// Creamos un adaptador o directamente usamos el DAO para las consultas de usuario que Passport necesita
export const userService = {
    getUserByEmail: async (email) => {
        return await userDAO.findByEmail(email);
    },
    getUserById: async (id) => {
        // Como no lo tenías en el DAO, lo resolvemos rápido buscando por ID
        // O podés agregar el método findById en tu userDAO más adelante
        const { UserModel } = await import('../models/user.model.js');
        return await UserModel.findById(id);
    },
    createUser: async (userData) => {
        return await userDAO.create(userData);
    }
};