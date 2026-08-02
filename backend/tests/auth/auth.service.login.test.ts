import bcrypt from 'bcrypt';
import prisma from '../../src/utils/prisma';
import { authService } from '../../src/services/auth.service';

jest.mock('../../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('bcrypt');

const mockedPrisma = prisma as unknown as { user: { findUnique: jest.Mock } };
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('authService.login', () => {
  const input = { email: 'jane@example.com', password: 'plaintext123' };
  const storedUser = {
    id: 'user-id',
    name: 'Jane Doe',
    email: input.email,
    password: 'hashed-password',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws a 401 AppError when the user does not exist', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);

    await expect(authService.login(input)).rejects.toMatchObject({ statusCode: 401 });
  });

  it('throws a 401 AppError when the password does not match', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(storedUser);
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(authService.login(input)).rejects.toMatchObject({ statusCode: 401 });
  });

  it('uses the identical error message for "no user" and "wrong password" (no enumeration)', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);
    let noUserError: any;
    try {
      await authService.login(input);
    } catch (e) {
      noUserError = e;
    }

    mockedPrisma.user.findUnique.mockResolvedValue(storedUser);
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);
    let wrongPassError: any;
    try {
      await authService.login(input);
    } catch (e) {
      wrongPassError = e;
    }

    expect(noUserError.message).toBe(wrongPassError.message);
    expect(noUserError.statusCode).toBe(wrongPassError.statusCode);
  });

  it('returns a sanitized user and token on success', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(storedUser);
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await authService.login(input);

    expect(result.user).not.toHaveProperty('password');
    expect(result.user.email).toBe(input.email);
    expect(typeof result.token).toBe('string');
  });
});
