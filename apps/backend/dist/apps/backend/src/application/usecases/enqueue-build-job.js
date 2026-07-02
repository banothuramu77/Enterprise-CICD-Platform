import { logger } from '../../lib/logger.js';
export async function enqueueBuildJob(prisma, publisher, job) {
    await publisher.publishBuildJob(job);
    try {
        await prisma.workflowRun.update({
            where: { id: job.id },
            data: { status: 'queued' },
        });
    }
    catch (error) {
        logger.warn(`Unable to mark workflow run ${job.id} as queued: ${error instanceof Error ? error.message : error}`);
    }
    logger.info(`Enqueued build job ${job.id} for ${job.repository}@${job.branch}`);
    return job;
}
//# sourceMappingURL=enqueue-build-job.js.map