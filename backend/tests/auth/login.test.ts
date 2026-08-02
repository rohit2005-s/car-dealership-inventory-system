import request from 'supertest';
import { app } from '../../src/app';
import prisma from '../../src/utils/prisma';

// Full end-to-end integration test: real Express app + real Postgres via Prisma.
// Requires `npx prisma generate` + a running DATABASE_URL to execute.
describe('POST /api/auth/login', () => {
  const email = `login-${Date.now()}@example.com`;
  const password = 'password123';

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({ name: 'Login Test', email, password });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('logs in successfully with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });
});
