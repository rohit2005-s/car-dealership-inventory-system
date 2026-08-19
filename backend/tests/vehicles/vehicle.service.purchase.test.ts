import { vehicleService } from '../../src/services/vehicle.service';
import prisma from '../../src/utils/prisma';
import { AppError } from '../../src/utils/AppError';

jest.mock('../../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
  },
}));

describe('vehicleService.purchase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('decreases vehicle quantity and creates a purchase record', async () => {
    const updatedVehicle = {
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Corolla',
      category: 'Sedan',
      price: 22000,
      quantity: 4,
      imageUrl: null,
    };

    const tx = {
      vehicle: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue(updatedVehicle),
      },
      purchase: {
        create: jest.fn().mockResolvedValue({
          id: 'purchase-1',
          userId: 'user-1',
          vehicleId: 'vehicle-1',
        }),
      },
    };

    (prisma.$transaction as jest.Mock).mockImplementation(
      async (callback: any) => callback(tx)
    );

    const result = await vehicleService.purchase(
      'vehicle-1',
      'user-1'
    );

    expect(tx.vehicle.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'vehicle-1',
        quantity: {
          gt: 0,
        },
      },
      data: {
        quantity: {
          decrement: 1,
        },
      },
    });

    expect(tx.purchase.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        vehicleId: 'vehicle-1',
      },
    });

    expect(result).toEqual(updatedVehicle);
  });

  it('throws 400 when the vehicle is out of stock', async () => {
    const tx = {
      vehicle: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        findUnique: jest.fn().mockResolvedValue({
          id: 'vehicle-1',
          quantity: 0,
        }),
      },
      purchase: {
        create: jest.fn(),
      },
    };

    (prisma.$transaction as jest.Mock).mockImplementation(
      async (callback: any) => callback(tx)
    );

    await expect(
      vehicleService.purchase('vehicle-1', 'user-1')
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Vehicle is out of stock',
    });

    expect(tx.purchase.create).not.toHaveBeenCalled();
  });

  it('throws 404 when the vehicle does not exist', async () => {
    const tx = {
      vehicle: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      purchase: {
        create: jest.fn(),
      },
    };

    (prisma.$transaction as jest.Mock).mockImplementation(
      async (callback: any) => callback(tx)
    );

    await expect(
      vehicleService.purchase('vehicle-1', 'user-1')
    ).rejects.toMatchObject({
      statusCode: 404,
      message: 'Vehicle not found',
    });

    expect(tx.purchase.create).not.toHaveBeenCalled();
  });

  it('does not create a purchase if stock update fails', async () => {
    const tx = {
      vehicle: {
        updateMany: jest
          .fn()
          .mockRejectedValue(new Error('Database error')),
        findUnique: jest.fn(),
      },
      purchase: {
        create: jest.fn(),
      },
    };

    (prisma.$transaction as jest.Mock).mockImplementation(
      async (callback: any) => callback(tx)
    );

    await expect(
      vehicleService.purchase('vehicle-1', 'user-1')
    ).rejects.toThrow('Database error');

    expect(tx.purchase.create).not.toHaveBeenCalled();
  });
});