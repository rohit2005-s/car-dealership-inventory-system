import prisma from '../utils/prisma';

export const purchaseService = {
  async getUserPurchases(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { vehicle: true },
      }),
      prisma.purchase.count({ where: { userId } }),
    ]);

    return {
      purchases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};