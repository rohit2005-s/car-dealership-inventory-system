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
    throw new Error('Not implemented yet (Phase 4)');
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