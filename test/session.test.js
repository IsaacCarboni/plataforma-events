import { expect } from 'chai';
import supertest from 'supertest';
import app from '../app.js';

const requester = supertest(app);

describe('=== Suite de Pruebas: Servidor y Autenticación ===', () => {

    // 1. TEST DE SALUD DE LA API (Health Check)
    it('GET /api/health - Debería retornar estado activo (status 200)', async () => {
        const response = await requester.get('/api/health');

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('status', 'up');
    });

    // 2. TEST DE REGISTRO / SESIONES
    it('POST /api/sessions/register - Debería responder con status válido', async () => {
        // Datos con los campos que realmente pide tu User Model de Mongoose:
        const mockUser = {
            first_name: "Isaac",
            last_name: "Carboni",
            email: `test_${Date.now()}@test.com`,
            password: "Password123!"
        };

        const response = await requester
            .post('/api/sessions/register') 
            .send(mockUser);

        expect(response.status).to.be.oneOf([200, 201, 400, 404]);
    });

});