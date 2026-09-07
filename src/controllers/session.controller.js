import { generateToken } from '../utils/jwt.js';

// Opciones reutilizables y consistentes para la cookie
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600000 // 1 hora
};

// 1️⃣ LOGIN: Emite JWT y lo guarda en cookie HTTP-Only
export const login = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
        }

        // Payload del JWT usando el rol asignado en DB
        const userPayload = {
            id: req.user._id,
            email: req.user.email,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            role: req.user.role || 'user'
        };

        const token = generateToken(userPayload);

        // Inyección de la cookie de forma segura
        res.cookie('currentUser', token, COOKIE_OPTIONS);

        return res.status(200).json({ 
            status: 'success', 
            message: '🎉 Login exitoso con Passport',
            user: userPayload
        });
    } catch (error) {
        return res.status(500).json({ 
            status: 'error', 
            message: 'Error interno en el servidor: ' + error.message 
        });
    }
};

// 2️⃣ CURRENT: Perfil obtenido desde la sesión/token
export const getSessionProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'No hay una sesión activa o el token expiró' });
    }
    
    return res.status(200).json({ 
        status: 'success', 
        payload: {
            id: req.user.id || req.user._id,
            email: req.user.email,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            role: req.user.role || 'user'
        }
    });
};

// 3️⃣ LOGOUT: Elimina la cookie asegurando los mismos parámetros
export const logout = async (req, res) => {
    res.clearCookie('currentUser', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });

    return res.status(200).json({ status: 'success', message: 'Sesión cerrada correctamente' });
};