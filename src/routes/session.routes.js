import { Router } from 'express';
import passport from 'passport';
import { login, getSessionProfile, logout } from '../controllers/session.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * Registro Público de Usuarios
 * Filtra el body para asegurar que las altas externas tengan rol 'user' por defecto.
 */
router.post('/register', 
    (req, res, next) => {
        if (req.body.role) {
            req.body.role = 'user'; 
        }
        next();
    },
    passport.authenticate('register', { session: false, failureRedirect: '/api/sessions/fail-register' }), 
    async (req, res) => {
        res.status(201).json({ status: "success", message: "Usuario registrado con éxito." });
    }
);

router.get('/fail-register', (req, res) => {
    res.status(400).json({ status: "error", message: "Error al registrar: El email ya existe o los datos son inválidos." });
});

/**
 * Autenticación y Login
 */
router.post('/login', 
    passport.authenticate('login', { session: false, failureRedirect: '/api/sessions/fail-login' }), 
    login
);

router.get('/fail-login', (req, res) => {
    res.status(401).json({ status: "error", message: "Credenciales inválidas." });
});

/**
 * Perfil de la Sesión Actual
 */
router.get('/current', 
    authMiddleware, 
    getSessionProfile
);

/**
 * Cierre de Sesión
 */
router.post('/logout', logout);

export default router;