import EErrors from '../../services/errors/enums.js';

export default (error, req, res, next) => {
  // Registrar el log detallado del error
  console.error(`[ERROR LOG]: ${error.name || 'UnhandledError'} - ${error.cause || error.message}`);

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