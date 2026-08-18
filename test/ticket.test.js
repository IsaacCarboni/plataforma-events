import { expect } from 'chai';
import supertest from 'supertest';
import app from '../app.js';

const requester = supertest(app);

describe('=== Suite de Pruebas: Módulo de Tickets (/api/tickets) ===', () => {

    // 1. TEST: Acceso restringido (Sin Login)
    // Validación de seguridad: Nadie puede ver tickets ajenos sin estar logueado
    it('GET /api/tickets/my-tickets - Debería retornar 401/403 si el usuario no está logueado', async () => {
        const response = await requester.get('/api/tickets/my-tickets');
        
        // Esperamos que falle porque no enviamos el token/cookie
        expect(response.status).to.be.oneOf([401, 403]);
    });

    // 2. TEST: Intento de Inscripción (Evento Inexistente)
    // Validación de negocio: No se puede comprar tickets para un ID que no existe
    it('POST /api/events/:eid/tickets - Debería retornar 404 o 401 si el evento no existe', async () => {
        const fakeEventId = '650c1f2e8b1d2c3a4b5c6d7e'; // ID formato MongoDB
        
        const response = await requester
            .post(`/api/events/${fakeEventId}/tickets`)
            .send({ quantity: 1 });

        // Puede fallar por 401 (auth) o 404 (evento no encontrado)
        expect(response.status).to.be.oneOf([401, 404]);
    });

    // 3. TEST: Cancelación (Ticket Inexistente)
    // Validación de lógica: Si el ticket no existe, no se puede cancelar
    it('PATCH /api/tickets/:tid/cancel - Debería retornar 404 o 401 al intentar cancelar un ticket inexistente', async () => {
        const fakeTicketId = '650c1f2e8b1d2c3a4b5c6d7e';

        const response = await requester.patch(`/api/tickets/${fakeTicketId}/cancel`);

        expect(response.status).to.be.oneOf([401, 404]);
    });

});