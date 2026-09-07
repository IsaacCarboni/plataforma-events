import { userDAO } from '../dao/user.dao.js';
import CustomError from './errors/CustomError.js';
import EErrors from './errors/enums.js';

export const userService = {
  /**
   * Busca un usuario por email previo formateo
   */
  getUserByEmail: async (email) => {
    if (!email) return null;
    const normalizedEmail = email.trim().toLowerCase();
    return await userDAO.findByEmail(normalizedEmail);
  },

  /**
   * Busca un usuario por ID con manejo de error si no existe
   */
  getUserById: async (id) => {
    if (!id) {
      CustomError.createError({
        name: 'InvalidParamError',
        message: 'Se requiere un ID válido de usuario.',
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    const user = await userDAO.findById(id);
    if (!user) {
      CustomError.createError({
        name: 'NotFoundError',
        message: 'Usuario no encontrado.',
        code: EErrors.RESOURCE_NOT_FOUND,
      });
    }

    return user;
  },

  /**
   * Crea un usuario normalizando su email
   */
  createUser: async (userData) => {
    if (!userData) {
      CustomError.createError({
        name: 'UserValidationError',
        message: 'No se recibieron datos para crear el usuario.',
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    if (userData.email) {
      userData.email = userData.email.trim().toLowerCase();
    }

    return await userDAO.create(userData);
  },
};