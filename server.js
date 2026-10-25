import app from './app.js';
import { connectDB } from './src/config/db.config.js';
import logger from './src/utils/logger.js'; // 👈 Importamos Winston

const PORT = process.env.PORT || 8080;

/**
 * @function startServer
 * @description Inicializa la conexión a la base de datos y arranca el servidor HTTP con Graceful Shutdown.
 */
const startServer = async () => {
  try {
    // 1. Conectamos la base de datos antes de escuchar peticiones
    await connectDB();
    logger.info('Conexión a MongoDB establecida exitosamente'); // 👈 Log con Winston

    // 2. Levantamos el servidor en 0.0.0.0 (esencial para Docker)
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Servidor ShipNow escuchando peticiones en el puerto: ${PORT}`); // 👈 Log con Winston
    });

    // 3. Graceful Shutdown: Apagado limpio del contenedor Docker / proceso local
    const shutdown = (signal) => {
      logger.warning(`\n⚠️ Recibida señal ${signal}. Cerrando servidor de forma segura...`); // 👈 Log con Winston
      server.close(() => {
        logger.info('✅ Servidor cerrado correctamente.'); // 👈 Log con Winston
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));   // Para Ctrl+C en terminal local
    process.on('SIGTERM', () => shutdown('SIGTERM')); // Para docker stop / docker-compose down

  } catch (error) {
    logger.fatal(`❌ Error crítico al iniciar el servidor: ${error.message}`); // 👈 Log fatal con Winston
    process.exit(1);
  }
};

startServer();