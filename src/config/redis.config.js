import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    // Reintenta conectar automáticamente si la red parpadea
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.error('❌ Límite de reintentos de Redis alcanzado.');
        return new Error('Redis no disponible');
      }
      // Reintenta aumentando el tiempo entre intentos (exponencial)
      return Math.min(retries * 100, 3000);
    }
  }
});

redisClient.on('connect', () => {
  console.log('⚡ Conexión establecida con éxito a Redis.');
});

redisClient.on('error', (err) => {
  console.error('❌ Error en el cliente de Redis:', err.message);
});

// Función explícita para conectar desde el servidor principal (server.js / app.js)
export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error('CRÍTICO: No se pudo conectar con Redis:', error.message);
  }
};

export default redisClient;