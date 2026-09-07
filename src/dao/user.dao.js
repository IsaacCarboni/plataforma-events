import { UserModel } from '../models/user.model.js';

class UserDAO {
  
  // Busca un usuario por email (mantiene documento Mongoose para comparar contraseñas)
  async findByEmail(email) {
    return UserModel.findOne({ email });
  }

  // Busca por ID (con opción de proyección para excluir el hash de la contraseña si es necesario)
  async findById(id) {
    return UserModel.findById(id).select('-password').lean();
  }

  // Crea un nuevo usuario en la base de datos
  async create(userData) {
    return UserModel.create(userData);
  }

  // Actualiza datos del perfil (nombre, edad, rol, etc.)
  async update(id, updateData) {
    return UserModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password').lean();
  }
}

export const userDAO = new UserDAO();