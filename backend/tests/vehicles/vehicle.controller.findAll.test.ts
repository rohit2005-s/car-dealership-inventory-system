import request from 'supertest';
import express from 'express';
import { getVehicles } from '../../src/controllers/vehicle.controller';
import { errorMiddleware } from '../../src/middlewares/error.middleware';
import { vehicleService } from '../../src/services/vehicle.service';

jest.mock('../../src/services/vehicle.service', () => ({
  vehicleService: {
    findAll: jest.fn(),
  },
}));

const mockedVehicleService =
  vehicleService as jest.Mocked<typeof vehicleService>;

function buildApp() {
  const app = express();

  app.use(express.json());

  // GET /api/vehicles is public.
  app.get('/api/vehicles', getVehicles);

  app.use(errorMiddleware);

  return app;
}

const app = buildApp();

const sampleResult = {
  vehicles: [
    {
      id: 'v1',
      make: 'Toyota',
      model: 'Corolla',
      category: 'Sedan',
      price: 22000,
      quantity: 5,
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
  },
};

describe('GET /api/vehicles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is publicly accessible with no Authorization header', async () => {
    mockedVehicleService.findAll.mockResolvedValue(
      sampleResult as any
    );

    const res = await request(app).get('/api/vehicles');

    expect(res.status).toBe(200);
  });

  it('defaults to page=1, limit=10 when no query params are given', async () => {
    mockedVehicleService.findAll.mockResolvedValue(
      sampleResult as any
    );

    await request(app).get('/api/vehicles');

    expect(mockedVehicleService.findAll).toHaveBeenCalledWith(1, 10);
  });

  it('uses page/limit from query params when provided', async () => {
    mockedVehicleService.findAll.mockResolvedValue(
      sampleResult as any
    );

    await request(app).get(
      '/api/vehicles?page=3&limit=5'
    );

    expect(mockedVehicleService.findAll).toHaveBeenCalledWith(3, 5);
  });

  it('returns 400 for a non-numeric page value', async () => {
    const res = await request(app).get(
      '/api/vehicles?page=abc'
    );

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);

    expect(
      mockedVehicleService.findAll
    ).not.toHaveBeenCalled();
  });

  it('returns 400 for a zero or negative page value', async () => {
    const res = await request(app).get(
      '/api/vehicles?page=0'
    );

    expect(res.status).toBe(400);

    expect(
      mockedVehicleService.findAll
    ).not.toHaveBeenCalled();
  });

  it('returns 400 for a non-integer page value', async () => {
    const res = await request(app).get(
      '/api/vehicles?page=1.5'
    );

    expect(res.status).toBe(400);

    expect(
      mockedVehicleService.findAll
    ).not.toHaveBeenCalled();
  });

  it('returns 400 when limit exceeds the maximum allowed (100)', async () => {
    const res = await request(app).get(
      '/api/vehicles?limit=1000'
    );

    expect(res.status).toBe(400);

    expect(
      mockedVehicleService.findAll
    ).not.toHaveBeenCalled();
  });

  it('returns 400 for a zero or negative limit value', async () => {
    const res = await request(app).get(
      '/api/vehicles?limit=0'
    );

    expect(res.status).toBe(400);

    expect(
      mockedVehicleService.findAll
    ).not.toHaveBeenCalled();
  });

  it('returns vehicles and pagination metadata in the response body', async () => {
    mockedVehicleService.findAll.mockResolvedValue(
      sampleResult as any
    );

    const res = await request(app).get('/api/vehicles');

    expect(res.body).toEqual({
      success: true,
      data: sampleResult.vehicles,
      pagination: sampleResult.pagination,
    });
  });
});