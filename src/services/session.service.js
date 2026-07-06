import { userDAO } from '../dao/user.dao.js';
import { createHash, isValidPassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

class SessionService {
    async registerUser(userData) {
        const { first_name, last_name, email, password } = userData;

        // 1. Validaciones de presencia, formato mínimo y normalización
        if (!first_name || !last_name || !email || !password) {
            throw new Error('Faltan campos obligatorios');
        }
        if (!email.includes('@') || password.length < 6) {
            throw new Error('Formato de email inválido o contraseña demasiado corta (mínimo 6 caracteres)');
        }

        const normalizedEmail = email.trim().toLowerCase();

        // 2. Verificar si el usuario ya existe a través del DAO
        const exists = await userDAO.findByEmail(normalizedEmail);
        if (exists) {
            throw new Error('El email ya está registrado');
        }

        // 3. Hashear contraseña y mandar a guardar al DAO
        const hashedPassword = await createHash(password);
        
        const newUser = await userDAO.create({
            first_name,
            last_name,
            email: normalizedEmail,
            password: hashedPassword
            // El rol no se pasa desde el body público, toma el default 'user' del modelo
        });

        return newUser;
    }

    async loginUser(email, password) {
        if (!email || !password) {
            throw new Error('Credenciales inválidas');
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Buscar usuario por email
        const user = await userDAO.findByEmail(normalizedEmail);
        if (!user) {
            throw new Error('Credenciales inválidas'); // Mensaje genérico por seguridad
        }

        // Comparar contraseña con bcrypt
        const isPasswordCorrect = await isValidPassword(password, user.password);
        if (!isPasswordCorrect) {
            throw new Error('Credenciales inválidas'); // Mensaje genérico por seguridad
        }

        // Generar el JWT
        const token = generateToken(user);
        return token;
    }
}

export const sessionService = new SessionService();