import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { RegisterInput, LoginInput } from '../types';

/** Strips the password field before returning a user object to a controller/client. */
function toSafeUser<T extends { password: string }>(user: T) {
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * authService holds all business logic for registration/login:
 * password hashing (bcrypt), duplicate-email checks, JWT issuing.
 * Kept separate from the controller so it can be unit tested directly
 * (no HTTP request/response needed) — this is what Phase 3's TDD cycle targets.
 */
export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const hashed = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, password: hashed },
    });

    const token = signToken({ userId: user.id, role: user.role });
    return { user: toSafeUser(user), token };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    // Same error/status for "no such user" and "wrong password" — avoids
    // leaking which part was incorrect (prevents user enumeration).
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const matches = await comparePassword(input.password, user.password);
    if (!matches) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = signToken({ userId: user.id, role: user.role });
    return { user: toSafeUser(user), token };
  },
};
