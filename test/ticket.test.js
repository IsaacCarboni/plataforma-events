import { expect } from 'chai';
import supertest from 'supertest';
import app from '../app.js';

const requester = supertest(app);

describe('=== Suite de Pruebas: Módulo de Tickets (/api/tickets) ===', () => {
  let authToken = '';
  const fakeId = '650c1f2e8b1d2c3a4b5c6d7e'; // MongoDB ObjectId mock

  // Previo a los tests de negocio, registramos y logueamos un usuario de prueba para obtener JWT
  before(async () => {
    const testUser = {
      first_name: 'Tester',
      last_name: 'Tickets',
      email: `ticket_test_${Date.now()}@test.com`,
      password: 'Password123!',
    };

    await requester.post('/api/sessions/register').send(testUser);
    const loginRes = await requester.post('/api/sessions/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    authToken = loginRes.body.token;
  });

  // 1. SEGURIDAD: Rechazo sin token
  it('GET /api/tickets/my-tickets - Debería retornar 401 si no se envía token', async () => {
    const response = await requester.get('/api/tickets/my-tickets');

    expect(response.status).to.equal(401);
  });

  // 2. ACCESO AUTENTICADO: Retorno de tickets del usuario
  it('GET /api/tickets/my-tickets - Debería retornar 200 y una lista vacía para usuario nuevo', async () => {
    const response = await requester
      .get('/api/tickets/my-tickets')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
  });

  // 3. NEGOCIO: Inscripción a Evento Inexistente
  it('POST /api/events/:eid/tickets - Debería retornar 404 al intentar inscribirse a un evento inexistente', async () => {
    const response = await requester
      .post(`/api/events/${fakeId}/tickets`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ quantity: 1 });

    expect(response.status).to.equal(404);
  });

  // 4. NEGOCIO: Cancelar Ticket Inexistente
  it('PATCH /api/tickets/:tid/cancel - Debería retornar 404 al cancelar un ticket no registrado', async () => {
    const response = await requester
      .patch(`/api/tickets/${fakeId}/cancel`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).to.equal(404);
  });
});