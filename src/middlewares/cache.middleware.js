import redisClient from '../config/redis.config.js';
import logger from '../utils/logger.js'; // 👈 1. Importamos Winston

/**
 * Middleware para almacenar en caché las respuestas GET de la API en Redis.
 * @param {number} ttlSeconds - Tiempo de vida de la clave en segundos (por defecto 60s).
 */
export const cacheEvents = (ttlSeconds = 60) => {
  return async (req, res, next) => {
    const startTime = process.hrtime();

    // Si la conexión con Redis no está lista, salta directo a MongoDB
    if (!redisClient?.isOpen) return next();

    try {
      const cacheKey = `events:${req.originalUrl}`;
      const cachedData = await redisClient.get(cacheKey);

      // --- CASO 1: CACHE HIT (Servido desde RAM) ---
      if (cachedData) {
        const diff = process.hrtime(startTime);
        const durationInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

        logger.info(`🚀 [Cache Hit] Redis: ${cacheKey} (${durationInMs}ms)`); // 👈 Reemplazado por Winston info

        res.setHeader('X-Response-Time', `${durationInMs}ms`);
        res.setHeader('X-Cache-Status', 'HIT (Redis)');

        return res.status(200).json(JSON.parse(cachedData));
      }

      // --- CASO 2: CACHE MISS (Consulta a MongoDB) ---
      logger.debug(`🐢 [Cache Miss] Consultando MongoDB para ${cacheKey}...`); // 👈 Reemplazado por Winston debug

      const originalJson = res.json.bind(res);

      res.json = (body) => {
        // Cálculo de latencia
        const diff = process.hrtime(startTime);
        const durationInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

        // Inyección de headers de métricas previa a la emisión de respuesta
        if (!res.headersSent) {
          res.setHeader('X-Response-Time', `${durationInMs}ms`);
          res.setHeader('X-Cache-Status', 'MISS (MongoDB)');
        }

        // Escritura asíncrona no bloqueante en Redis si el status es OK
        if (res.statusCode === 200) {
          redisClient.setEx(cacheKey, ttlSeconds, JSON.stringify(body)).catch((err) => {
            logger.error(`⚠️ Error no bloqueante al guardar en Redis: ${err.message}`); // 👈 Reemplazado por Winston error
          });
        }

        return originalJson(body);
      };

      return next();
    } catch (error) {
      logger.error(`⚠️ Error en middleware de caché (Fallback a BD): ${error.message}`); // 👈 Reemplazado por Winston error
      return next();
    }
  };
};