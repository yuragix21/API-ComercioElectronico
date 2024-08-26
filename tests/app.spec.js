import app from '../app';
import request from 'supertest';

describe('Order API', () => {
    test('should return a list of orders', async () => {
        const response = await request(app).get('/metro/users/1/orders?status=pending&page=1&limit=3');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        // Agrega más validaciones según la estructura esperada
    });
});
