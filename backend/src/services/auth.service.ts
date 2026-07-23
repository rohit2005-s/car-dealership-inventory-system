import { RegisterInput, LoginInput } from '../types';

/**
 * authService holds all business logic for registration/login:
 * password hashing (bcrypt), duplicate-email checks, JWT issuing.
 * Kept separate from the controller so it can be unit tested directly
 * (no HTTP request/response needed) — this is what Phase 3's TDD cycle targets.
 */
export const authService = {
  async register(input: RegisterInput) {
    // TODO (Phase 3):
    // 1. check for existing user by email -> throw AppError(409) if found
    // 2. hash password with bcrypt
    // 3. create user via prisma
    // 4. sign JWT
    // 5. return { user, token }
    throw new Error('Not implemented yet (Phase 3)');
  },

  async login(input: LoginInput) {
    // TODO (Phase 3):
    // 1. find user by email -> throw AppError(401) if not found
    // 2. compare password with bcrypt -> throw AppError(401) if mismatch
    // 3. sign JWT
    // 4. return { user, token }
    throw new Error('Not implemented yet (Phase 3)');
  },
};
