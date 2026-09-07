import { expect } from 'chai';
import supertest from 'supertest';
import app from '../app.js';

const requester = supertest(app);

describe('=== Suite de Pruebas: Servidor y Autenticación (/api/sessions) ===', () => {
  const dynamicEmail = `test_${Date.now()}@test.com`;
  const userPassword = 'Password123!';

  // 1. TEST DE SALUD DE LA API
  it('GET /api/health - Debería retornar estado activo (status 200)', async () => {
    const response = await requester.get('/api/health');

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('status', 'up');
  });

  // 2. TEST DE REGISTRO
  it('POST /api/sessions/register - Debería registrar un nuevo usuario exitosamente', async () => {
    const mockUser = {
      first_name: 'Isaac',
      last_name: 'Carboni',
      email: dynamicEmail,
      password: userPassword,
    };

    const response = await requester
      .post('/api/sessions/register')
      .send(mockUser);

    expect(response.status).to.be.oneOf([200, 201]);
    expect(response.body).to.be.an('object');
    // Verifica que el password NO vuelva en la respuesta sanitizada
    expect(response.body).to.not.have.property('password');
  });

  // 3. TEST DE LOGIN
  it('POST /api/sessions/login - Debería autenticar al usuario y retornar un token JWT', async () => {
    const credentials = {
      email: dynamicEmail,
      password: userPassword,
    };

    const response = await requester
      .post('/api/sessions/login')
      .send(credentials);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('token');
    expect(response.body.token).to.be.a('string');
  });
});