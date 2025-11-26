#!/usr/bin/env node

require('dotenv').config({ path: '.env' });
const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@barcelobiagi.ru';
  const password = process.env.ADMIN_PASSWORD || 'Admin!8xEr#2024';
  const name = process.env.ADMIN_NAME || 'Initial Admin';

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: UserRole.ADMIN,
      isActive: true,
      passwordHash,
    },
    create: {
      email,
      name,
      role: UserRole.ADMIN,
      isActive: true,
      passwordHash,
    },
  });

  console.log('Admin user ready:', {
    id: user.id,
    email,
    password,
  });
}

main()
  .catch((err) => {
    console.error('Failed to create admin user', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
