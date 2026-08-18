import EErrors from '../../services/errors/enums.js';

export default (error, req, res, next) => {
    console.error(`[ERROR LOG]: ${error.name} - ${error.cause || error.message}`);

    switch (error.code) {
        case EErrors.INVALID_TYPES_ERROR:
            res.status(400).send({ status: 'error', error: error.name, message: error.message, cause: error.cause });
            break;
        case EErrors.AUTHENTICATION_ERROR:
            res.status(401).send({ status: 'error', error: error.name, message: error.message });
            break;
        case EErrors.AUTHORIZATION_ERROR:
            res.status(403).send({ status: 'error', error: error.name, message: error.message });
            break;
        case EErrors.RESOURCE_NOT_FOUND:
            res.status(404).send({ status: 'error', error: error.name, message: error.message });
            break;
        default:
            res.status(500).send({ status: 'error', error: 'UnhandledError', message: 'Error interno del servidor no controlado.' });
            break;
    }
};