import { Router } from 'express';
import { ProductsController } from '../controllers/products.controller.js';

const router = Router();

// Rutas del inventario de carnicería
router.get('/', ProductsController.getProducts);
router.get('/expiring', ProductsController.getExpiring);
router.get('/:pid', ProductsController.getProductById);
router.post('/', ProductsController.createProduct);

export default router;