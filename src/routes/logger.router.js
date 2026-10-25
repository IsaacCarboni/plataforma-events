import { Router } from 'express';
import logger from '../utils/logger.js';

const router = Router();

router.get('/test-logs', (req, res) => {
    logger.debug('Mensaje de nivel: DEBUG');
    logger.http('Mensaje de nivel: HTTP');
    logger.info('Mensaje de nivel: INFO (Servidor operando correctamente)');
    logger.warning('Mensaje de nivel: WARNING (Precaución, recurso al límite)');
    logger.error('Mensaje de nivel: ERROR (Falló una operación crítica)');
    logger.fatal('Mensaje de nivel: FATAL (Error crítico del sistema)');

    res.status(200).json({
        status: 'success',
        message: '¡Logs de prueba generados en todos los niveles correctamente!'
    });
});

export default router;