import { Request, Response, NextFunction } from 'express';
// import { authService } from '../services/auth.service';

/**
 * POST /api/auth/register
 * TODO (Phase 3): call authService.register(req.body), return { user, token }
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(501).json({ success: false, message: 'Not implemented yet (Phase 3)' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * TODO (Phase 3): call authService.login(req.body), return { user, token }
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(501).json({ success: false, message: 'Not implemented yet (Phase 3)' });
  } catch (err) {
    next(err);
  }
}
