import prisma from '../../src/utils/prisma';
import { purchaseService } from '../../src/services/purchase.service';

jest.mock('../../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    purchase: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as unknown as {
  purchase: { findMany: jest.Mock; count: jest.Mock };
};

const samplePurchases = [
  {
    id: 'p1',
    userId: 'user-1',
    vehicleId: 'v1',
    quantity: 1,
    createdAt: new Date(),
    vehicle: {
      id: 'v1',
      make: 'Toyota',
      model: 'Corolla',
      category: 'Sedan',
      price: 22000,
    },
  },
];

describe('purchaseService.getUserPurchases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('scopes the query to the given userId only', async () => {
    mockedPrisma.purchase.findMany.mockResolvedValue(samplePurchases);
    mockedPrisma.purchase.count.mockResolvedValue(1);

    await purchaseService.getUserPurchases('user-1', 1, 10);

    expect(mockedPrisma.purchase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } })
    );

    expect(mockedPrisma.purchase.count).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    });
  });

  it('includes the related vehicle for each purchase', async () => {
    mockedPrisma.purchase.findMany.mockResolvedValue(samplePurchases);
    mockedPrisma.purchase.count.mockResolvedValue(1);

    await purchaseService.getUserPurchases('user-1', 1, 10);

    expect(mockedPrisma.purchase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: { vehicle: true } })
    );
  });

  it('computes skip/take correctly for pagination (page 3, limit 10 -> skip 20)', async () => {
    mockedPrisma.purchase.findMany.mockResolvedValue(samplePurchases);
    mockedPrisma.purchase.count.mockResolvedValue(25);

    await purchaseService.getUserPurchases('user-1', 3, 10);

    expect(mockedPrisma.purchase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
  });

  it('scopes results independently per user (never leaks another user\'s filter)', async () => {
    mockedPrisma.purchase.findMany.mockResolvedValue([]);
    mockedPrisma.purchase.count.mockResolvedValue(0);

    await purchaseService.getUserPurchases('user-A', 1, 10);

    expect(mockedPrisma.purchase.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { userId: 'user-A' } })
    );

    jest.clearAllMocks();

    mockedPrisma.purchase.findMany.mockResolvedValue([]);
    mockedPrisma.purchase.count.mockResolvedValue(0);

    await purchaseService.getUserPurchases('user-B', 1, 10);

    expect(mockedPrisma.purchase.findMany).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-A' } })
    );
  });

  it('returns purchases plus pagination metadata', async () => {
    mockedPrisma.purchase.findMany.mockResolvedValue(samplePurchases);
    mockedPrisma.purchase.count.mockResolvedValue(25);

    const result = await purchaseService.getUserPurchases('user-1', 1, 10);

    expect(result.purchases).toEqual(samplePurchases);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
    });
  });

  it('returns an empty array and zero totals when the user has no purchases', async () => {
    mockedPrisma.purchase.findMany.mockResolvedValue([]);
    mockedPrisma.purchase.count.mockResolvedValue(0);

    const result = await purchaseService.getUserPurchases(
      'user-with-no-purchases',
      1,
      10
    );

    expect(result.purchases).toEqual([]);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
  });
});