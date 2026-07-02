import type { PrismaClient } from '@prisma/client';
export declare function triggerBuild(prisma: PrismaClient, userId: string, repositoryId: string, branch?: string): Promise<{
    status: string;
    id: string;
    repository: string;
    branch: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string | null;
    repositoryId: string | null;
}>;
