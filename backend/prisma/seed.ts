/// <reference types="node" />
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create Admin User
  console.log('Seeding admin user...');
  await prisma.user.upsert({
    where: { email: 'admin-cisb@gov.bc.ca' },
    update: {},
    create: {
      fullName: 'System Admin',
      email: 'admin-cisb@gov.bc.ca',
      role: UserRole.SYSTEM_ADMINISTRATOR,
      isActive: true,
    },
  });
  console.log('Created admin user');

  // Create Regions
  console.log('Seeding regions...');
  const regions = await Promise.all([
    prisma.region.upsert({
      where: { name: 'Vancouver' },
      update: {},
      create: { name: 'Vancouver' },
    }),
    prisma.region.upsert({
      where: { name: 'Fraser' },
      update: {},
      create: { name: 'Fraser' },
    }),
    prisma.region.upsert({
      where: { name: 'Interior' },
      update: {},
      create: { name: 'Interior' },
    }),
    prisma.region.upsert({
      where: { name: 'Vancouver Island' },
      update: {},
      create: { name: 'Vancouver Island' },
    }),
    prisma.region.upsert({
      where: { name: 'Northern' },
      update: {},
      create: { name: 'Northern' },
    }),
  ]);
  console.log(`Created ${regions.length} regions`);

  // Create Ministries
  console.log('Seeding ministries...');
  const ministries = await Promise.all([
    prisma.ministry.upsert({
      where: { name: 'Ministry of Social Development and Poverty Reduction' },
      update: {},
      create: {
        name: 'Ministry of Social Development and Poverty Reduction',
        code: 'SDPR',
        isActive: true,
      },
    }),
    prisma.ministry.upsert({
      where: { name: 'Ministry of Health' },
      update: {},
      create: {
        name: 'Ministry of Health',
        code: 'MOH',
        isActive: true,
      },
    }),
    prisma.ministry.upsert({
      where: { name: 'Ministry of Children and Family Development' },
      update: {},
      create: {
        name: 'Ministry of Children and Family Development',
        code: 'MCFD',
        isActive: true,
      },
    }),
    prisma.ministry.upsert({
      where: { name: 'Ministry of Public Safety and Solicitor General' },
      update: {},
      create: {
        name: 'Ministry of Public Safety and Solicitor General',
        code: 'PSSG',
        isActive: true,
      },
    }),
  ]);
  console.log(`Created ${ministries.length} ministries`);

  // Create Agency Types
  console.log('Seeding agency types...');
  const agencyTypes = await Promise.all([
    prisma.agencyType.upsert({
      where: { name: 'BC Housing' },
      update: {},
      create: { name: 'BC Housing', isActive: true },
    }),
    prisma.agencyType.upsert({
      where: { name: 'Health Authority' },
      update: {},
      create: { name: 'Health Authority', isActive: true },
    }),
    prisma.agencyType.upsert({
      where: { name: 'Community Agency' },
      update: {},
      create: { name: 'Community Agency', isActive: true },
    }),
  ]);
  console.log(`Created ${agencyTypes.length} agency types`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
