import dotenv from 'dotenv';

// Carga las variables definidas en el archivo .env a process.env
dotenv.config();

/**
 * Lista de variables de entorno críticas necesarias para el inicio del servidor.
 */
const requiredEnvVars = ['PORT', 'MONGODB_URI', 'NODE_ENV'];

/**
 * Validación previa: Verifica la presencia de cada variable requerida.
 * Si falta alguna, frena la ejecución de inmediato (process.exit) con un mensaje explicativo en consola.
 */
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`\n❌ [ERROR CRÍTICO] Falta la variable de entorno obligatoria: [${envVar}]`);
    console.error(`👉 Por favor, definila en tu archivo .env antes de iniciar la aplicación.\n`);
    process.exit(1); // Detiene la ejecución del proceso Node.js con código de falla
  }
}

/**
 * @object config
 * @description Objeto inmutable de configuración centralizada.
 * Previene el uso disperso de `process.env` en los distintos módulos del proyecto.
 */
export const config = Object.freeze({
  port: Number(process.env.PORT) || 8080,
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'secretKeyDefault',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  mail: {
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM,
  },
});