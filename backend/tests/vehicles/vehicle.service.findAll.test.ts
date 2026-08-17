import prisma from '../../src/utils/prisma';
import { vehicleService } from '../../src/services/vehicle.service';

jest.mock('../../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    vehicle: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as unknown as {
  vehicle: {
    findMany: jest.Mock;
    count: jest.Mock;
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
  {
    id: 'v2',
    make: 'Honda',
    model: 'Civic',
    category: 'Sedan',
    price: 21000,
    quantity: 3,
  },
];

describe('vehicleService.findAll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computes skip as (page - 1) * limit for page 1', async () => {
    mockedPrisma.vehicle.findMany.mockResolvedValue(sampleVehicles);
    mockedPrisma.vehicle.count.mockResolvedValue(2);

    await vehicleService.findAll(1, 10);

    expect(mockedPrisma.vehicle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
      })
    );
  });

  it('calls prisma.vehicle.findMany with the correct skip/take for page 2', async () => {
    mockedPrisma.vehicle.findMany.mockResolvedValue(sampleVehicles);
    mockedPrisma.vehicle.count.mockResolvedValue(2);

    await vehicleService.findAll(2, 10);

    expect(mockedPrisma.vehicle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    );
  });

  it('calls prisma.vehicle.count to get the total number of vehicles', async () => {
    mockedPrisma.vehicle.findMany.mockResolvedValue(sampleVehicles);
    mockedPrisma.vehicle.count.mockResolvedValue(2);

    await vehicleService.findAll(1, 10);

    expect(mockedPrisma.vehicle.count).toHaveBeenCalled();
  });

  it('returns vehicles plus pagination metadata', async () => {
    mockedPrisma.vehicle.findMany.mockResolvedValue(sampleVehicles);
    mockedPrisma.vehicle.count.mockResolvedValue(23);

    const result = await vehicleService.findAll(1, 10);

    expect(result.vehicles).toEqual(sampleVehicles);

    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 23,
      totalPages: 3,
    });
  });
});