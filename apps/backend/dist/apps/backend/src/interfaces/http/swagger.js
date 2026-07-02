import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Enterprise CI/CD Platform API',
            version: '1.0.0',
            description: 'Authentication and platform management endpoints.',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/interfaces/http/routes/*.ts'],
};
export function setupSwagger(app) {
    const swaggerSpec = swaggerJSDoc(options);
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
//# sourceMappingURL=swagger.js.map