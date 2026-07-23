import request from 'supertest';
import { app } from '../../src/app';

// TODO (Phase 3): remove .skip and implement these as RED tests first,
// then build auth.service/controller until they go GREEN.
describe.skip('POST /api/auth/register', () => {
  it('registers a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'dup@example.com',
      password: 'password123',
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Another User',
      email: 'dup@example.com',
      password: 'password456',
    });
    expect(res.status).toBe(409);
  });
});
