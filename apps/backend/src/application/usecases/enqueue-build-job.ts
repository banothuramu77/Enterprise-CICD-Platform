import { logger } from '../../lib/logger.js';
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

export async function enqueueBuildJob(prisma: PrismaClient, publisher: BuildQueuePublisher, job: BuildJob) {
  await publisher.publishBuildJob(job);

  try {
    await prisma.workflowRun.update({
      where: { id: job.id },
      data: { status: 'queued' },
    });
  } catch (error) {
    logger.warn(`Unable to mark workflow run ${job.id} as queued: ${error instanceof Error ? error.message : error}`);
  }

  logger.info(`Enqueued build job ${job.id} for ${job.repository}@${job.branch}`);
  return job;
}
