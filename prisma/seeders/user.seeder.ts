import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { logger } from './utils/logger';

export async function seedUsers(prisma: PrismaClient) {
  logger.info('Seeding users...');

  const passwordHash = await bcrypt.hash('tudus@dev', 10);

  // 1. Usuario Admin (Juan Salazar)
  const adminUser = await prisma.user.upsert({
    where: { email: 'jsalazarv8@gmail.com' },
    update: {
      passwordHash,
    },
    create: {
      email: 'jsalazarv8@gmail.com',
      name: 'Juan Salazar',
      passwordHash,
      role: 'ADMIN',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true,
    },
  });

  logger.success(`Admin user: ${adminUser.email}`);

  // 2. Suscripción PREMIUM perpetua para admin
  await prisma.subscription.upsert({
    where: {
      stripeSubscriptionId: 'admin_perpetual_subscription',
    },
    update: {},
    create: {
      userId: adminUser.id,
      tier: 'PREMIUM',
      billingInterval: 'LIFETIME',
      status: 'ACTIVE',
      startedAt: new Date(),
      expiresAt: null,
      stripeSubscriptionId: 'admin_perpetual_subscription',
      price: 0,
      currency: 'USD',
    },
  });

  logger.success('Admin subscription: PREMIUM (perpetual)');

  // 3. Usuario de ejemplo FREE (opcional - para testing)
  const freeUser = await prisma.user.upsert({
    where: { email: 'free.user@example.com' },
    update: {},
    create: {
      email: 'free.user@example.com',
      name: 'Free User',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'USER',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true,
    },
  });

  logger.success(`Free user: ${freeUser.email}`);

  // 4. Suscripción FREE para usuario de ejemplo
  await prisma.subscription.upsert({
    where: {
      stripeSubscriptionId: 'free_user_subscription',
    },
    update: {},
    create: {
      userId: freeUser.id,
      tier: 'FREE',
      billingInterval: null,
      status: 'ACTIVE',
      startedAt: new Date(),
      expiresAt: null,
      stripeSubscriptionId: 'free_user_subscription',
    },
  });

  logger.success('Free subscription created');
  logger.success('✨ User seeding completed!');
}
