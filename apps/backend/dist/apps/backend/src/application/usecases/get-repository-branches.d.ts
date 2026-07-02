import type { PrismaClient } from '@prisma/client';
export declare function getRepositoryBranches(prisma: PrismaClient, repositoryId: string, userId: string, isAdmin: boolean): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    repositoryId: string;
    protected: boolean;
}[]>;
