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

describe('vehicleService.restock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('increments the vehicle quantity by the given amount using an atomic Prisma increment', async () => {
    const restocked = {
      id: 'v1',
      make: 'Toyota',
      model: 'Corolla',
      category: 'Sedan',
      price: 22000,
      quantity: 15,
      imageUrl: null,
    };

    mockedPrisma.vehicle.update.mockResolvedValue(restocked);

    const result = await vehicleService.restock('v1', 10);

    expect(mockedPrisma.vehicle.update).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: { quantity: { increment: 10 } },
    });

    expect(result).toEqual(restocked);
  });

  it('throws a 404 AppError when the vehicle does not exist (Prisma P2025)', async () => {
    mockedPrisma.vehicle.update.mockRejectedValue({
      code: 'P2025',
    });

    await expect(
      vehicleService.restock('nonexistent-id', 10)
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('rethrows unrelated errors unchanged', async () => {
    const dbError = new Error('connection lost');

    mockedPrisma.vehicle.update.mockRejectedValue(dbError);

    await expect(
      vehicleService.restock('v1', 10)
    ).rejects.toThrow('connection lost');
  });
});