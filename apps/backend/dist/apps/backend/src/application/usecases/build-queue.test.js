import { describe, expect, it, vi } from 'vitest';
import { enqueueBuildJob } from './enqueue-build-job.js';
import { handleBuildJobFailure } from '../../lib/rabbitmq.js';
describe('build queue use case', () => {
    it('publishes a build job and marks the workflow run as queued', async () => {
        const publish = vi.fn().mockResolvedValue(undefined);
        const prisma = {
            workflowRun: {
                update: vi.fn().mockResolvedValue(undefined),
            },
        };
        await enqueueBuildJob(prisma, { publishBuildJob: publish }, {
            id: 'run-1',
            repository: 'octo/demo',
            branch: 'main',
            status: 'queued',
        });
        expect(publish).toHaveBeenCalled();
        expect(prisma.workflowRun.update).toHaveBeenCalledWith({
            where: { id: 'run-1' },
            data: { status: 'queued' },
        });
    });
    it('retries a failed build before the max attempts threshold', async () => {
        const publish = vi.fn().mockResolvedValue(undefined);
        const prisma = {
            workflowRun: {
                update: vi.fn().mockResolvedValue(undefined),
            },
        };
        await handleBuildJobFailure(prisma, {
            id: 'run-2',
            repository: 'octo/demo',
            branch: 'main',
            status: 'running',
            attempt: 0,
            maxAttempts: 3,
        }, new Error('boom'), { publishBuildJob: publish });
        expect(publish).toHaveBeenCalledWith(expect.objectContaining({ id: 'run-2', attempt: 1, status: 'retrying' }));
        expect(prisma.workflowRun.update).toHaveBeenCalledWith({
            where: { id: 'run-2' },
            data: { status: 'retrying' },
        });
    });
    it('sends exhausted jobs to the dead-letter queue and marks them failed', async () => {
        const publish = vi.fn().mockResolvedValue(undefined);
        const prisma = {
            workflowRun: {
                update: vi.fn().mockResolvedValue(undefined),
            },
        };
        await handleBuildJobFailure(prisma, {
            id: 'run-3',
            repository: 'octo/demo',
            branch: 'main',
            status: 'running',
            attempt: 2,
            maxAttempts: 3,
        }, new Error('boom'), { publishBuildJob: publish });
        expect(publish).toHaveBeenCalledWith(expect.objectContaining({ id: 'run-3', status: 'failed' }));
        expect(prisma.workflowRun.update).toHaveBeenCalledWith({
            where: { id: 'run-3' },
            data: { status: 'failed' },
        });
    });
});
//# sourceMappingURL=build-queue.test.js.map