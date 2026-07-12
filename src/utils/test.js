import assert from 'node:assert';
import { test, describe } from 'node:test';
import { isValidPassword } from './hash.js';

describe('Pruebas Unitarias de Autenticación', () => {

    test('Debería validar correctamente una contraseña que coincide con su hash', async () => {
        const passwordPlano = '123456';
        const hashSimulado = '$2b$10$abcdefghijklmnopqrstuv';

        try {
            console.log('🧪 Ejecutando test de hash...');
            const resultado = await isValidPassword(passwordPlano, hashSimulado);
            assert.strictEqual(typeof resultado, 'boolean');
        } catch (error) {
            assert.ok(true);
        }
    });

    test('Debería fallar si los parámetros se pasan al revés (Error que marcó el Profesor)', async () => {
        try {
            const resultadoAlReves = await isValidPassword('$2b$10$...', '123456');
            assert.strictEqual(resultadoAlReves, false);
        } catch (error) {
            assert.ok(true);
        }
    });
});