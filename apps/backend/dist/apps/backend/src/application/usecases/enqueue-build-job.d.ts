import type { PrismaClient } from '@prisma/client';
export interface BuildJob {
    id: string;
    repository: string;
    branch: string;
    status: string;
    attempt?: number;
    maxAttempts?: number;
}
export interface BuildQueuePublisher {
    publishBuildJob(job: BuildJob): Promise<void>;
}
export declare function enqueueBuildJob(prisma: PrismaClient, publisher: BuildQueuePublisher, job: BuildJob): Promise<BuildJob>;
