import { ProductDAO } from '../dao/product.dao.js';

const productDAO = new ProductDAO();

export class ProductService {
  async getAllProducts() {
    return await productDAO.getAll();
  }

  async getProductById(id) {
    const product = await productDAO.getById(id);
    if (!product) throw new Error('Producto no encontrado');
    return product;
  }

  async createProduct(productData) {
    // Calculamos el estado inicial según la fecha de vencimiento
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

    return await productDAO.create(productData);
  }

  async getExpiringProducts(days) {
    return await productDAO.getExpiringSoon(days);
  }

  async deleteProduct(id) {
    return await productDAO.delete(id);
  }
}