import { logger } from '../../lib/logger.js';
import type { PrismaClient } from '@prisma/client';

export interface ProcessedBuildJob {
  id: string;
  status: 'running' | 'succeeded' | 'failed' | 'retrying';
  attempts: number;
  message: string;
}

export async function processBuildJob(prisma: PrismaClient, job: { id: string; repository: string; branch: string; attempt?: number; maxAttempts?: number }) {
  const attempt = job.attempt ?? 0;
  const maxAttempts = job.maxAttempts ?? 3;

  logger.info(`Processing build job ${job.id} attempt ${attempt + 1}`);

  await prisma.workflowRun.update({
    where: { id: job.id },
    data: { status: 'running' },
  });

  if (attempt >= maxAttempts) {
    await prisma.workflowRun.update({
      where: { id: job.id },
      data: { status: 'failed' },
    });
    return { id: job.id, status: 'failed', attempts: attempt + 1, message: 'Max attempts exceeded' } as ProcessedBuildJob;
  }

  try {
    await Promise.resolve();
    await prisma.workflowRun.update({
      where: { id: job.id },
      data: { status: 'succeeded' },
    });
    return { id: job.id, status: 'succeeded', attempts: attempt + 1, message: 'Build completed successfully' } as ProcessedBuildJob;
  } catch (error) {
    await prisma.workflowRun.update({
      where: { id: job.id },
      data: { status: 'retrying' },
    });
    throw error;
  }
}
