import request from 'supertest';
import app from '../src/app';

describe('API Integration Tests', () => {
  it('should return 200 for healthcheck', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  it('should return 401 for unauthorized product creation', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Test Product',
      price: 100,
    });
    expect(res.status).toBe(401);
  });
});
