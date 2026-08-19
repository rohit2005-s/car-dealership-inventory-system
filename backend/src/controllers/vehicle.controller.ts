import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { vehicleService } from '../services/vehicle.service';
import {
  vehicleSchema,
  vehicleUpdateSchema,
  paginationSchema,
  vehicleSearchSchema,
  restockSchema,
} from '../validators/vehicle.validator';
import { AppError } from '../utils/AppError';

/** POST /api/vehicles — admin only. */
export async function createVehicle(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = vehicleSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message || 'Invalid input',
        400
      );
    }

    const vehicle = await vehicleService.create(parsed.data);

    res.status(201).json({
      success: true,
      data: vehicle,
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/vehicles — public, paginated listing. */
export async function getVehicles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = paginationSchema.safeParse(req.query);

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message || 'Invalid pagination parameters',
        400
      );
    }

    const { page, limit } = parsed.data;

    const { vehicles, pagination } = await vehicleService.findAll(
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: vehicles,
      pagination,
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/vehicles/search — public, filter by make/model/category/price range. */
export async function searchVehicles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = vehicleSearchSchema.safeParse(req.query);

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message || 'Invalid search parameters',
        400
      );
    }

    const vehicles = await vehicleService.search(parsed.data);

    res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/vehicles/:id — admin only. */
export async function updateVehicle(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = vehicleUpdateSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message || 'Invalid input',
        400
      );
    }

    const vehicle = await vehicleService.update(
      req.params.id,
      parsed.data
    );

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/vehicles/:id — admin only. */
export async function deleteVehicle(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const vehicle = await vehicleService.delete(req.params.id);

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/vehicles/:id/purchase — decrement stock, log purchase. TODO (Phase 4) */
export async function purchaseVehicle(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    res.status(501).json({
      success: false,
      message: 'Not implemented yet (Phase 4)',
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/vehicles/:id/restock — admin only, increment stock. */
export async function restockVehicle(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = restockSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message || 'Invalid input',
        400
      );
    }

    const vehicle = await vehicleService.restock(
      req.params.id,
      parsed.data.amount
    );

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (err) {
    next(err);
  }
}