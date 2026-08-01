import { userDAO } from '../dao/user.dao.js';

export const userService = {
  getUserByEmail: async (email) => await userDAO.findByEmail(email),
  getUserById: async (id) => await userDAO.findById(id),
  createUser: async (userData) => await userDAO.create(userData),
};