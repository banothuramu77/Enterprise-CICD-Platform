import { describe, expect, it } from 'vitest';
import { WorkerRegistry, cancelBuildJob, isBuildJobCancelled, registerWorker, recordHeartbeat } from './build-consumer.js';
describe('worker build consumer', () => {
    it('registers and heartbeats workers', () => {
        const registry = new WorkerRegistry();
        const worker = registerWorker(registry, 'worker-1', { hostname: 'node-a' });
        expect(worker.status).toBe('online');
        expect(worker.metadata.hostname).toBe('node-a');
        const updated = recordHeartbeat(registry, 'worker-1');
        expect(updated.lastSeen).toBeGreaterThan(0);
    });
    it('cancels jobs and exposes their cancelled state', () => {
        const registry = new WorkerRegistry();
        cancelBuildJob(registry, 'job-42', 'user requested stop');
        expect(isBuildJobCancelled(registry, 'job-42')).toBe(true);
    });
});
//# sourceMappingURL=build-consumer.test.js.map