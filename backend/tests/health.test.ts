import request from 'supertest';
import { app } from '../src/app';

describe('Health check', () => {
  it('GET /api/health should return 200 and success:true', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
