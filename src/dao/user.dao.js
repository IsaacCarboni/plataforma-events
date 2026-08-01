import { UserModel } from '../models/user.model.js';

class UserDAO {
  async findByEmail(email) {
    return await UserModel.findOne({ email });
  }

  async findById(id) {
    return await UserModel.findById(id);
  }

  async create(userData) {
    const newUser = new UserModel(userData);
    return await newUser.save();
  }
}

export const userDAO = new UserDAO();