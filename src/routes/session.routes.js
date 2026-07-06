import { Router } from 'express';
import { register, login, getSessionProfile, logout } from '../controllers/session.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/current', authMiddleware, getSessionProfile);
router.post('/logout', logout);

export default router;