import request from 'supertest';
import express from 'express';
import { searchVehicles } from '../../src/controllers/vehicle.controller';
import { errorMiddleware } from '../../src/middlewares/error.middleware';
import { vehicleService } from '../../src/services/vehicle.service';

jest.mock('../../src/services/vehicle.service', () => ({
  vehicleService: {
    search: jest.fn(),
  },
}));

const mockedVehicleService =
  vehicleService as jest.Mocked<typeof vehicleService>;

function buildApp() {
  const app = express();

  app.use(express.json());

  // Deliberately NO authMiddleware/roleMiddleware —
  // GET /api/vehicles/search is public.
  app.get('/api/vehicles/search', searchVehicles);

  app.use(errorMiddleware);

  return app;
}

const app = buildApp();

const sampleVehicles = [
  {
    id: 'v1',
    make: 'Toyota',
    model: 'Corolla',
    category: 'Sedan',
    price: 22000,
    quantity: 5,
  },
];

describe('GET /api/vehicles/search', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is publicly accessible with no Authorization header', async () => {
    mockedVehicleService.search.mockResolvedValue(
      sampleVehicles as any
    );

    const res = await request(app).get('/api/vehicles/search');

    expect(res.status).toBe(200);
  });

  it('passes an empty filter object to the service when no query params are given', async () => {
    mockedVehicleService.search.mockResolvedValue(
      sampleVehicles as any
    );

    await request(app).get('/api/vehicles/search');

    expect(mockedVehicleService.search).toHaveBeenCalledWith({});
  });

  it('passes make/model/category through as strings', async () => {
    mockedVehicleService.search.mockResolvedValue(
      sampleVehicles as any
    );

    await request(app).get(
      '/api/vehicles/search?make=Toyota&model=Corolla&category=Sedan'
    );

    expect(mockedVehicleService.search).toHaveBeenCalledWith({
      make: 'Toyota',
      model: 'Corolla',
      category: 'Sedan',
    });
  });

  it('coerces minPrice/maxPrice query strings into numbers', async () => {
    mockedVehicleService.search.mockResolvedValue(
      sampleVehicles as any
    );

    await request(app).get(
      '/api/vehicles/search?minPrice=10000&maxPrice=30000'
    );

    expect(mockedVehicleService.search).toHaveBeenCalledWith({
      minPrice: 10000,
      maxPrice: 30000,
    });
  });

  it('returns 400 when minPrice is not numeric', async () => {
    const res = await request(app).get(
      '/api/vehicles/search?minPrice=abc'
    );

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(mockedVehicleService.search).not.toHaveBeenCalled();
  });

  it('returns 200 with an array of matching vehicles', async () => {
    mockedVehicleService.search.mockResolvedValue(
      sampleVehicles as any
    );

    const res = await request(app).get(
      '/api/vehicles/search?make=Toyota'
    );

    expect(res.status).toBe(200);

    expect(res.body).toEqual({
      success: true,
      data: sampleVehicles,
    });

    expect(Array.isArray(res.body.data)).toBe(true);
  });
});