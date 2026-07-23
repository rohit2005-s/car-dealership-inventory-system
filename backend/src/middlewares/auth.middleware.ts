import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

/**
 * Reads Authorization: Bearer <token>, verifies it, and attaches the
 * decoded payload to req.user. Used to protect any route that requires login.
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('Authentication token missing', 401);
    }
    const token = header.split(' ')[1];
    req.user = verifyToken(token);
    next();
  } catch (err) {
    next(new AppError('Invalid or expired token', 401));
  }
}
