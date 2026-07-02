import { logger } from '../../backend/src/lib/logger.js';
export async function monitorBuildQueue(workerId = `worker-${process.pid}`) {
    logger.info(`Build queue monitoring enabled for ${workerId}`);
    return {
        status: 'ok',
        checkedAt: Date.now(),
        heartbeat: Date.now(),
    };
}
//# sourceMappingURL=build-queue-monitor.js.map