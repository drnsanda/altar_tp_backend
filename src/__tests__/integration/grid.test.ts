import request from 'supertest';
import { server } from '../../index'; 

describe('Grid Integration', () => {
    beforeAll(() => {
        process.env.TEST_MODE = 'active';
    });

    it('/POST /api/grids should get an html and a raw key', async () => {
        const res = await request(server) 
            .post('/api/grids')
            .send({});
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
    });

    afterAll(() => {
        console.log('All integration tests are done!');
    });
});
