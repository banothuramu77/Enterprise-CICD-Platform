import type { PrismaClient } from '@prisma/client';
export interface ProcessedBuildJob {
    id: string;
    status: 'running' | 'succeeded' | 'failed' | 'retrying';
    attempts: number;
    message: string;
}
export declare function processBuildJob(prisma: PrismaClient, job: {
    id: string;
    repository: string;
    branch: string;
    attempt?: number;
    maxAttempts?: number;
}): Promise<ProcessedBuildJob>;
