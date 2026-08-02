import request from 'supertest';
import { app } from '../../src/app';
import { authService } from '../../src/services/auth.service';

jest.mock('../../src/services/auth.service', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
  },
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('POST /api/auth/register', () => {
  it('returns 400 when the request body fails validation', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'A', // too short
      email: 'not-an-email',
      password: '123', // too short
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(mockedAuthService.register).not.toHaveBeenCalled();
  });

  it('returns 201 with user + token on valid input', async () => {
    mockedAuthService.register.mockResolvedValueOnce({
      user: { id: '1', name: 'Jane', email: 'jane@example.com', role: 'user' } as any,
      token: 'signed.jwt.token',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBe('signed.jwt.token');
    expect(res.body.data.user.email).toBe('jane@example.com');
  });

  it('propagates a 409 when authService reports a duplicate email', async () => {
    const { AppError } = jest.requireActual('../../src/utils/AppError');
    mockedAuthService.register.mockRejectedValueOnce(
      new AppError('An account with this email already exists', 409)
    );

    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 400 when the request body fails validation', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(mockedAuthService.login).not.toHaveBeenCalled();
  });

  it('returns 200 with user + token on valid credentials', async () => {
    mockedAuthService.login.mockResolvedValueOnce({
      user: { id: '1', name: 'Jane', email: 'jane@example.com', role: 'user' } as any,
      token: 'signed.jwt.token',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBe('signed.jwt.token');
  });

  it('propagates a 401 when authService reports invalid credentials', async () => {
    const { AppError } = jest.requireActual('../../src/utils/AppError');
    mockedAuthService.login.mockRejectedValueOnce(new AppError('Invalid email or password', 401));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
