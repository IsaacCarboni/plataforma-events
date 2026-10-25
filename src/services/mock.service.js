import { faker } from '@faker-js/faker/locale/es';
import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/user.repository.js';
import { eventRepository } from '../repositories/event.repository.js';
import { ticketRepository } from '../repositories/ticket.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import { ROLES, TICKET_STATUS } from '../constants/index.js';

// Importaciones del sistema centralizado de errores del Módulo 3
import CustomError from './errors/CustomError.js';
import EErrors from './errors/enums.js';

/**
 * @class MockService
 * @description Capa de negocio encargada de generar datos simulados mediante Faker
 * y gestionar la inserción controlada en la base de datos (seeding) con validaciones de errores.
 */
export class MockService {
  
  /**
   * Genera una lista de usuarios simulados en memoria con validación de cantidad.
   * @param {number} count - Cantidad de usuarios a generar.
   * @returns {Array<Object>} Array de objetos de usuario simulados.
   */
  generateUsers(count = 50) {
    const parsedCount = parseInt(count);
    
    // Validación estricta con CustomError si pasan datos erróneos
    if (isNaN(parsedCount) || parsedCount <= 0) {
      CustomError.createError({
        name: 'InvalidMockQuantityError',
        cause: `Se recibió un valor de cantidad inválido: [${count}]`,
        message: 'La cantidad (qty) para generar usuarios debe ser un número entero mayor a 0.',
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    const users = [];
    const rolesArray = Object.values(ROLES); // Extrae roles válidos de las constantes del sistema

    for (let i = 0; i < parsedCount; i++) {
      users.push({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        age: faker.number.int({ min: 18, max: 65 }),
        password: bcrypt.hashSync('coder123', 10), // Contraseña hasheada por defecto para pruebas
        role: faker.helpers.arrayElement(rolesArray),
        cart: null,
      });
    }
    return users;
  }

  /**
   * Genera una lista de productos/cortes de carne simulados en memoria con validación de cantidad.
   * @param {number} count - Cantidad de productos a generar.
   * @returns {Array<Object>} Array de objetos de productos simulados.
   */
  generateProducts(count = 20) {
    const parsedCount = parseInt(count);

    if (isNaN(parsedCount) || parsedCount <= 0) {
      CustomError.createError({
        name: 'InvalidMockQuantityError',
        cause: `Se recibió un valor de cantidad inválido: [${count}]`,
        message: 'La cantidad (qty) para generar productos debe ser un número entero mayor a 0.',
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    const products = [];
    
    for (let i = 0; i < parsedCount; i++) {
      products.push({
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price({ min: 1000, max: 50000 })),
        stock: faker.number.int({ min: 10, max: 200 }),
        category: faker.commerce.department(),
        code: faker.string.alphanumeric(6).toUpperCase(),
        status: true,
      });
    }
    return products;
  }

  /**
   * Inserta registros de prueba masivos en MongoDB de forma controlada (Seeding) con manejo de errores.
   * @param {string} entity - Tipo de entidad a sembrar ('users', 'products', etc.).
   * @param {number} qty - Cantidad de registros a insertar.
   * @returns {Object} Resumen con la cantidad de elementos insertados y la colección afectada.
   */
  async seedDatabase(entity, qty = 10) {
    const validEntities = ['users', 'products'];

    if (!entity || !validEntities.includes(entity.toLowerCase())) {
      CustomError.createError({
        name: 'InvalidEntityError',
        cause: `Entidad solicitada: [${entity}] no soportada o ausente.`,
        message: `La entidad para seeding debe ser una de las siguientes: ${validEntities.join(', ')}.`,
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    let insertedCount = 0;

    try {
      switch (entity.toLowerCase()) {
        case 'users': {
          const mockUsers = this.generateUsers(qty);
          for (const user of mockUsers) {
            await userRepository.create(user);
            insertedCount++;
          }
          break;
        }
        case 'products': {
          const mockProducts = this.generateProducts(qty);
          for (const product of mockProducts) {
            await productRepository.create(product);
            insertedCount++;
          }
          break;
        }
      }
    } catch (error) {
      // Si el error ya es un CustomError controlado, lo propagamos tal cual
      if (error.code) throw error;

      // Si falla la base de datos durante la inserción, disparamos un DATABASE_ERROR
      CustomError.createError({
        name: 'DatabaseSeedError',
        cause: error.message,
        message: `Ocurrió un error crítico al intentar insertar los registros en la colección [${entity}].`,
        code: EErrors.DATABASE_ERROR,
      });
    }

    return {
      success: true,
      inserted: insertedCount,
      collection: entity.toLowerCase(),
    };
  }
}

export const mockService = new MockService();