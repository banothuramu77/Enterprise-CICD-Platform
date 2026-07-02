export async function listRepositories(prisma, userId, isAdmin) {
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
//# sourceMappingURL=list-repositories.js.map