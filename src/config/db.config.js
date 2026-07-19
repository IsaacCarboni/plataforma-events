import mongoose from 'mongoose';

/**
 * Configuración y Conexión a la Base de Datos
 * Inicializa la conexión asíncrona con MongoDB Atlas aplicando límites de tiempo estrictos.
 */
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URL || process.env.MONGO_URL.includes('tu_conexion')) {
            throw new Error("Cadena de conexión inválida o no configurada en las variables de entorno (.env).");
        }

        // Selección de servidor con límite de tiempo de 3 segundos para evitar bloqueos
        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 3000, 
        });
        
        console.log("Conexión establecida con éxito a MongoDB Atlas.");
    } catch (error) {
        console.error("Error crítico en el módulo de base de datos:", error.message);
        console.warn("Verifique la conectividad de red y la lista blanca de direcciones IP en el panel de Atlas.");
    }
};

export { connectDB };