import mongoose from 'mongoose';

const productCollection = 'products';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },          // Ej: "Asado de tira", "Nalgas para milanesa"
  category: { type: String, required: true },      // Ej: "Carne Vacuna", "Cerdo", "Pollo", "Achuras"
  pricePerKg: { type: Number, required: true },    // Precio por kilogramo
  stockKg: { type: Number, required: true, default: 0 }, // Stock disponible en kg
  batchNumber: { type: String, required: true },   // Número de lote
  expirationDate: { type: Date, required: true },  // Fecha de vencimiento
  status: { 
    type: String, 
    enum: ['ok', 'por_vencer', 'vencido'], 
    default: 'ok' 
  }
}, {
  timestamps: true
});

export const productModel = mongoose.model(productCollection, productSchema);