import { Router } from 'express';
import passport from 'passport';
import { login, getSessionProfile, logout } from '../controllers/session.controller.js';

const router = Router();

// 1️⃣ REGISTRO (Ya no necesita controlador externo, Passport hace todo)
router.post('/register', 
    passport.authenticate('register', { session: false, failureRedirect: '/api/sessions/fail-register' }), 
    async (req, res) => {
        res.status(201).json({ status: "success", message: "🎉 ¡Usuario registrado con éxito!" });
    }
);

router.get('/fail-register', (req, res) => {
    res.status(400).json({ status: "error", message: "Error al registrar: El email ya existe o faltan datos." });
});

// 2️⃣ LOGIN (Passport valida credenciales, si da OK, salta al controlador 'login')
router.post('/login', 
    passport.authenticate('login', { session: false, failureRedirect: '/api/sessions/fail-login' }), 
    login
);

router.get('/fail-login', (req, res) => {
    res.status(401).json({ status: "error", message: "Credenciales inválidas." });
});

// 3️⃣ CURRENT (Passport lee la cookie, valida el JWT y salta a 'getSessionProfile')
router.get('/current', 
    passport.authenticate('current', { session: false }), 
    getSessionProfile
);

// 4️⃣ LOGOUT (Sigue directo, no toca Passport)
router.post('/logout', logout);

export default router;