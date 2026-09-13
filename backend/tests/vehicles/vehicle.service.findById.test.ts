import prisma from '../../src/utils/prisma';
import { vehicleService } from '../../src/services/vehicle.service';

jest.mock('../../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    vehicle: {
      findUnique: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as unknown as {
  vehicle: {
    findUnique: jest.Mock;
  };
};

describe('vehicleService.findById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a vehicle when found by id', async () => {
    const sampleVehicle = {
      id: 'v1',
      make: 'Porsche',
      model: '911 Carrera GTS',
      category: 'Coupe',
      price: 142000,
      quantity: 3,
      imageUrl: 'https://example.com/porsche.jpg',
    };

    mockedPrisma.vehicle.findUnique.mockResolvedValue(sampleVehicle);

    const result = await vehicleService.findById('v1');

    expect(mockedPrisma.vehicle.findUnique).toHaveBeenCalledWith({
      where: { id: 'v1' },
    });
    expect(result).toEqual(sampleVehicle);
  });

  it('throws a 404 AppError when vehicle does not exist', async () => {
    mockedPrisma.vehicle.findUnique.mockResolvedValue(null);

    await expect(vehicleService.findById('non-existent-id')).rejects.toMatchObject({
      statusCode: 404,
      message: 'Vehicle not found',
    });
  });

  it('rethrows unexpected database errors unchanged', async () => {
    const dbError = new Error('Database connection failed');
    mockedPrisma.vehicle.findUnique.mockRejectedValue(dbError);

    await expect(vehicleService.findById('v1')).rejects.toThrow('Database connection failed');
  });
});
