import { productRepository } from '../repositories/product.repository.js';
import CustomError from './errors/CustomError.js';
import EErrors from './errors/enums.js';

/**
 * @class ProductService
 * @description Capa de negocio para la gestión de productos y control de vencimientos.
 */
export class ProductService {
  async getAllProducts() {
    return await productRepository.getAll();
  }

  async getProductById(id) {
    const product = await productRepository.getById(id);
    if (!product) {
      CustomError.createError({
        name: 'NotFoundError',
        message: 'Producto no encontrado.',
        code: EErrors.RESOURCE_NOT_FOUND,
      });
    }
    return product;
  }

  async createProduct(productData) {
    // Si viene fecha de vencimiento, calculamos el estado inicial
    if (productData.expirationDate) {
      const now = new Date();
      const expDate = new Date(productData.expirationDate);
      const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        productData.status = 'vencido';
      } else if (diffDays <= 3) {
        productData.status = 'por_vencer';
      } else {
        productData.status = 'ok';
      }
    }

    return await productRepository.create(productData);
  }

  async getExpiringProducts(days) {
    const parsedDays = parseInt(days) || 3;
    return await productRepository.getExpiringSoon(parsedDays);
  }

  async deleteProduct(id) {
    const product = await productRepository.getById(id);
    if (!product) {
      CustomError.createError({
        name: 'NotFoundError',
        message: 'El producto a eliminar no existe.',
        code: EErrors.RESOURCE_NOT_FOUND,
      });
    }
    return await productRepository.delete(id);
  }
}