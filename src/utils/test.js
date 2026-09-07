import assert from 'node:assert';
import { test, describe } from 'node:test';
import { createHash, isValidPassword } from '../utils/hash.js';

describe('Pruebas Unitarias de Autenticación y Hashing', () => {

  test('Debería validar correctamente una contraseña que coincide con su hash real', async () => {
    const passwordPlano = '123456';
    const hashReal = await createHash(passwordPlano);

    const resultado = await isValidPassword(passwordPlano, hashReal);
    
    assert.strictEqual(typeof resultado, 'boolean');
    assert.strictEqual(resultado, true);
  });

  test('Debería retornar false cuando la contraseña no coincide', async () => {
    const passwordPlano = '123456';
    const passwordIncorrecto = '654321';
    const hashReal = await createHash(passwordPlano);

    const resultado = await isValidPassword(passwordIncorrecto, hashReal);

    assert.strictEqual(resultado, false);
  });

  test('Debería manejar correctamente el orden invertido de parámetros (Observación del Profesor)', async () => {
    const passwordPlano = '123456';
    const hashReal = await createHash(passwordPlano);

    // Al pasar el hash como contraseña y la contraseña como hash, bcrypt debe retornar false de forma segura
    const resultadoAlReves = await isValidPassword(hashReal, passwordPlano);

    assert.strictEqual(resultadoAlReves, false);
  });
});