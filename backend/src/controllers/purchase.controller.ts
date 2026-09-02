import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { purchaseService } from '../services/purchase.service';
import { paginationSchema } from '../validators/vehicle.validator';
import { AppError } from '../utils/AppError';

/** GET /api/purchases — authenticated, returns the current user's own purchase history. */
export async function getMyPurchases(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = paginationSchema.safeParse(req.query);

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message || 'Invalid pagination parameters',
        400
      );
    }

    const { page, limit } = parsed.data;
    const userId = req.user!.userId;

    const { purchases, pagination } =
      await purchaseService.getUserPurchases(userId, page, limit);

    res.status(200).json({
      success: true,
      data: purchases,
      pagination,
    });
  } catch (err) {
    next(err);
  }
}