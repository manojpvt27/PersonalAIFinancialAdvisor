import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning database...');

  // Delete all financial data
  await prisma.goalContribution.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.budget.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.income.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.auditLog.deleteMany({});

  console.log('✅ All financial records, budgets, goals, and chat history removed.');

  // Create demo user
  const passwordHash = await bcrypt.hash('demo123456', 12);
  await prisma.user.upsert({
    where: { email: 'demo@finai.com' },
    update: {},
    create: {
      email: 'demo@finai.com',
      passwordHash,
      name: 'Demo User',
      role: 'user',
      currency: 'INR',
    },
  });

  // Create admin user
  const adminHash = await bcrypt.hash('admin123456', 12);
  await prisma.user.upsert({
    where: { email: 'admin@finai.com' },
    update: {},
    create: {
      email: 'admin@finai.com',
      passwordHash: adminHash,
      name: 'Admin User',
      role: 'admin',
      currency: 'INR',
    },
  });

  console.log('\n🎉 Clean database ready!');
  console.log('📧 Login: demo@finai.com / demo123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
