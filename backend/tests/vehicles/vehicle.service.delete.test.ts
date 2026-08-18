import prisma from '../../src/utils/prisma';
import { vehicleService } from '../../src/services/vehicle.service';

jest.mock('../../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    vehicle: {
      delete: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as unknown as {
  vehicle: {
    delete: jest.Mock;
  };
};

describe('vehicleService.delete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes a vehicle by id', async () => {
    const deletedVehicle = {
      id: 'v1',
      make: 'Toyota',
      model: 'Corolla',
      category: 'Sedan',
      price: 22000,
      quantity: 5,
      imageUrl: null,
    };

    mockedPrisma.vehicle.delete.mockResolvedValue(
      deletedVehicle
    );

    const result = await vehicleService.delete('v1');

    expect(mockedPrisma.vehicle.delete).toHaveBeenCalledWith({
      where: {
        id: 'v1',
      },
    });

    expect(result).toEqual(deletedVehicle);
  });

  it('throws a 404 AppError when the vehicle does not exist', async () => {
    mockedPrisma.vehicle.delete.mockRejectedValue({
      code: 'P2025',
    });

    await expect(
      vehicleService.delete('nonexistent-id')
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('rethrows unrelated database errors unchanged', async () => {
    const dbError = new Error('database connection failed');

    mockedPrisma.vehicle.delete.mockRejectedValue(dbError);

    await expect(
      vehicleService.delete('v1')
    ).rejects.toThrow('database connection failed');
  });
});