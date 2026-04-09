import { PrismaClient } from '@prisma/client';

/**
 * Prisma Clientのシングルトンインスタンス
 */
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * アプリケーション終了時にPrisma Clientを切断
 */
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
