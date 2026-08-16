import request from 'supertest';
import express from 'express';
import { createVehicle } from '../../src/controllers/vehicle.controller';
import { authMiddleware } from '../../src/middlewares/auth.middleware';
import { roleMiddleware } from '../../src/middlewares/role.middleware';
import { errorMiddleware } from '../../src/middlewares/error.middleware';
import { signToken } from '../../src/utils/jwt';
import { vehicleService } from '../../src/services/vehicle.service';

jest.mock('../../src/services/vehicle.service', () => ({
  vehicleService: {
    create: jest.fn(),
  },
}));

const mockedVehicleService =
  vehicleService as jest.Mocked<typeof vehicleService>;

function buildApp() {
  const app = express();

  app.use(express.json());

  app.post(
    '/api/vehicles',
    authMiddleware,
    roleMiddleware('admin'),
    createVehicle
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

const validPayload = {
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  price: 22000,
  quantity: 5,
};

describe('POST /api/vehicles', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .send(validPayload);

    expect(res.status).toBe(401);
    expect(mockedVehicleService.create).not.toHaveBeenCalled();
  });

  it('returns 403 when the authenticated user is not an admin', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validPayload);

    expect(res.status).toBe(403);
    expect(mockedVehicleService.create).not.toHaveBeenCalled();
  });

  it('returns 400 when the request body fails validation', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Toyota' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(mockedVehicleService.create).not.toHaveBeenCalled();
  });

  it('returns 201 with the created vehicle when an admin sends valid data', async () => {
    const createdVehicle = {
      id: 'v1',
      ...validPayload,
      imageUrl: null,
    };

    mockedVehicleService.create.mockResolvedValue(createdVehicle as any);

    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(createdVehicle);

    expect(mockedVehicleService.create).toHaveBeenCalledWith(
      validPayload
    );
  });
});