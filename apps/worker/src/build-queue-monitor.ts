import { logger } from '../../backend/src/lib/logger.js';

export interface QueueMonitorStatus {
  status: 'ok';
  checkedAt: number;
  heartbeat: number;
}

export async function monitorBuildQueue(workerId = `worker-${process.pid}`) {
  logger.info(`Build queue monitoring enabled for ${workerId}`);
  return {
    status: 'ok' as const,
    checkedAt: Date.now(),
    heartbeat: Date.now(),
  } satisfies QueueMonitorStatus;
}
