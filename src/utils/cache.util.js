import redisClient from '../config/redis.config.js';

/**
 * Invalida de forma no bloqueante todas las claves de caché del módulo de eventos
 */
export const clearEventsCache = async () => {
  if (!redisClient?.isOpen) return;

  try {
    const keysToDelete = [];

    // Usamos scanIterator en lugar de keys() para no bloquear el hilo de Redis
    for await (const key of redisClient.scanIterator({ MATCH: 'events:*', COUNT: 100 })) {
      keysToDelete.push(key);
    }

    if (keysToDelete.length > 0) {
      await redisClient.del(keysToDelete);
      console.log(`🧹 [Cache Invalidation] Se eliminaron ${keysToDelete.length} clave(s) de Redis.`);
    }
  } catch (error) {
    console.error('⚠️ [Cache Invalidation Error] Error al limpiar el caché:', error.message);
  }
};