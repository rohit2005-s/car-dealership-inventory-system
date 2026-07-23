import { VehicleInput, VehicleSearchQuery } from '../types';

/**
 * vehicleService owns all inventory business rules: CRUD, search filtering,
 * and the purchase/restock stock-mutation rules (can't purchase at 0 stock,
 * restock is admin-only, every purchase is logged). Separated from the
 * controller so Phase 5 can unit test these rules without spinning up Express.
 */
export const vehicleService = {
  async create(input: VehicleInput) {
    // TODO (Phase 4): prisma.vehicle.create({ data: input })
    throw new Error('Not implemented yet (Phase 4)');
  },

  async findAll(page: number, limit: number) {
    // TODO (Phase 4): paginated prisma.vehicle.findMany()
    throw new Error('Not implemented yet (Phase 4)');
  },

  async search(query: VehicleSearchQuery) {
    // TODO (Phase 4): build a dynamic `where` clause from make/model/category/minPrice/maxPrice
    throw new Error('Not implemented yet (Phase 4)');
  },

  async update(id: string, input: Partial<VehicleInput>) {
    // TODO (Phase 4): prisma.vehicle.update()
    throw new Error('Not implemented yet (Phase 4)');
  },

  async delete(id: string) {
    // TODO (Phase 4): prisma.vehicle.delete()
    throw new Error('Not implemented yet (Phase 4)');
  },

  async purchase(vehicleId: string, userId: string) {
    // TODO (Phase 4):
    // 1. find vehicle -> 404 if missing
    // 2. throw AppError(400) if quantity === 0
    // 3. decrement quantity by 1 + create Purchase record (ideally in a prisma.$transaction)
    throw new Error('Not implemented yet (Phase 4)');
  },

  async restock(vehicleId: string, amount: number) {
    // TODO (Phase 4): admin-only route guard is in middleware; here just increment quantity
    throw new Error('Not implemented yet (Phase 4)');
  },
};
