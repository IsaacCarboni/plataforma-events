import { ProductService } from '../services/product.service.js';

const productService = new ProductService();

export class ProductsController {
  static async getProducts(req, res) {
    try {
      const products = await productService.getAllProducts();
      res.status(200).json({ status: 'success', payload: products });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async getProductById(req, res) {
    try {
      const { pid } = req.params;
      const product = await productService.getProductById(pid);
      res.status(200).json({ status: 'success', payload: product });
    } catch (error) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  }

  static async createProduct(req, res) {
    try {
      const newProduct = await productService.createProduct(req.body);
      res.status(201).json({ status: 'success', payload: newProduct });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  static async getExpiring(req, res) {
    try {
      const days = req.query.days ? parseInt(req.query.days) : 3;
      const expiringProducts = await productService.getExpiringProducts(days);
      res.status(200).json({ status: 'success', payload: expiringProducts });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}