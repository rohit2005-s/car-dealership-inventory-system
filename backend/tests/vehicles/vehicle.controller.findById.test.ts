import request from 'supertest';
import express from 'express';
import { getVehicleById } from '../../src/controllers/vehicle.controller';
import { errorMiddleware } from '../../src/middlewares/error.middleware';
import { vehicleService } from '../../src/services/vehicle.service';
import { AppError } from '../../src/utils/AppError';

jest.mock('../../src/services/vehicle.service', () => ({
  vehicleService: {
    findById: jest.fn(),
  },
}));

const mockedVehicleService =
  vehicleService as jest.Mocked<typeof vehicleService>;

function buildApp() {
  const app = express();
  app.use(express.json());

  // Public route
  app.get('/api/vehicles/:id', getVehicleById);

  app.use(errorMiddleware);
  return app;
}

const app = buildApp();

describe('GET /api/vehicles/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is publicly accessible with no Authorization header', async () => {
    const sampleVehicle = {
      id: 'v1',
      make: 'Porsche',
      model: '911 Carrera GTS',
      category: 'Coupe',
      price: 142000,
      quantity: 3,
      imageUrl: 'https://example.com/porsche.jpg',
    };

    mockedVehicleService.findById.mockResolvedValue(sampleVehicle as any);

    const res = await request(app).get('/api/vehicles/v1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: sampleVehicle,
    });
    expect(mockedVehicleService.findById).toHaveBeenCalledWith('v1');
  });

  it('returns 404 when the vehicle is not found', async () => {
    mockedVehicleService.findById.mockRejectedValue(
      new AppError('Vehicle not found', 404)
    );

    const res = await request(app).get('/api/vehicles/non-existent-id');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: 'Vehicle not found',
    });
    expect(mockedVehicleService.findById).toHaveBeenCalledWith('non-existent-id');
  });

  it('handles unexpected errors via errorMiddleware', async () => {
    mockedVehicleService.findById.mockRejectedValue(
      new Error('Unexpected error occurred')
    );

    const res = await request(app).get('/api/vehicles/v1');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
