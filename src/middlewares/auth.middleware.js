import passport from 'passport';

/**
 * Middleware de Autenticación Centralizado
 * Extrae y valida el token JWT desde la cookie 'currentUser'.
 * Responde con código 401 si la sesión no es válida, expiró o no existe.
 */
export const authMiddleware = (req, res, next) => {
    passport.authenticate('current', { session: false }, (err, user, info) => {
        if (err) return next(err);
        
        if (!user) {
            return res.status(401).json({ 
                status: 'error', 
                message: 'No autenticado: Token inválido, expirado o inexistente.' 
            });
        }
        
        req.user = user;
        next();
    })(req, res, next);
};

/**
 * Middleware de Autorización basado en Roles (RBAC)
 * Evalúa los privilegios del usuario autenticado contra los roles permitidos.
 * Responde con código 403 si el rol no cuenta con los permisos requeridos.
 */
export const handleRoles = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'No autenticado.' });
        }

        const userRole = req.user.role || 'default user';

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ 
                status: 'error', 
                message: `Acceso denegado: El rol '${userRole}' no tiene los privilegios necesarios para realizar esta acción.` 
            });
        }

        next();
    };
};