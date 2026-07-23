import prisma from '../../src/utils/prisma';

/**
 * Database-layer tests (not HTTP). These exercise the Prisma schema directly:
 * constraints, defaults, and relations. Written BEFORE running the migration —
 * this is the RED step; `prisma migrate dev` + `prisma generate` turns it GREEN.
 */
describe('Database schema', () => {
  const testEmail = `schema-test-${Date.now()}@example.com`;

  afterAll(async () => {
    // Clean up in FK-safe order: purchases first, then user/vehicle.
    await prisma.purchase.deleteMany({ where: { user: { email: testEmail } } });
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.vehicle.deleteMany({ where: { make: 'SchemaTestMake' } });
    await prisma.$disconnect();
  });

  it('creates a user with a default role of "user"', async () => {
    const user = await prisma.user.create({
      data: { name: 'Schema Test', email: testEmail, password: 'hashed' },
    });
    expect(user.role).toBe('user');
    expect(user.id).toBeDefined();
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it('rejects a duplicate email at the database level', async () => {
    await expect(
      prisma.user.create({
        data: { name: 'Duplicate', email: testEmail, password: 'hashed' },
      })
    ).rejects.toThrow();
  });

  it('creates a vehicle with a default quantity of 0', async () => {
    const vehicle = await prisma.vehicle.create({
      data: { make: 'SchemaTestMake', model: 'TestModel', category: 'SUV', price: 25000 },
    });
    expect(vehicle.quantity).toBe(0);
  });

  it('creates a purchase linked to a user and a vehicle', async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { email: testEmail } });
    const vehicle = await prisma.vehicle.findFirstOrThrow({ where: { make: 'SchemaTestMake' } });

    const purchase = await prisma.purchase.create({
      data: { userId: user.id, vehicleId: vehicle.id },
    });

    expect(purchase.quantity).toBe(1); // default
    expect(purchase.userId).toBe(user.id);
    expect(purchase.vehicleId).toBe(vehicle.id);

    const withRelations = await prisma.purchase.findUniqueOrThrow({
      where: { id: purchase.id },
      include: { user: true, vehicle: true },
    });
    expect(withRelations.user.email).toBe(testEmail);
    expect(withRelations.vehicle.make).toBe('SchemaTestMake');
  });
});
