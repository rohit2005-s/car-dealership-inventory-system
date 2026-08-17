import prisma from '../../src/utils/prisma';
import { vehicleService } from '../../src/services/vehicle.service';

jest.mock('../../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    vehicle: {
      findMany: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as unknown as {
  vehicle: {
    findMany: jest.Mock;
  };
};

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

describe('vehicleService.search', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedPrisma.vehicle.findMany.mockResolvedValue(sampleVehicles);
  });

  it('builds an empty where clause when no filters are given', async () => {
    await vehicleService.search({});

    expect(mockedPrisma.vehicle.findMany).toHaveBeenCalledWith({
      where: {},
    });
  });

  it('filters by make only', async () => {
    await vehicleService.search({ make: 'Toyota' });

    expect(mockedPrisma.vehicle.findMany).toHaveBeenCalledWith({
      where: { make: 'Toyota' },
    });
  });

  it('filters by model and category together', async () => {
    await vehicleService.search({
      model: 'Corolla',
      category: 'Sedan',
    });

    expect(mockedPrisma.vehicle.findMany).toHaveBeenCalledWith({
      where: {
        model: 'Corolla',
        category: 'Sedan',
      },
    });
  });

  it('translates minPrice into price.gte', async () => {
    await vehicleService.search({
      minPrice: 10000,
    });

    expect(mockedPrisma.vehicle.findMany).toHaveBeenCalledWith({
      where: {
        price: {
          gte: 10000,
        },
      },
    });
  });

  it('translates maxPrice into price.lte', async () => {
    await vehicleService.search({
      maxPrice: 30000,
    });

    expect(mockedPrisma.vehicle.findMany).toHaveBeenCalledWith({
      where: {
        price: {
          lte: 30000,
        },
      },
    });
  });

  it('combines minPrice and maxPrice into a single price range', async () => {
    await vehicleService.search({
      minPrice: 10000,
      maxPrice: 30000,
    });

    expect(mockedPrisma.vehicle.findMany).toHaveBeenCalledWith({
      where: {
        price: {
          gte: 10000,
          lte: 30000,
        },
      },
    });
  });

  it('combines make, category, and a price range in one query', async () => {
    await vehicleService.search({
      make: 'Toyota',
      category: 'Sedan',
      minPrice: 10000,
      maxPrice: 30000,
    });

    expect(mockedPrisma.vehicle.findMany).toHaveBeenCalledWith({
      where: {
        make: 'Toyota',
        category: 'Sedan',
        price: {
          gte: 10000,
          lte: 30000,
        },
      },
    });
  });

  it('returns whatever prisma.findMany resolves with', async () => {
    const result = await vehicleService.search({
      make: 'Toyota',
    });

    expect(result).toEqual(sampleVehicles);
  });
});