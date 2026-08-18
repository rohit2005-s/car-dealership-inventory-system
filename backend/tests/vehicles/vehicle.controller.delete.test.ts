import request from 'supertest';
import express from 'express';

import { deleteVehicle } from '../../src/controllers/vehicle.controller';
import { authMiddleware } from '../../src/middlewares/auth.middleware';
import { roleMiddleware } from '../../src/middlewares/role.middleware';
import { errorMiddleware } from '../../src/middlewares/error.middleware';
import { signToken } from '../../src/utils/jwt';
import { vehicleService } from '../../src/services/vehicle.service';
import { AppError } from '../../src/utils/AppError';

jest.mock('../../src/services/vehicle.service', () => ({
  vehicleService: {
    delete: jest.fn(),
  },
}));

const mockedVehicleService =
  vehicleService as jest.Mocked<typeof vehicleService>;

function buildApp() {
  const app = express();

  app.use(express.json());

  app.delete(
    '/api/vehicles/:id',
    authMiddleware,
    roleMiddleware('admin'),
    deleteVehicle
  );

  app.use(errorMiddleware);

  return app;
}

const app = buildApp();

const adminToken = signToken({
  userId: 'admin-1',
  role: 'admin',
});

const userToken = signToken({
  userId: 'user-1',
  role: 'user',
});

describe('DELETE /api/vehicles/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app)
      .delete('/api/vehicles/v1');

    expect(res.status).toBe(401);

    expect(
      mockedVehicleService.delete
    ).not.toHaveBeenCalled();
  });

  it('returns 403 when the authenticated user is not an admin', async () => {
    const res = await request(app)
      .delete('/api/vehicles/v1')
      .set(
        'Authorization',
        `Bearer ${userToken}`
      );

    expect(res.status).toBe(403);

    expect(
      mockedVehicleService.delete
    ).not.toHaveBeenCalled();
  });

  it('returns 200 with the deleted vehicle for an admin', async () => {
    const deletedVehicle = {
      id: 'v1',
      make: 'Toyota',
      model: 'Corolla',
      category: 'Sedan',
      price: 22000,
      quantity: 5,
      imageUrl: null,
    };

    mockedVehicleService.delete.mockResolvedValue(
      deletedVehicle as any
    );

    const res = await request(app)
      .delete('/api/vehicles/v1')
      .set(
        'Authorization',
        `Bearer ${adminToken}`
      );

    expect(res.status).toBe(200);

    expect(res.body).toEqual({
      success: true,
      data: deletedVehicle,
    });

    expect(
      mockedVehicleService.delete
    ).toHaveBeenCalledWith('v1');
  });

  it('returns 404 when the vehicle does not exist', async () => {
    mockedVehicleService.delete.mockRejectedValue(
      new AppError('Vehicle not found', 404)
    );

    const res = await request(app)
      .delete('/api/vehicles/nonexistent-id')
      .set(
        'Authorization',
        `Bearer ${adminToken}`
      );

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});