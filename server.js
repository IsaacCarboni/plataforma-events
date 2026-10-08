import app from './app.js';
import { connectDB } from './src/config/db.config.js';

const PORT = process.env.PORT || 8080;

// Función de arranque de la infraestructura
const startServer = async () => {
  try {
    // 1. Conectamos la base de datos antes de escuchar peticiones
    await connectDB();

    // 2. Levantamos el servidor en 0.0.0.0 (esencial para Docker)
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor escuchando peticiones en el puerto: ${PORT}`);
    });

    // 3. Graceful Shutdown: Apagado limpio del contenedor Docker
    const shutdown = (signal) => {
      console.log(`\n⚠️ Recibida señal ${signal}. Cerrando servidor...`);
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));   // Para Ctrl+C en terminal
    process.on('SIGTERM', () => shutdown('SIGTERM')); // Para docker stop / docker-compose down

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();