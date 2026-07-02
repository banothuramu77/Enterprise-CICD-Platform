import { HttpError } from '@enterprise/shared';
export async function getRepositoryBranches(prisma, repositoryId, userId, isAdmin) {
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
//# sourceMappingURL=get-repository-branches.js.map