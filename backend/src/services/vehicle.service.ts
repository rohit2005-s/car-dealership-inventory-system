import prisma from '../utils/prisma';
import { VehicleInput, VehicleSearchQuery } from '../types';

export const vehicleService = {
  async create(input: VehicleInput) {
    return prisma.vehicle.create({ data: input });
  },

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({ skip, take: limit }),
      prisma.vehicle.count(),
    ]);

    return {
      vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async search(query: VehicleSearchQuery) {
    const where: Record<string, unknown> = {};

    if (query.make) where.make = query.make;
    if (query.model) where.model = query.model;
    if (query.category) where.category = query.category;

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const price: { gte?: number; lte?: number } = {};

      if (query.minPrice !== undefined) price.gte = query.minPrice;
      if (query.maxPrice !== undefined) price.lte = query.maxPrice;

      where.price = price;
    }

    return prisma.vehicle.findMany({ where });
  },

  async update(id: string, input: Partial<VehicleInput>) {
    throw new Error('Not implemented yet (Phase 4)');
  },

  async delete(id: string) {
    throw new Error('Not implemented yet (Phase 4)');
  },

  async purchase(vehicleId: string, userId: string) {
    throw new Error('Not implemented yet (Phase 4)');
  },

  async restock(vehicleId: string, amount: number) {
    throw new Error('Not implemented yet (Phase 4)');
  },
};