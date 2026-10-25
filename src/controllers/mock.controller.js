import { mockService } from '../services/mock.service.js';

/**
 * @class MockController
 * @description Controlador para gestionar los endpoints de generación de mocks y seeding.
 */
export class MockController {

  /**
   * Endpoint GET para obtener usuarios simulados sin persistirlos.
   * Ruta: /api/mocks/users?qty=10
   */
  getMockUsers = async (req, res, next) => {
    try {
      const qty = parseInt(req.query.qty) || 50; // Por defecto devuelve 50 si no se especifica
      const users = mockService.generateUsers(qty);
      
      return res.status(200).json({
        status: 'success',
        count: users.length,
        payload: users,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Endpoint GET para obtener productos simulados sin persistirlos.
   * Ruta: /api/mocks/products?qty=10
   */
  getMockProducts = async (req, res, next) => {
    try {
      const qty = parseInt(req.query.qty) || 20;
      const products = mockService.generateProducts(qty);

      return res.status(200).json({
        status: 'success',
        count: products.length,
        payload: products,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Endpoint POST para realizar la carga masiva (seeding) en MongoDB.
   * Ruta: /api/mocks/seed?entity=users&qty=10
   */
  seedData = async (req, res, next) => {
    try {
      const { entity = 'users', qty = 10 } = req.body.entity ? req.body : req.query;
      
      const result = await mockService.seedDatabase(entity, parseInt(qty));

      return res.status(201).json({
        status: 'success',
        message: `Seeding completado exitosamente en la colección [${result.collection}]`,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const mockController = new MockController();