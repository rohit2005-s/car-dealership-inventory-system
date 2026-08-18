import request from 'supertest';
import express from 'express';
import { updateVehicle } from '../../src/controllers/vehicle.controller';
import { authMiddleware } from '../../src/middlewares/auth.middleware';
import { roleMiddleware } from '../../src/middlewares/role.middleware';
import { errorMiddleware } from '../../src/middlewares/error.middleware';
import { signToken } from '../../src/utils/jwt';
import { vehicleService } from '../../src/services/vehicle.service';
import { AppError } from '../../src/utils/AppError';

jest.mock('../../src/services/vehicle.service', () => ({
  vehicleService: {
    update: jest.fn(),
  },
}));

const mockedVehicleService =
  vehicleService as jest.Mocked<typeof vehicleService>;

function buildApp() {
  const app = express();

  app.use(express.json());

  app.put(
    '/api/vehicles/:id',
    authMiddleware,
    roleMiddleware('admin'),
    updateVehicle
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

describe('PUT /api/vehicles/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app)
      .put('/api/vehicles/v1')
      .send({ price: 25000 });

    expect(res.status).toBe(401);
    expect(mockedVehicleService.update).not.toHaveBeenCalled();
  });

  it('returns 403 when the authenticated user is not an admin', async () => {
    const res = await request(app)
      .put('/api/vehicles/v1')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 25000 });

    expect(res.status).toBe(403);
    expect(mockedVehicleService.update).not.toHaveBeenCalled();
  });

  it('returns 400 when the request body fails validation', async () => {
    const res = await request(app)
      .put('/api/vehicles/v1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: -100 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(mockedVehicleService.update).not.toHaveBeenCalled();
  });

  it('successfully updates a single field (partial update)', async () => {
    const updatedVehicle = {
      id: 'v1',
      make: 'Toyota',
      model: 'Corolla',
      category: 'Sedan',
      price: 25000,
      quantity: 5,
    };

    mockedVehicleService.update.mockResolvedValue(
      updatedVehicle as any
    );

    const res = await request(app)
      .put('/api/vehicles/v1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 25000 });

    expect(res.status).toBe(200);

    expect(res.body).toEqual({
      success: true,
      data: updatedVehicle,
    });

    expect(mockedVehicleService.update).toHaveBeenCalledWith(
      'v1',
      { price: 25000 }
    );
  });

  it('successfully updates multiple fields at once', async () => {
    const updatedVehicle = {
      id: 'v1',
      make: 'Toyota',
      model: 'Camry',
      category: 'Sedan',
      price: 27000,
      quantity: 8,
    };

    mockedVehicleService.update.mockResolvedValue(
      updatedVehicle as any
    );

    const res = await request(app)
      .put('/api/vehicles/v1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        model: 'Camry',
        price: 27000,
        quantity: 8,
      });

    expect(res.status).toBe(200);

    expect(res.body.data).toEqual(updatedVehicle);

    expect(mockedVehicleService.update).toHaveBeenCalledWith(
      'v1',
      {
        model: 'Camry',
        price: 27000,
        quantity: 8,
      }
    );
  });

  it('returns 404 when the vehicle does not exist', async () => {
    mockedVehicleService.update.mockRejectedValue(
      new AppError('Vehicle not found', 404)
    );

    const res = await request(app)
      .put('/api/vehicles/nonexistent-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 25000 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});