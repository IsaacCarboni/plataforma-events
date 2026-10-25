import EErrors from '../../services/errors/enums.js';
import logger from '../../utils/logger.js'; // 👈 Importamos Winston

export default (error, req, res, next) => {
  // Registrar el log detallado del error usando Winston según su tipo o código
  if (error.code === EErrors.INVALID_TYPES_ERROR) {
    logger.warning(`[VALIDATION WARNING] ${error.name || 'InvalidTypesError'}: ${error.message} | Causa: ${error.cause || 'N/A'}`);
  } else if (error.code === EErrors.AUTHENTICATION_ERROR || error.code === EErrors.AUTHORIZATION_ERROR) {
    logger.warning(`[SECURITY WARNING] ${error.name || 'AuthError'}: ${error.message}`);
  } else if (error.code === EErrors.RESOURCE_NOT_FOUND) {
    logger.warning(`[NOT FOUND] ${error.name || 'NotFoundError'}: ${error.message}`);
  } else if (error.code === EErrors.DATABASE_ERROR) {
    logger.fatal(`[FATAL DATABASE ERROR] ${error.message}`);
  } else {
    logger.error(`[UNHANDLED ERROR] ${error.name || 'UnhandledError'}: ${error.message} | Causa: ${error.cause || 'N/A'}`);
  }

  switch (error.code) {
    case EErrors.INVALID_TYPES_ERROR:
      return res.status(400).send({
        status: 'error',
        error: error.name || 'InvalidTypesError',
        message: error.message,
        cause: error.cause || null
      });

    case EErrors.AUTHENTICATION_ERROR:
      return res.status(401).send({
        status: 'error',
        error: error.name || 'AuthenticationError',
        message: error.message
      });

    case EErrors.AUTHORIZATION_ERROR:
      return res.status(403).send({
        status: 'error',
        error: error.name || 'AuthorizationError',
        message: error.message
      });

    case EErrors.RESOURCE_NOT_FOUND:
      return res.status(404).send({
        status: 'error',
        error: error.name || 'NotFoundError',
        message: error.message
      });

    default:
      return res.status(500).send({
        status: 'error',
        error: 'UnhandledError',
        message: 'Error interno del servidor no controlado.'
      });
  }
};