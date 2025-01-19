import request from 'supertest';
import app from '../../index';
describe("Grid Integration", ()=>{
    //TODO: Handle Worker Files Typescript to Javascript before testing
    it.skip("/POST /api/grids should get an html and a raw key",async ()=>{
        const res = await request(app).post('/api/grids').send({});
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
    })
});