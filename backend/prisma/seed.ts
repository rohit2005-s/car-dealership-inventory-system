import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEMO_VEHICLES = [
  {
    make: 'Porsche',
    model: '911 GT3',
    category: 'Coupe',
    price: 182900,
    quantity: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    make: 'BMW',
    model: 'M3 Competition',
    category: 'Sedan',
    price: 76000,
    quantity: 4,
    imageUrl:
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    make: 'Audi',
    model: 'RS6 Avant',
    category: 'Luxury',
    price: 125800,
    quantity: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    make: 'Mercedes-Benz',
    model: 'AMG GT Coupe',
    category: 'Coupe',
    price: 144900,
    quantity: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    make: 'Tesla',
    model: 'Model S Plaid',
    category: 'Electric',
    price: 89990,
    quantity: 5,
    imageUrl:
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
  },
  {
    make: 'Ford',
    model: 'F-150 Lightning',
    category: 'Truck',
    price: 69995,
    quantity: 4,
    imageUrl:
      'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    make: 'Porsche',
    model: 'Taycan Turbo S',
    category: 'Electric',
    price: 194900,
    quantity: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  },
  {
    make: 'Land Rover',
    model: 'Range Rover SV',
    category: 'SUV',
    price: 209000,
    quantity: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
  },
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed demo vehicles if catalog is empty
  const existingVehiclesCount = await prisma.vehicle.count();
  if (existingVehiclesCount === 0) {
    console.log(`📦 Seeding ${DEMO_VEHICLES.length} showroom vehicles...`);
    for (const vehicle of DEMO_VEHICLES) {
      await prisma.vehicle.create({
        data: vehicle,
      });
    }
    console.log('✅ Showroom vehicles seeded successfully.');
  } else {
    console.log(`ℹ️ Showroom already contains ${existingVehiclesCount} vehicles; skipping vehicle seed.`);
  }

  // 2. Demo Admin Account (Secrets passed strictly via environment variables)
  const isProduction = process.env.NODE_ENV === 'production';
  const adminEmail = process.env.DEMO_ADMIN_EMAIL || 'admin@autohaus.com';
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD || (!isProduction ? 'AdminDev123!' : null);

  if (adminPassword) {
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: Role.admin },
      create: {
        name: 'AutoHaus Admin',
        email: adminEmail,
        password: hashedAdminPassword,
        role: Role.admin,
      },
    });
    console.log(`✅ Admin account configured: ${admin.email} (role: ${admin.role})`);
  } else {
    console.log('ℹ️ DEMO_ADMIN_PASSWORD not provided in production; skipping admin user seed.');
  }

  // 3. Demo Customer Account (Secrets passed strictly via environment variables)
  const userEmail = process.env.DEMO_USER_EMAIL || 'customer@autohaus.com';
  const userPassword = process.env.DEMO_USER_PASSWORD || (!isProduction ? 'UserDev123!' : null);

  if (userPassword) {
    const hashedUserPassword = await bcrypt.hash(userPassword, 10);
    const customer = await prisma.user.upsert({
      where: { email: userEmail },
      update: {},
      create: {
        name: 'Demo Customer',
        email: userEmail,
        password: hashedUserPassword,
        role: Role.user,
      },
    });
    console.log(`✅ Customer account configured: ${customer.email} (role: ${customer.role})`);
  } else {
    console.log('ℹ️ DEMO_USER_PASSWORD not provided in production; skipping customer user seed.');
  }

  console.log('🌿 Database seed finished.');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
