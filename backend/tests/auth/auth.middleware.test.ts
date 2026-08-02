import { authMiddleware } from '../../src/middlewares/auth.middleware';
import { signToken } from '../../src/utils/jwt';
import { AuthRequest } from '../../src/types';
import { Response } from 'express';

function mockRes() {
  return {} as Response;
}

describe('authMiddleware', () => {
  it('rejects with 401 when the Authorization header is missing', () => {
    const req = { headers: {} } as AuthRequest;
    const next = jest.fn();

    authMiddleware(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('rejects with 401 when the header does not start with "Bearer "', () => {
    const req = { headers: { authorization: 'Basic somevalue' } } as AuthRequest;
    const next = jest.fn();

    authMiddleware(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('rejects with 401 when the token is invalid or tampered with', () => {
    const req = { headers: { authorization: 'Bearer not.a.valid.token' } } as AuthRequest;
    const next = jest.fn();

    authMiddleware(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('attaches the decoded payload to req.user and calls next() with no error on a valid token', () => {
    const token = signToken({ userId: 'user-1', role: 'admin' });
    const req = { headers: { authorization: `Bearer ${token}` } } as AuthRequest;
    const next = jest.fn();

    authMiddleware(req, mockRes(), next);

    expect(req.user).toMatchObject({ userId: 'user-1', role: 'admin' });
    expect(next).toHaveBeenCalledWith(); // called with no arguments = success
  });
});
