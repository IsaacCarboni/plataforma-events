import { UserModel } from '../models/user.model.js';

class UserDAO {
    async findByEmail(email) {
        // Busca directamente en la colección de MongoDB usando el modelo
        return await UserModel.findOne({ email });
    }

    async create(userData) {
        // Guarda el usuario real en la base de datos
        const newUser = new UserModel(userData);
        return await newUser.save();
    }
}

export const userDAO = new UserDAO();