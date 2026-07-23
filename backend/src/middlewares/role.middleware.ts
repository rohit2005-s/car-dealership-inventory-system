import { Response, NextFunction } from 'express';
import { AuthRequest, Role } from '../types';
import { AppError } from '../utils/AppError';

/**
 * Restricts a route to specific roles. Must run AFTER authMiddleware
 * so req.user is already populated.
 * Usage: router.post('/vehicles', authMiddleware, roleMiddleware('admin'), createVehicle)
 */
export function roleMiddleware(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
}
