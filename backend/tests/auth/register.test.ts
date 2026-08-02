import request from 'supertest';
import { app } from '../../src/app';
import prisma from '../../src/utils/prisma';

// Full end-to-end integration test: real Express app + real Postgres via Prisma.
// Requires `npx prisma generate` + a running DATABASE_URL to execute.
describe('POST /api/auth/register', () => {
  const email = `test-${Date.now()}@example.com`;
  const dupEmail = `dup-${Date.now()}@example.com`;

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [email, dupEmail] } } });
    await prisma.$disconnect();
  });

  it('registers a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email,
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: dupEmail,
      password: 'password123',
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Another User',
      email: dupEmail,
      password: 'password456',
    });
    expect(res.status).toBe(409);
  });
});
