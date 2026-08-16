import prisma from '../../src/utils/prisma';
import { vehicleService } from '../../src/services/vehicle.service';

jest.mock('../../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    vehicle: {
      create: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as unknown as {
  vehicle: {
    create: jest.Mock;
  };
};

describe('vehicleService.create', () => {
  const input = {
    make: 'Toyota',
    model: 'Corolla',
    category: 'Sedan',
    price: 22000,
    quantity: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a vehicle via prisma with the given input', async () => {
    const created = {
      id: 'v1',
      ...input,
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockedPrisma.vehicle.create.mockResolvedValue(created);

    const result = await vehicleService.create(input);

    expect(mockedPrisma.vehicle.create).toHaveBeenCalledWith({
      data: input,
    });

    expect(result).toEqual(created);
  });

  it('supports an optional imageUrl field', async () => {
    const withImage = {
      ...input,
      imageUrl: 'https://example.com/car.jpg',
    };

    mockedPrisma.vehicle.create.mockResolvedValue({
      id: 'v2',
      ...withImage,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await vehicleService.create(withImage);

    expect(mockedPrisma.vehicle.create).toHaveBeenCalledWith({
      data: withImage,
    });
  });
});