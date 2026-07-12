import passport from 'passport';

/**
 * 🟢 Middleware de Autenticación (Reutilizable)
 * Lee el JWT desde la cookie 'currentUser' usando Passport, lo valida y puebla req.user.
 * Si falla, responde con el Error 401 que exige la rúbrica.
 */
export const authMiddleware = (req, res, next) => {
    // Usamos la estrategia 'current' de Passport que ya configuramos para extraer y validar la cookie
    passport.authenticate('current', { session: false }, (err, user, info) => {
        if (err) return next(err);
        
        // Si no hay usuario válido (falta token, expiró o es inválido) -> Error 401
        if (!user) {
            return res.status(401).json({ 
                status: 'error', 
                message: 'No autenticado: Token inválido, expirado o inexistente.' 
            });
        }
        
        // Guardamos el usuario decodificado en el request para que esté disponible en las rutas
        req.user = user;
        next();
    })(req, res, next);
};

/**
 * 🟠 Middleware de Autorización (Reutilizable)
 * Recibe un array de roles permitidos y los compara contra el rol de req.user.
 * Si no coincide, responde con el Error 403 que exige la rúbrica.
 */
export const handleRoles = (allowedRoles = []) => {
    return (req, res, next) => {
        // Validación de seguridad inicial si por alguna razón no pasó por authMiddleware primero
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'No autenticado.' });
        }

        const userRole = req.user.role || 'user';

        // Comparamos el rol del usuario logueado contra la lista de roles autorizados
        if (!allowedRoles.includes(userRole)) {
            // Si el rol no tiene permisos -> Error 403 (Forbidden) obligatorios
            return res.status(403).json({ 
                status: 'error', 
                message: `Acceso denegado: El rol '${userRole}' no tiene los privilegios necesarios.` 
            });
        }

        // Si el rol es correcto, permitimos avanzar al controlador
        next();
    };
};