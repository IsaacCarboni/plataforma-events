import { productModel } from '../models/product.model.js';

/**
 * @class ProductRepository
 * @description Capa de abstracción de datos para los cortes de carne en MongoDB.
 */
export class ProductRepository {
  async getAll() {
    return await productModel.find().lean();
  }

  async getById(id) {
    return await productModel.findById(id).lean();
  }

  async create(productData) {
    return await productModel.create(productData);
  }

  async getExpiringSoon(days) {
    const now = new Date();
    const limitDate = new Date();
    limitDate.setDate(now.getDate() + days);

    return await productModel.find({
      expirationDate: { $gte: now, $lte: limitDate },
      status: 'por_vencer',
    }).lean();
  }

  async delete(id) {
    return await productModel.findByIdAndDelete(id);
  }
}

export const productRepository = new ProductRepository();