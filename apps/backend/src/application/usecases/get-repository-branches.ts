import { HttpError } from '@enterprise/shared';
import type { PrismaClient } from '@prisma/client';

export async function getRepositoryBranches(prisma: PrismaClient, repositoryId: string, userId: string, isAdmin: boolean) {
  const repository = await prisma.repository.findUnique({
    where: { id: repositoryId },
    include: { branches: true },
  });

  if (!repository) {
    throw new HttpError(404, 'Repository not found', 'REPOSITORY_NOT_FOUND');
  }

  if (!isAdmin && repository.ownerId !== userId) {
    throw new HttpError(403, 'Access denied to repository', 'REPOSITORY_ACCESS_DENIED');
  }

  return repository.branches;
}
