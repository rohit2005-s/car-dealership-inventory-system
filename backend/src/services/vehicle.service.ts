import prisma from '../utils/prisma';
import { VehicleInput, VehicleSearchQuery } from '../types';
import { AppError } from '../utils/AppError';

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

      if (query.minPrice !== undefined) {
        price.gte = query.minPrice;
      }

      if (query.maxPrice !== undefined) {
        price.lte = query.maxPrice;
      }

      where.price = price;
    }

    return prisma.vehicle.findMany({ where });
  },

  async update(id: string, input: Partial<VehicleInput>) {
    try {
      return await prisma.vehicle.update({
        where: { id },
        data: input,
      });
    } catch (err: any) {
      if (err?.code === 'P2025') {
        throw new AppError('Vehicle not found', 404);
      }

      throw err;
    }
  },

  async delete(id: string) {
    try {
      return await prisma.vehicle.delete({
        where: { id },
      });
    } catch (err: any) {
      if (err?.code === 'P2025') {
        throw new AppError('Vehicle not found', 404);
      }

      throw err;
    }
  },

  async purchase(vehicleId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // Atomically decrease stock only if the vehicle exists
      // and has at least one item available.
      const result = await tx.vehicle.updateMany({
        where: {
          id: vehicleId,
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

      // If nothing was updated, determine whether the vehicle
      // does not exist or simply has no stock.
      if (result.count === 0) {
        const vehicle = await tx.vehicle.findUnique({
          where: { id: vehicleId },
        });

        if (!vehicle) {
          throw new AppError('Vehicle not found', 404);
        }

        throw new AppError('Vehicle is out of stock', 400);
      }

      // Create the purchase record in the same transaction.
      await tx.purchase.create({
        data: {
          userId,
          vehicleId,
        },
      });

      // Return the updated vehicle.
      const vehicle = await tx.vehicle.findUnique({
        where: { id: vehicleId },
      });

      if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
      }

      return vehicle;
    });
  },

  async restock(vehicleId: string, amount: number) {
    try {
      return await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { quantity: { increment: amount } },
      });
    } catch (err: any) {
      if (err?.code === 'P2025') {
        throw new AppError('Vehicle not found', 404);
      }

      throw err;
    }
  },
};