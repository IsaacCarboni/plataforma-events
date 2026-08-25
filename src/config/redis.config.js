import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisClient = createClient({
  url: REDIS_URL
});

redisClient.on('connect', () => {
  console.log('⚡ Conexión establecida con éxito a Redis.');
});

redisClient.on('error', (err) => {
  console.error('❌ Error en el cliente de Redis:', err.message);
});

try {
  await redisClient.connect();
} catch (error) {
  console.error('CRÍTICO: No se pudo conectar con Redis:', error.message);
}

export default redisClient;