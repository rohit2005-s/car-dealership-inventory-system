import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
// import { vehicleService } from '../services/vehicle.service';

/** POST /api/vehicles — admin only. TODO (Phase 4) */
export async function createVehicle(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.status(501).json({ success: false, message: 'Not implemented yet (Phase 4)' });
  } catch (err) {
    next(err);
  }
}

/** GET /api/vehicles — list with pagination. TODO (Phase 4) */
export async function getVehicles(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(501).json({ success: false, message: 'Not implemented yet (Phase 4)' });
  } catch (err) {
    next(err);
  }
}

/** GET /api/vehicles/search — filter by make/model/category/price range. TODO (Phase 4) */
export async function searchVehicles(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(501).json({ success: false, message: 'Not implemented yet (Phase 4)' });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/vehicles/:id — admin only. TODO (Phase 4) */
export async function updateVehicle(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.status(501).json({ success: false, message: 'Not implemented yet (Phase 4)' });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/vehicles/:id — admin only. TODO (Phase 4) */
export async function deleteVehicle(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.status(501).json({ success: false, message: 'Not implemented yet (Phase 4)' });
  } catch (err) {
    next(err);
  }
}

/** POST /api/vehicles/:id/purchase — decrement stock, log purchase. TODO (Phase 4) */
export async function purchaseVehicle(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.status(501).json({ success: false, message: 'Not implemented yet (Phase 4)' });
  } catch (err) {
    next(err);
  }
}

/** POST /api/vehicles/:id/restock — admin only, increment stock. TODO (Phase 4) */
export async function restockVehicle(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.status(501).json({ success: false, message: 'Not implemented yet (Phase 4)' });
  } catch (err) {
    next(err);
  }
}
