import { sessionService } from '../services/session.service.js';

export const register = async (req, res) => {
    try {
        const newUser = await sessionService.registerUser(req.body);
        
        // Convertimos el documento de Mongoose a objeto para limpiar el password en la respuesta
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({ status: 'success', message: 'Usuario registrado con éxito', data: userResponse });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await sessionService.loginUser(email, password);

        // Enviamos el token mediante una cookie HTTP Only ultra segura
        res.cookie('currentUser', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600000 // 1 hora de vida
        });

        res.status(200).json({ status: 'success', message: 'Login exitoso' });
    } catch (error) {
        // Mantenemos el error genérico sin dar pistas de qué falló
        res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
    }
};

export const getSessionProfile = async (req, res) => {
    // El usuario ya viene inyectado en req.user por el middleware, sin la contraseña
    res.status(200).json({ status: 'success', payload: req.user });
};

export const logout = async (req, res) => {
    res.clearCookie('currentUser');
    res.status(200).json({ status: 'success', message: 'Sesión cerrada correctamente' });
};