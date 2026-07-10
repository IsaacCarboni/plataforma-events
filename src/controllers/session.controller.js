import { generateToken } from '../utils/jwt.js'; 

// 1️⃣ REGISTER: Ya no lo exportamos acá porque lo maneja directamente Passport en las rutas.

// 2️⃣ LOGIN: Passport ya validó el usuario y nos lo deja servido en req.user
export const login = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
        }

        // Armamos el payload para el JWT con los datos que nos dio Passport
        const userPayload = {
            id: req.user._id,
            email: req.user.email,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            role: req.user.role || 'user'
        };

        // Generamos el token seguro usando tu función de jwt.js
        const token = generateToken(userPayload);

        // Enviamos el token mediante tu cookie HTTP Only ultra segura
        res.cookie('currentUser', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600000 // 1 hora de vida
        });

        res.status(200).json({ status: 'success', message: '🎉 Login exitoso con Passport' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno en el servidor: ' + error.message });
    }
};

// 3️⃣ CURRENT: Passport (JWT Strategy) ya leyó la cookie y nos dejó el payload en req.user
export const getSessionProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'No hay una sesión activa o el token expiró' });
    }
    // Devolvemos el payload limpio que nos inyectó Passport
    res.status(200).json({ status: 'success', payload: req.user });
};

// 4️⃣ LOGOUT: Limpia la cookie del navegador
export const logout = async (req, res) => {
    res.clearCookie('currentUser');
    res.status(200).json({ status: 'success', message: 'Sesión cerrada correctamente' });
};