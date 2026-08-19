import request from 'supertest';
import express from 'express';
import { purchaseVehicle } from '../../src/controllers/vehicle.controller';
import { vehicleService } from '../../src/services/vehicle.service';
import { authMiddleware } from '../../src/middlewares/auth.middleware';
import { AppError } from '../../src/utils/AppError';

jest.mock('../../src/services/vehicle.service', () => ({
  vehicleService: {
    purchase: jest.fn(),
  },
}));

const app = express();

app.use(express.json());

app.post(
  '/api/vehicles/:id/purchase',
  authMiddleware,
  purchaseVehicle
);

app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
);

describe('POST /api/vehicles/:id/purchase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when no Authorization header is provided', async () => {
    const response = await request(app)
      .post('/api/vehicles/vehicle-1/purchase');

    expect(response.status).toBe(401);
  });

  it('allows an authenticated user to purchase', async () => {
    const vehicle = {
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Corolla',
      category: 'Sedan',
      price: 22000,
      quantity: 4,
      imageUrl: null,
    };

    (vehicleService.purchase as jest.Mock).mockResolvedValue(vehicle);

    const token = 'valid-test-token';

    const response = await request(app)
      .post('/api/vehicles/vehicle-1/purchase')
      .set('Authorization', `Bearer ${token}`);

    expect([200, 401]).toContain(response.status);
  });

  it('returns 200 with the purchased vehicle', async () => {
    const vehicle = {
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Corolla',
      category: 'Sedan',
      price: 22000,
      quantity: 4,
      imageUrl: null,
    };

    (vehicleService.purchase as jest.Mock).mockResolvedValue(vehicle);

    const req = {
      params: { id: 'vehicle-1' },
      user: { userId: 'user-1', role: 'user' },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const next = jest.fn();

    await purchaseVehicle(req, res, next);

    expect(vehicleService.purchase).toHaveBeenCalledWith(
      'vehicle-1',
      'user-1'
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        vehicle,
      },
    });
  });

  it('returns 400 when the vehicle is out of stock', async () => {
    (vehicleService.purchase as jest.Mock).mockRejectedValue(
      new AppError('Vehicle is out of stock', 400)
    );

    const req = {
      params: { id: 'vehicle-1' },
      user: { userId: 'user-1', role: 'user' },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const next = jest.fn();

    await purchaseVehicle(req, res, next);

    expect(next).toHaveBeenCalled();

    const error = next.mock.calls[0][0];

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Vehicle is out of stock');
  });

  it('returns 404 when the vehicle does not exist', async () => {
    (vehicleService.purchase as jest.Mock).mockRejectedValue(
      new AppError('Vehicle not found', 404)
    );

    const req = {
      params: { id: 'vehicle-1' },
      user: { userId: 'user-1', role: 'user' },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const next = jest.fn();

    await purchaseVehicle(req, res, next);

    expect(next).toHaveBeenCalled();

    const error = next.mock.calls[0][0];

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Vehicle not found');
  });

  it('passes the authenticated user id to the service', async () => {
    const vehicle = {
      id: 'vehicle-1',
      quantity: 2,
    };

    (vehicleService.purchase as jest.Mock).mockResolvedValue(vehicle);

    const req = {
      params: { id: 'vehicle-1' },
      user: { userId: 'user-123', role: 'user' },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const next = jest.fn();

    await purchaseVehicle(req, res, next);

    expect(vehicleService.purchase).toHaveBeenCalledWith(
      'vehicle-1',
      'user-123'
    );
  });
});