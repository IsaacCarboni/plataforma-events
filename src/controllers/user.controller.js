import { userService } from '../services/user.service.js';

/**
 * @class UserController
 * @description Controladores HTTP para la gestión de usuarios.
 * Mapea las peticiones de Express con los métodos del servicio de usuarios.
 */
export class UserController {
  /**
   * Obtiene la lista de usuarios registrados.
   * @route GET /api/users
   */
  static async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({ status: 'success', payload: users });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene la información detallada de un usuario por su ID.
   * @route GET /api/users/:id
   */
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.status(200).json({ status: 'success', payload: user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Registra un nuevo usuario en la plataforma.
   * @route POST /api/users
   */
  static async createUser(req, res, next) {
    try {
      const newUser = await userService.createUser(req.body);
      res.status(201).json({ status: 'success', payload: newUser });
    } catch (error) {
      next(error);
    }
  }
}