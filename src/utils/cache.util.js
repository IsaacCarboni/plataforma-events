import redisClient from '../config/redis.config.js';

export const clearEventsCache = async () => {
  if (!redisClient.isOpen) return;

  try {
    const keys = await redisClient.keys('events:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`🧹 [Cache Invalidation] Se eliminaron ${keys.length} clave(s) de Redis.`);
    }
  } catch (error) {
    console.error('Error al limpiar el caché:', error.message);
  }
};