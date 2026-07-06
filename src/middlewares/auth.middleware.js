import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    // Buscamos el token dentro de las cookies que nos manda el cliente
    const token = req.cookies?.currentUser;

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'No autenticado: Falta el token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Guardamos el id, email y role en el request
        next();
    } catch (error) {
        return res.status(401).json({ status: 'error', message: 'Token inválido o expirado' });
    }
};