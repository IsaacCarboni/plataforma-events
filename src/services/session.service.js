import { userDAO } from '../dao/user.dao.js';
import { createHash, isValidPassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';
import CustomError from './errors/CustomError.js';
import EErrors from './errors/enums.js';
import { generateUserErrorParam } from './errors/info.js';

class SessionService {
  /**
   * Registra un nuevo usuario con validaciones y contraseña encriptada
   */
  async registerUser(userData) {
    const { first_name, last_name, email, password } = userData;

    if (!first_name || !last_name || !email || !password) {
      CustomError.createError({
        name: 'UserValidationError',
        cause: generateUserErrorParam(userData),
        message: 'Faltan campos obligatorios para registrar al usuario.',
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    if (!email.includes('@') || password.length < 6) {
      CustomError.createError({
        name: 'UserValidationError',
        message: 'Formato de email inválido o contraseña demasiado corta (mínimo 6 caracteres).',
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const exists = await userDAO.findByEmail(normalizedEmail);
    if (exists) {
      CustomError.createError({
        name: 'UserAlreadyExistsError',
        message: 'El email ya se encuentra registrado.',
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    const hashedPassword = await createHash(password);

    const newUser = await userDAO.create({
      first_name,
      last_name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Sanitizamos la respuesta para no devolver la contraseña encriptada
    const userResponse = newUser.toObject ? newUser.toObject() : { ...newUser };
    delete userResponse.password;

    return userResponse;
  }

  /**
   * Autentica credenciales y devuelve token JWT
   */
  async loginUser(email, password) {
    if (!email || !password) {
      CustomError.createError({
        name: 'AuthenticationError',
        message: 'Debes proporcionar email y contraseña.',
        code: EErrors.AUTHENTICATION_ERROR,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await userDAO.findByEmail(normalizedEmail);
    if (!user) {
      CustomError.createError({
        name: 'AuthenticationError',
        message: 'Credenciales inválidas.',
        code: EErrors.AUTHENTICATION_ERROR,
      });
    }

    const isPasswordValid = await isValidPassword(password, user.password);
    if (!isPasswordValid) {
      CustomError.createError({
        name: 'AuthenticationError',
        message: 'Credenciales inválidas.',
        code: EErrors.AUTHENTICATION_ERROR,
      });
    }

    const token = generateToken(user);
    return { token, user: { id: user._id || user.id, email: user.email, role: user.role } };
  }
}

export const sessionService = new SessionService();