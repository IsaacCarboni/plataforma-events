import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { productModel as ProductModel } from '../models/product.model.js';
dotenv.config();

// Listado de cortes reales con precios de mercado
const cortesIniciales = [
  // --- CARNE VACUNA ---
  {
    name: "Asado de Tira",
    category: "Carne Vacuna",
    pricePerKg: 21900,
    stockKg: 45.5,
    batchNumber: "LOTE-VAC-01",
    expirationDate: "2026-09-22T00:00:00.000Z"
  },
  {
    name: "Vacío",
    category: "Carne Vacuna",
    pricePerKg: 24500,
    stockKg: 35.0,
    batchNumber: "LOTE-VAC-01",
    expirationDate: "2026-09-23T00:00:00.000Z"
  },
  {
    name: "Matambre Vacuno",
    category: "Carne Vacuna",
    pricePerKg: 21500,
    stockKg: 20.0,
    batchNumber: "LOTE-VAC-01",
    expirationDate: "2026-09-20T00:00:00.000Z"
  },
  {
    name: "Nalga para Milanesa",
    category: "Carne Vacuna",
    pricePerKg: 8900,
    stockKg: 60.0,
    batchNumber: "LOTE-VAC-02",
    expirationDate: "2026-09-25T00:00:00.000Z"
  },
  {
    name: "Peceto",
    category: "Carne Vacuna",
    pricePerKg: 10500,
    stockKg: 25.0,
    batchNumber: "LOTE-VAC-02",
    expirationDate: "2026-09-24T00:00:00.000Z"
  },
  {
    name: "Lomo",
    category: "Carne Vacuna",
    pricePerKg: 12500,
    stockKg: 18.0,
    batchNumber: "LOTE-VAC-02",
    expirationDate: "2026-09-21T00:00:00.000Z"
  },
  {
    name: "Bife de Chorizo",
    category: "Carne Vacuna",
    pricePerKg: 11200,
    stockKg: 30.0,
    batchNumber: "LOTE-VAC-02",
    expirationDate: "2026-09-22T00:00:00.000Z"
  },
  {
    name: "Quadril",
    category: "Carne Vacuna",
    pricePerKg: 9200,
    stockKg: 40.0,
    batchNumber: "LOTE-VAC-03",
    expirationDate: "2026-09-26T00:00:00.000Z"
  },
  {
    name: "Carne Molida Especial",
    category: "Carne Vacuna",
    pricePerKg: 6800,
    stockKg: 50.0,
    batchNumber: "LOTE-VAC-03",
    expirationDate: "2026-09-18T00:00:00.000Z" // Próximo a vencer
  },
  {
    name: "Entraña",
    category: "Carne Vacuna",
    pricePerKg: 13000,
    stockKg: 15.0,
    batchNumber: "LOTE-VAC-03",
    expirationDate: "2026-09-19T00:00:00.000Z"
  },

  // --- CARNE PORCINA ---
  {
    name: "Costilla de Cerdo",
    category: "Carne Porcina",
    pricePerKg: 6500,
    stockKg: 35.0,
    batchNumber: "LOTE-POR-01",
    expirationDate: "2026-09-24T00:00:00.000Z"
  },
  {
    name: "Pechito de Cerdo",
    category: "Carne Porcina",
    pricePerKg: 6800,
    stockKg: 28.0,
    batchNumber: "LOTE-POR-01",
    expirationDate: "2026-09-23T00:00:00.000Z"
  },
  {
    name: "Bondiola",
    category: "Carne Porcina",
    pricePerKg: 7900,
    stockKg: 22.0,
    batchNumber: "LOTE-POR-01",
    expirationDate: "2026-09-22T00:00:00.000Z"
  },
  {
    name: "Matambrito de Cerdo",
    category: "Carne Porcina",
    pricePerKg: 8500,
    stockKg: 16.0,
    batchNumber: "LOTE-POR-01",
    expirationDate: "2026-09-21T00:00:00.000Z"
  },

  // --- AVÍCOLA / POLLO ---
  {
    name: "Pollo Entero",
    category: "Avícola",
    pricePerKg: 3200,
    stockKg: 80.0,
    batchNumber: "LOTE-AVI-01",
    expirationDate: "2026-09-20T00:00:00.000Z"
  },
  {
    name: "Pechuga desosada",
    category: "Avícola",
    pricePerKg: 5800,
    stockKg: 40.0,
    batchNumber: "LOTE-AVI-01",
    expirationDate: "2026-09-21T00:00:00.000Z"
  },
  {
    name: "Pata Muslo",
    category: "Avícola",
    pricePerKg: 2900,
    stockKg: 65.0,
    batchNumber: "LOTE-AVI-01",
    expirationDate: "2026-09-22T00:00:00.000Z"
  }
];

const seedProducts = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL;
    
    if (!mongoUri) {
      throw new Error("No se encontró la variable de entorno MONGO_URI en el archivo .env");
    }

    console.log("⏳ Conectando a MongoDB para ejecutar el seed...");
    await mongoose.connect(mongoUri);

    // 1. Limpia los productos existentes para no duplicar
    await ProductModel.deleteMany({});
    console.log("🧹 Colección de productos limpiada.");

    // 2. Inserta el listado completo
    const createdProducts = await ProductModel.insertMany(cortesIniciales);
    console.log(`✅ ¡Se cargaron ${createdProducts.length} cortes de carne con éxito!`);

    await mongoose.disconnect();
    console.log("🔌 Conexión cerrada. Script finalizado.");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error al ejecutar el seeding de productos:", error);
    process.exit(1);
  }
};

seedProducts();