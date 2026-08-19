import request from 'supertest';
import express from 'express';
import { restockVehicle } from '../../src/controllers/vehicle.controller';
import { authMiddleware } from '../../src/middlewares/auth.middleware';
import { roleMiddleware } from '../../src/middlewares/role.middleware';
import { errorMiddleware } from '../../src/middlewares/error.middleware';
import { signToken } from '../../src/utils/jwt';
import { vehicleService } from '../../src/services/vehicle.service';
import { AppError } from '../../src/utils/AppError';

jest.mock('../../src/services/vehicle.service', () => ({
  vehicleService: {
    restock: jest.fn(),
  },
}));

const mockedVehicleService =
  vehicleService as jest.Mocked<typeof vehicleService>;

function buildApp() {
  const app = express();

  app.use(express.json());

  app.post(
    '/api/vehicles/:id/restock',
    authMiddleware,
    roleMiddleware('admin'),
    restockVehicle
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

describe('POST /api/vehicles/:id/restock', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app)
      .post('/api/vehicles/v1/restock')
      .send({ amount: 10 });

    expect(res.status).toBe(401);
    expect(mockedVehicleService.restock).not.toHaveBeenCalled();
  });

  it('returns 403 when the authenticated user is not an admin', async () => {
    const res = await request(app)
      .post('/api/vehicles/v1/restock')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 10 });

    expect(res.status).toBe(403);
    expect(mockedVehicleService.restock).not.toHaveBeenCalled();
  });

  it('returns 400 when amount is missing', async () => {
    const res = await request(app)
      .post('/api/vehicles/v1/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(mockedVehicleService.restock).not.toHaveBeenCalled();
  });

  it('returns 400 when amount is zero or negative', async () => {
    const res = await request(app)
      .post('/api/vehicles/v1/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 0 });

    expect(res.status).toBe(400);
    expect(mockedVehicleService.restock).not.toHaveBeenCalled();
  });

  it('returns 400 when amount is not an integer', async () => {
    const res = await request(app)
      .post('/api/vehicles/v1/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 2.5 });

    expect(res.status).toBe(400);
    expect(mockedVehicleService.restock).not.toHaveBeenCalled();
  });

  it('successfully restocks a vehicle when an admin sends a valid amount', async () => {
    const restockedVehicle = {
      id: 'v1',
      make: 'Toyota',
      model: 'Corolla',
      category: 'Sedan',
      price: 22000,
      quantity: 15,
    };

    mockedVehicleService.restock.mockResolvedValue(
      restockedVehicle as any
    );

    const res = await request(app)
      .post('/api/vehicles/v1/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 10 });

    expect(res.status).toBe(200);

    expect(res.body).toEqual({
      success: true,
      data: restockedVehicle,
    });

    expect(mockedVehicleService.restock).toHaveBeenCalledWith(
      'v1',
      10
    );
  });

  it('returns 404 when the vehicle does not exist', async () => {
    mockedVehicleService.restock.mockRejectedValue(
      new AppError('Vehicle not found', 404)
    );

    const res = await request(app)
      .post('/api/vehicles/nonexistent-id/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 10 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});