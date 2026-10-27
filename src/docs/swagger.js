import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentación de ShipNow API',
            version: '1.0.0',
            description: 'API RESTful para gestión de stock, eventos y pedidos.',
        },
        servers: [
            {
                url: 'http://localhost:8080',
                description: 'Servidor local de desarrollo',
            },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: apiKey,
                    in: cookie,
                    name: currentUser,
                },
            },
        },
    },
    // 👈 Apuntamos directamente a los archivos de rutas de JS donde pusimos el JSDoc
    apis: [`${path.join(__dirname, '../routes/**/*.js')}`],
};

const specs = swaggerJSDoc(swaggerOptions);

export default specs;