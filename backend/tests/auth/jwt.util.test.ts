import { signToken, verifyToken } from '../../src/utils/jwt';

describe('jwt utils', () => {
  const payload = { userId: 'abc-123', role: 'user' as const };

  it('signs a payload and produces a verifiable token', () => {
    const token = signToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // header.payload.signature
  });

  it('verifyToken returns the original payload', () => {
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
  });

  it('throws when verifying an invalid/tampered token', () => {
    expect(() => verifyToken('not.a.valid.token')).toThrow();
  });

  it('throws when verifying a token signed with a different secret', () => {
    const jwt = require('jsonwebtoken');
    const foreignToken = jwt.sign(payload, 'some-other-secret');
    expect(() => verifyToken(foreignToken)).toThrow();
  });
});
