import { UserModel } from '../models/user.model.js';

class UserDAO {
    async findByEmail(email) {
        return await UserModel.findOne({ email });
    }

    async create(userData) {
        return await UserModel.create(userData);
    }
}

export const userDAO = new UserDAO();