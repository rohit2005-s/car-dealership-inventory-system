import prisma from '../../src/utils/prisma';
import { vehicleService } from '../../src/services/vehicle.service';

jest.mock('../../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    vehicle: {
      update: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as unknown as {
  vehicle: {
    update: jest.Mock;
  };
};

describe('vehicleService.update', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates a vehicle with a single partial field', async () => {
    const updated = {
      id: 'v1',
      make: 'Toyota',
      model: 'Corolla',
      category: 'Sedan',
      price: 25000,
      quantity: 5,
      imageUrl: null,
    };

    mockedPrisma.vehicle.update.mockResolvedValue(updated);

    const result = await vehicleService.update('v1', {
      price: 25000,
    });

    expect(mockedPrisma.vehicle.update).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: { price: 25000 },
    });

    expect(result).toEqual(updated);
  });

  it('updates a vehicle with multiple fields at once', async () => {
    const updated = {
      id: 'v1',
      make: 'Toyota',
      model: 'Camry',
      category: 'Sedan',
      price: 27000,
      quantity: 8,
      imageUrl: null,
    };

    mockedPrisma.vehicle.update.mockResolvedValue(updated);

    const result = await vehicleService.update('v1', {
      model: 'Camry',
      price: 27000,
      quantity: 8,
    });

    expect(mockedPrisma.vehicle.update).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: {
        model: 'Camry',
        price: 27000,
        quantity: 8,
      },
    });

    expect(result).toEqual(updated);
  });

  it('throws a 404 AppError when the vehicle does not exist (Prisma P2025)', async () => {
    mockedPrisma.vehicle.update.mockRejectedValue({
      code: 'P2025',
    });

    await expect(
      vehicleService.update('nonexistent-id', {
        price: 25000,
      })
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('rethrows unrelated errors unchanged', async () => {
    const dbError = new Error('connection lost');

    mockedPrisma.vehicle.update.mockRejectedValue(dbError);

    await expect(
      vehicleService.update('v1', {
        price: 25000,
      })
    ).rejects.toThrow('connection lost');
  });
});