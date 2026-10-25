import { Router } from 'express';
import { mockController } from '../controllers/mock.controller.js';

const router = Router();

/**
 * @route GET /api/mocks/users
 * @description Retorna usuarios falsos generados con Faker en memoria.
 */
router.get('/users', mockController.getMockUsers);

/**
 * @route GET /api/mocks/products
 * @description Retorna productos falsos generados con Faker en memoria.
 */
router.get('/products', mockController.getMockProducts);

/**
 * @route POST /api/mocks/seed
 * @description Inserta registros de prueba en la base de datos de MongoDB.
 */
router.post('/seed', mockController.seedData);

export default router;