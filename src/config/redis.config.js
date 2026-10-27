import { createClient } from 'redis';
import logger from '../utils/logger.js'; // 👈 Importamos Winston

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    // Reintenta conectar automáticamente si la red parpadea
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        logger.error('Límite de reintentos de Redis alcanzado.'); // 👈 Log con Winston
        return new Error('Redis no disponible');
      }
      // Reintenta aumentando el tiempo entre intentos (exponencial)
      return Math.min(retries * 100, 3000);
    }
  }
});

redisClient.on('connect', () => {
  logger.info('Conexión establecida con éxito a Redis.'); // 👈 Log con Winston
});

redisClient.on('error', (err) => {
  logger.error(`Error en el cliente de Redis: ${err.message}`); // 👈 Log con Winston
});

// Función explícita para conectar desde el servidor principal (server.js / app.js)
export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    logger.fatal(`CRÍTICO: No se pudo conectar con Redis: ${error.message}`); // 👈 Log fatal
  }
};

export default redisClient;