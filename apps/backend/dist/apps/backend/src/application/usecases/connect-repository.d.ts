import type { PrismaClient } from '@prisma/client';
export declare function connectRepository(prisma: PrismaClient, userId: string, owner: string, repo: string): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    url: string;
    fullName: string;
    githubRepoId: string | null;
    ownerId: string;
    visibility: string | null;
}>;
