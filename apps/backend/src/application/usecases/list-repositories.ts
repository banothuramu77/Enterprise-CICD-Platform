import type { PrismaClient } from '@prisma/client';

export async function listRepositories(prisma: PrismaClient, userId: string, isAdmin: boolean) {
  if (isAdmin) {
    return prisma.repository.findMany({
      include: { branches: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  return prisma.repository.findMany({
    where: { ownerId: userId },
    include: { branches: true },
    orderBy: { createdAt: 'desc' },
  });
}
