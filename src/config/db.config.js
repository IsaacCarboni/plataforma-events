import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URL || process.env.MONGO_URL.includes('tu_conexion')) {
            throw new Error("No se detectó una URL válida en el archivo .env");
        }

        // Le metemos opciones de timeout estrictas para que no se congele 10 segundos
        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 3000, // 3 segundos máximo para conectar
        });
        
        console.log("✅ Conexión exitosa a MongoDB Atlas 🟢");
    } catch (error) {
        console.log("❌ Error crítico en base de datos 🟡:", error.message);
        console.log("⚠️ Asegurate de estar conectado a internet y tener tu IP habilitada en Atlas.");
    }
};

export { connectDB };