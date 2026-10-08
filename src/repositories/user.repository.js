import { UserModel } from '../models/user.model.js';

/**
 * @class UserRepository
 * @description Capa de abstracción y persistencia de datos para la entidad de Usuarios.
 * Encapsula la interacción directa con la base de datos (Mongoose / MongoDB Atlas).
 */
export class UserRepository {
  /**
   * Obtiene la lista completa de usuarios registrados.
   * @returns {Promise<Array<Object>>} Colección de usuarios formateados en plain JS objects.
   */
  async findAll() {
    return await UserModel.find().lean();
  }

  /**
   * Busca un usuario específico por su identificador único (_id).
   * @param {string} id - ID del usuario en formato ObjectId de MongoDB.
   * @returns {Promise<Object|null>} Documento del usuario o null si no existe.
   */
  async findById(id) {
    return await UserModel.findById(id).lean();
  }

  /**
   * Busca un usuario dentro del sistema a partir de su correo electrónico.
   * @param {string} email - Correo electrónico a consultar.
   * @returns {Promise<Object|null>} Documento del usuario o null si no se encuentra match.
   */
  async findByEmail(email) {
    return await UserModel.findOne({ email }).lean();
  }

  /**
   * Registra y persiste un nuevo usuario en la base de datos.
   * @param {Object} userData - Estructura de datos del nuevo usuario a crear.
   * @returns {Promise<Object>} Registro del usuario recién creado.
   */
  async create(userData) {
    return await UserModel.create(userData);
  }

  /**
   * Actualiza los datos de un usuario existente por su ID.
   * @param {string} id - ID del usuario a modificar.
   * @param {Object} userData - Atributos y campos a actualizar.
   * @returns {Promise<Object|null>} Documento del usuario actualizado.
   */
  async update(id, userData) {
    return await UserModel.findByIdAndUpdate(id, userData, { new: true }).lean();
  }

  /**
   * Elimina de forma definitiva el registro de un usuario en la base de datos.
   * @param {string} id - ID del usuario a eliminar.
   * @returns {Promise<Object|null>} Documento eliminado o null si no existía.
   */
  async delete(id) {
    return await UserModel.findByIdAndDelete(id).lean();
  }
}

export const userRepository = new UserRepository();