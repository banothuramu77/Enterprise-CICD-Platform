import { describe, expect, it, vi } from 'vitest';
import { enqueueBuildJob } from './enqueue-build-job.js';
import { processBuildJob } from './process-build-job.js';
describe('build queue use cases', () => {
    it('enqueues a build job and updates workflow status', async () => {
        const publish = vi.fn().mockResolvedValue(undefined);
        const prisma = {
            workflowRun: {
                update: vi.fn().mockResolvedValue(undefined),
            },
        };
        const result = await enqueueBuildJob(prisma, { publishBuildJob: publish }, {
            id: 'run-1',
            repository: 'octo/demo',
            branch: 'main',
            status: 'queued',
        });
        expect(result.id).toBe('run-1');
        expect(publish).toHaveBeenCalled();
    });
    it('marks a build job as running and then succeeded', async () => {
        const prisma = {
            workflowRun: {
                update: vi.fn().mockResolvedValue(undefined),
            },
        };
        const result = await processBuildJob(prisma, { id: 'run-2', repository: 'octo/demo', branch: 'main' });
        expect(result.status).toBe('succeeded');
        expect(prisma.workflowRun.update).toHaveBeenCalled();
    });
});
//# sourceMappingURL=build-queue.usecases.test.js.map