import { Router } from 'express';
import { ProductsController } from '../controllers/products.controller.js';

const router = Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener el listado de productos y cortes
 *     tags: [Products]
 *     description: Retorna la lista completa de cortes de carne y productos disponibles en el inventario.
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente.
 *       500:
 *         description: Error interno del servidor.
 *   
 *   post:
 *     summary: Registrar un nuevo producto o corte de carne
 *     tags: [Products]
 *     description: Crea un nuevo producto en el inventario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - pricePerKg
 *               - stockKg
 *             properties:
 *               name:
 *                 type: string
 *                 example: Asado de Tira
 *               category:
 *                 type: string
 *                 example: Carne Vacuna
 *               pricePerKg:
 *                 type: number
 *                 example: 21900
 *               stockKg:
 *                 type: number
 *                 example: 45.5
 *               batchNumber:
 *                 type: string
 *                 example: LOTE-VAC-01
 *               expirationDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-09-22T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: Producto registrado exitosamente.
 *       400:
 *         description: Datos faltantes o inválidos.
 */
router.get('/', ProductsController.getProducts);
router.post('/', ProductsController.createProduct);

/**
 * @swagger
 * /api/products/expiring:
 *   get:
 *     summary: Obtener productos próximos a vencer
 *     tags: [Products]
 *     description: Retorna la lista de cortes o productos que están próximos a su fecha de caducidad.
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Días de margen para considerar un producto próximo a vencer.
 *     responses:
 *       200:
 *         description: Lista de productos próximos a vencer obtenida con éxito.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/expiring', ProductsController.getExpiring);

/**
 * @swagger
 * /api/products/{pid}:
 *   get:
 *     summary: Obtener detalle de un producto por ID
 *     tags: [Products]
 *     description: Busca y retorna un producto específico mediante su ID de MongoDB.
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del producto (_id).
 *     responses:
 *       200:
 *         description: Producto encontrado con éxito.
 *       404:
 *         description: Producto no encontrado.
 */
router.get('/:pid', ProductsController.getProductById);

export default router;