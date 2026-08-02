import bcrypt from 'bcrypt';
import prisma from '../../src/utils/prisma';
import { authService } from '../../src/services/auth.service';
import { AppError } from '../../src/utils/AppError';

jest.mock('../../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('bcrypt');

const mockedPrisma = prisma as unknown as {
  user: { findUnique: jest.Mock; create: jest.Mock };
};
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('authService.register', () => {
  const input = { name: 'Jane Doe', email: 'jane@example.com', password: 'plaintext123' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws a 409 AppError when the email is already registered', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ id: 'existing-id', email: input.email });

    await expect(authService.register(input)).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(mockedPrisma.user.create).not.toHaveBeenCalled();
  });

  it('hashes the password before storing it', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);
    (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    mockedPrisma.user.create.mockResolvedValue({
      id: 'new-id',
      name: input.name,
      email: input.email,
      password: 'hashed-password',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await authService.register(input);

    expect(mockedBcrypt.hash).toHaveBeenCalledWith(input.password, 10);
    expect(mockedPrisma.user.create).toHaveBeenCalledWith({
      data: { name: input.name, email: input.email, password: 'hashed-password' },
    });
  });

  it('returns a sanitized user (no password field) and a token', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);
    (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    mockedPrisma.user.create.mockResolvedValue({
      id: 'new-id',
      name: input.name,
      email: input.email,
      password: 'hashed-password',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await authService.register(input);

    expect(result.user).not.toHaveProperty('password');
    expect(result.user.email).toBe(input.email);
    expect(typeof result.token).toBe('string');
  });
});
