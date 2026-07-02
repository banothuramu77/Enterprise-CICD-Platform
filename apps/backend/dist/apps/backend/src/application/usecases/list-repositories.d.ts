import type { PrismaClient } from '@prisma/client';
export declare function listRepositories(prisma: PrismaClient, userId: string, isAdmin: boolean): Promise<({
    branches: {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        repositoryId: string;
        protected: boolean;
    }[];
} & {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    url: string;
    fullName: string;
    githubRepoId: string | null;
    ownerId: string;
    visibility: string | null;
})[]>;
