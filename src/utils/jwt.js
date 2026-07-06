import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
    // Generamos el token guardando solo los datos mínimos requeridos (id, email, role)
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
};