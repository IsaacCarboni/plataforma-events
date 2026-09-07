import { Router } from 'express';
import passport from 'passport';
import { login, getSessionProfile, logout } from '../controllers/session.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/sessions/register
router.post(
  '/register',
  passport.authenticate('register', { session: false, failureRedirect: '/api/sessions/fail-register' }),
  async (req, res) => {
    return res.status(201).json({ status: 'success', message: 'Usuario registrado con éxito.' });
  }
);

router.get('/fail-register', (req, res) => {
  return res.status(400).json({ status: 'error', message: 'Error al registrar: El email ya existe o los datos son inválidos.' });
});

// POST /api/sessions/login
router.post(
  '/login',
  passport.authenticate('login', { session: false, failureRedirect: '/api/sessions/fail-login' }),
  login
);

router.get('/fail-login', (req, res) => {
  return res.status(401).json({ status: 'error', message: 'Credenciales inválidas.' });
});

// GET /api/sessions/current
router.get('/current', authMiddleware, getSessionProfile);

// POST /api/sessions/logout
router.post('/logout', logout);

export default router;