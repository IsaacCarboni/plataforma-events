import passport from 'passport';

/**
 * Middleware de Autenticación Centralizado (JWT Stateless)
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
        return next();
    })(req, res, next);
};

/**
 * Middleware de Autorización por Roles (RBAC)
 */
export const handleRoles = (roles = []) => {
    // Normaliza el parámetro a Array por si se pasa un string único (ej: handleRoles('admin'))
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'No autenticado.' });
        }

        const userRole = req.user.role || 'user';

        // Bypass de Admin (opcional pero recomendado) o verificación en la lista permitida
        if (userRole === 'admin' || allowedRoles.includes(userRole)) {
            return next();
        }

        return res.status(403).json({ 
            status: 'error', 
            message: `Acceso denegado: El rol '${userRole}' no cuenta con los permisos requeridos.` 
        });
    };
};