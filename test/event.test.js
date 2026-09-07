import { expect } from 'chai';
import supertest from 'supertest';
import app from '../app.js';

const requester = supertest(app);

describe('=== Suite de Pruebas: Módulo de Eventos (/api/events) ===', () => {

  // -------------------------------------------------------------
  // TEST 1: Consultar todos los eventos
  // -------------------------------------------------------------
  it('GET /api/events - Debería retornar la lista de eventos con status 200', async () => {
    const response = await requester.get('/api/events');

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('object');
    // Si tu respuesta estandarizada usa payload/data/docs:
    expect(response.body).to.have.property('status');
  });

  // -------------------------------------------------------------
  // TEST 2: Consultar un evento por ID inexistente
  // -------------------------------------------------------------
  it('GET /api/events/:id - Debería retornar 404 al buscar un ID no registrado', async () => {
    const fakeMongoId = '650c1f2e8b1d2c3a4b5c6d7e';

    const response = await requester.get(`/api/events/${fakeMongoId}`);

    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('error');
  });

  // -------------------------------------------------------------
  // TEST 3: Intentar crear un evento sin autenticación
  // -------------------------------------------------------------
  it('POST /api/events - Debería denegar acceso (401/403) si no se provee JWT token', async () => {
    const mockEvent = {
      title: 'Recital de Rock 2026',
      description: 'Evento masivo en vivo',
      date: '2026-10-15',
      capacity: 500,
      price: 15000,
    };

    const response = await requester
      .post('/api/events')
      .send(mockEvent);

    // Al estar protegida la ruta de creación, debe rechazar peticiones anónimas de forma estricta
    expect(response.status).to.be.oneOf([401, 403]);
  });

});