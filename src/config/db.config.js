import mongoose from 'mongoose';
import logger from '../utils/logger.js'; // 👈 Importamos Winston

/**
 * Configuración y Conexión a la Base de Datos
 * Inicializa la conexión asíncrona con MongoDB utilizando la variable de entorno directa.
 */
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri || mongoUri.includes('tu_conexion')) {
            throw new Error("Cadena de conexión inválida o no configurada en las variables de entorno (.env).");
        }

        // Conexión a MongoDB con límite de tiempo de 3 segundos
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 3000, 
        });
        
        logger.info("Conexión establecida con éxito a la base de datos."); // 👈 Log con Winston
    } catch (error) {
        logger.fatal(`Error crítico en el módulo de base de datos: ${error.message}`); // 👈 Log fatal
        logger.warning("Verifique la conectividad de red y la lista blanca de direcciones IP en el panel."); // 👈 Log warning
        
        process.exit(1);
    }
};

export { connectDB };