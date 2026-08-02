import { roleMiddleware } from '../../src/middlewares/role.middleware';
import { AuthRequest } from '../../src/types';
import { Response } from 'express';

function mockRes() {
  return {} as Response;
}

describe('roleMiddleware', () => {
  it('rejects with 401 when req.user is missing (auth middleware did not run)', () => {
    const req = {} as AuthRequest;
    const next = jest.fn();

    roleMiddleware('admin')(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('rejects with 403 when the user role is not in the allowed list', () => {
    const req = { user: { userId: 'u1', role: 'user' } } as AuthRequest;
    const next = jest.fn();

    roleMiddleware('admin')(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  it('calls next() with no error when the user role is allowed', () => {
    const req = { user: { userId: 'u1', role: 'admin' } } as AuthRequest;
    const next = jest.fn();

    roleMiddleware('admin')(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('supports multiple allowed roles', () => {
    const req = { user: { userId: 'u1', role: 'user' } } as AuthRequest;
    const next = jest.fn();

    roleMiddleware('user', 'admin')(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith();
  });
});
