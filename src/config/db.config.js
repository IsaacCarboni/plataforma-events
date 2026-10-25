import mongoose from 'mongoose';

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
        
        console.log("Conexión establecida con éxito a la base de datos.");
    } catch (error) {
        console.error("Error crítico en el módulo de base de datos:", error.message);
        console.warn("Verifique la conectividad de red y la lista blanca de direcciones IP en el panel.");
        
        process.exit(1);
    }
};

export { connectDB };