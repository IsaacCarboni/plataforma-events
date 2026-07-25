import { generateToken } from '../utils/jwt.js'; 

// 1️⃣ LOGIN: Passport ya validó el usuario y lo deja listo en req.user
export const login = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
        }

        // Armamos el payload para el JWT respetando el rol del usuario de la BD
        const userPayload = {
            id: req.user._id,
            email: req.user.email,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            role: req.user.role || 'user'
        };

        const token = generateToken(userPayload);

        res.cookie('currentUser', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600000 // 1 hora
        });

        res.status(200).json({ status: 'success', message: '🎉 Login exitoso con Passport' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno en el servidor: ' + error.message });
    }
};

// 2️⃣ CURRENT: Perfil obtenido desde la sesión/token
export const getSessionProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'No hay una sesión activa o el token expiró' });
    }
    
    res.status(200).json({ 
        status: 'success', 
        payload: {
            id: req.user.id || req.user._id,
            email: req.user.email,
            role: req.user.role || 'user'
        }
    });
};

// 3️⃣ LOGOUT: Limpia la cookie del navegador
export const logout = async (req, res) => {
    res.clearCookie('currentUser');
    res.status(200).json({ status: 'success', message: 'Sesión cerrada correctamente' });
};