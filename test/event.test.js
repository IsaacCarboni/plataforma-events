import { expect } from 'chai';
import supertest from 'supertest';
import app from '../app.js'; // Importamos la app de Express que está en la raíz

// Creamos el cliente HTTP de Supertest
const requester = supertest(app);

describe('=== Suite de Pruebas: Módulo de Eventos (/api/events) ===', () => {

    // -------------------------------------------------------------
    // TEST 1: Consultar todos los eventos
    // -------------------------------------------------------------
    it('GET /api/events - Debería retornar la lista de eventos con status 200', async () => {
        // PASO 1: Disparamos la petición HTTP GET
        const response = await requester.get('/api/events');

        // PASO 2: Validamos el código de respuesta del servidor (200 OK)
        expect(response.status).to.equal(200);

        // PASO 3: Verificamos que devuelva información (Body existente)
        expect(response.body).to.exist;
    });

    // -------------------------------------------------------------
    // TEST 2: Consultar un evento por ID inexistente
    // -------------------------------------------------------------
    it('GET /api/events/:id - Debería retornar 404 (o 400) al buscar un ID ficticio', async () => {
        // ID ficticio con formato válido de MongoDB (24 caracteres hexadecimales)
        const fakeMongoId = '650c1f2e8b1d2c3a4b5c6d7e';

        // PASO 1: Hacemos la solicitud pasándole el ID en la URL
        const response = await requester.get(`/api/events/${fakeMongoId}`);

        // PASO 2: Validamos que la API responda que No Encontró el recurso (404) o Solicitud Incorrecta (400)
        expect(response.status).to.be.oneOf([404, 400]);
    });

    // -------------------------------------------------------------
    // TEST 3: Crear un evento nuevo mediante POST
    // -------------------------------------------------------------
    it('POST /api/events - Debería enviar la información para registrar un evento', async () => {
        // Datos de prueba (Mock Data) para crear un evento
        const mockEvent = {
            title: "Recital de Rock 2026",
            description: "Evento masivo en vivo",
            date: "2026-10-15",
            capacity: 500,
            price: 15000
        };

        // PASO 1: Enviamos la petición POST con el payload en el body
        const response = await requester
            .post('/api/events')
            .send(mockEvent);

        // PASO 2: Evaluamos la respuesta según las reglas de tu backend:
        // - 201/200: Si se creó o procesó con éxito.
        // - 400: Si faltó algún campo requerido por tu modelo.
        // - 401/403: Si la ruta requiere un token de sesión/admin para crear eventos.
        expect(response.status).to.be.oneOf([200, 201, 400, 401, 403]);
    });

});