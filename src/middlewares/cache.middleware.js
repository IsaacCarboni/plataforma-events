import redisClient from '../config/redis.config.js';

/**
 * Middleware para almacenar en caché las respuestas GET de la API en Redis.
 * @param {number} ttlSeconds - Tiempo de vida de la clave en segundos (por defecto 60s).
 */
export const cacheEvents = (ttlSeconds = 60) => {
  return async (req, res, next) => {
    // 1. Iniciamos el cronómetro de alta precisión con process.hrtime()
    const startTime = process.hrtime();

    // Si la conexión con Redis no está abierta, saltamos el caché y vamos directo a la BD
    if (!redisClient.isOpen) return next();

    try {
      // Usamos la URL completa (incluyendo query params) como clave única
      const cacheKey = `events:${req.originalUrl}`;
      const cachedData = await redisClient.get(cacheKey);

      // --- CASO 1: CACHE HIT (El dato existe en Redis) ---
      if (cachedData) {
        // Calculamos la diferencia de tiempo entre el inicio y el fin
        const diff = process.hrtime(startTime);
        const durationInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

        console.log(`🚀 [Cache Hit] Sirviendo desde Redis: ${cacheKey} (${durationInMs}ms)`);

        // Enviamos las métricas en los Headers HTTP
        res.setHeader('X-Response-Time', `${durationInMs}ms`);
        res.setHeader('X-Cache-Status', 'HIT (Redis)');

        return res.status(200).json(JSON.parse(cachedData));
      }

      // --- CASO 2: CACHE MISS (El dato NO existe en Redis) ---
      console.log(`🐢 [Cache Miss] Datos no encontrados en memoria. Consultando MongoDB...`);

      // Sobreescribimos res.json para interceptar la respuesta cuando el controller termine
      const originalJson = res.json.bind(res);

      res.json = (body) => {
        // Guardamos en Redis únicamente si la respuesta de la base de datos fue exitosa (200)
        if (res.statusCode === 200) {
          redisClient.setEx(cacheKey, ttlSeconds, JSON.stringify(body)).catch((err) => {
            console.error('Error al guardar en Redis:', err.message);
          });
        }

        // Calculamos el tiempo total que tomó la consulta a MongoDB Atlas
        const diff = process.hrtime(startTime);
        const durationInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

        // Adjuntamos las métricas antes de enviar el JSON al cliente
        res.setHeader('X-Response-Time', `${durationInMs}ms`);
        res.setHeader('X-Cache-Status', 'MISS (MongoDB)');

        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Error en el middleware de caché:', error.message);
      next(); // Si falla Redis, la API no se cae y redirige a la BD
    }
  };
};