import { productModel } from '../models/product.model.js';

export class ProductDAO {
  async getAll() {
    return await productModel.find().lean();
  }

  async getById(id) {
    return await productModel.findById(id).lean();
  }

  async create(productData) {
    return await productModel.create(productData);
  }

  async update(id, productData) {
    return await productModel.findByIdAndUpdate(id, productData, { new: true });
  }

  async delete(id) {
    return await productModel.findByIdAndDelete(id);
  }

  // Consulta específica para buscar productos próximos a vencer
  async getExpiringSoon(daysThreshold = 3) {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + daysThreshold);

    return await productModel.find({
      expirationDate: { $lte: limitDate },
      status: { $ne: 'vencido' }
    }).lean();
  }
}