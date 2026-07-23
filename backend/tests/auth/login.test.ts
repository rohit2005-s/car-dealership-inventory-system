import request from 'supertest';
import { app } from '../../src/app';

// TODO (Phase 3): remove .skip once auth.service.login is implemented.
describe.skip('POST /api/auth/login', () => {
  it('logs in successfully with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });
});
