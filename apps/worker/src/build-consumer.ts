import { loadEnv } from '@enterprise/shared';
import { createBuildQueueChannel, BUILD_QUEUE, BUILD_DLQ, BUILD_QUEUE_RETRY } from '../../backend/src/lib/rabbitmq.js';
import { logger } from '../../backend/src/lib/logger.js';
import { executeDockerBuild } from './docker-build-executor.js';

const env = loadEnv();

export interface WorkerMetadata {
  hostname?: string;
  pid?: number;
  startedAt?: number;
}

export interface WorkerRecord {
  id: string;
  status: 'online' | 'offline';
  lastSeen: number;
  metadata: WorkerMetadata;
}

export interface BuildJobCancellation {
  jobId: string;
  reason: string;
  cancelledAt: number;
}

export class WorkerRegistry {
  private workers = new Map<string, WorkerRecord>();
  private cancellations = new Map<string, BuildJobCancellation>();

  register(workerId: string, metadata: WorkerMetadata = {}): WorkerRecord {
    const worker: WorkerRecord = {
      id: workerId,
      status: 'online',
      lastSeen: Date.now(),
      metadata,
    };
    this.workers.set(workerId, worker);
    return worker;
  }

  heartbeat(workerId: string): WorkerRecord | undefined {
    const worker = this.workers.get(workerId);
    if (!worker) {
      return undefined;
    }
    worker.lastSeen = Date.now();
    return worker;
  }

  cancelJob(jobId: string, reason: string): BuildJobCancellation {
    const cancellation: BuildJobCancellation = {
      jobId,
      reason,
      cancelledAt: Date.now(),
    };
    this.cancellations.set(jobId, cancellation);
    return cancellation;
  }

  isCancelled(jobId: string): boolean {
    return this.cancellations.has(jobId);
  }

  getWorker(workerId: string): WorkerRecord | undefined {
    return this.workers.get(workerId);
  }
}

export function registerWorker(registry: WorkerRegistry, workerId: string, metadata: WorkerMetadata = {}) {
  return registry.register(workerId, metadata);
}

export function recordHeartbeat(registry: WorkerRegistry, workerId: string) {
  const heartbeat = registry.heartbeat(workerId);
  if (!heartbeat) {
    throw new Error(`Unknown worker ${workerId}`);
  }
  return heartbeat;
}

export function cancelBuildJob(registry: WorkerRegistry, jobId: string, reason: string) {
  return registry.cancelJob(jobId, reason);
}

export function isBuildJobCancelled(registry: WorkerRegistry, jobId: string) {
  return registry.isCancelled(jobId);
}

async function handleJobExecution(channel: any, message: any, registry: WorkerRegistry, workerId: string, job: any) {
  if (isBuildJobCancelled(registry, job.id)) {
    logger.warn(`Worker ${workerId} skipped cancelled build job ${job.id}`);
    channel.ack(message);
    return;
  }

  logger.info(`Worker ${workerId} received build job ${job.id}`);
  registerWorker(registry, workerId, { hostname: env.NODE_ENV, pid: process.pid });
  recordHeartbeat(registry, workerId);

  const attempt = job.attempt ?? 0;
  const maxAttempts = job.maxAttempts ?? 3;

  try {
    if (attempt >= maxAttempts) {
      throw new Error('Maximum attempts exceeded');
    }

    const result = await executeDockerBuild({
      id: job.id,
      repoUrl: job.repositoryUrl ?? 'https://example.com/repo.git',
      commands: job.commands ?? ['npm run build'],
      image: job.image ?? 'node:20',
      artifactPaths: job.artifactPaths ?? ['dist'],
      timeoutMs: job.timeoutMs ?? 600000,
    });

    if (!result.success) {
      throw new Error(result.timedOut ? 'Docker build timed out' : result.stderr || 'Docker build failed');
    }

    logger.info(`Worker ${workerId} completed build job ${job.id}`);
    channel.ack(message);
  } catch (error) {
    logger.error(`Worker ${workerId} failed for ${job.id}: ${error instanceof Error ? error.message : error}`);
    channel.nack(message, false, false);
  }
}

export async function startBuildConsumer(workerId = `worker-${process.pid}`) {
  const registry = new WorkerRegistry();
  registerWorker(registry, workerId, { hostname: env.NODE_ENV, pid: process.pid });

  const { channel, connection } = await createBuildQueueChannel();
  await channel.assertExchange('build-exchange', 'direct', { durable: true });
  await channel.bindQueue(BUILD_QUEUE, 'build-exchange', 'build');
  await channel.bindQueue(BUILD_DLQ, 'build-exchange', 'build-dlq');
  await channel.bindQueue(BUILD_QUEUE_RETRY, 'build-exchange', 'build-retry');

  await channel.prefetch(1);
  await channel.consume(BUILD_QUEUE, async (message: any) => {
    if (!message) {
      return;
    }

    const job = JSON.parse(message.content.toString());
    await handleJobExecution(channel, message, registry, workerId, job);
  });

  logger.info(`Worker ${workerId} listening on RabbitMQ ${env.RABBITMQ_URL}`);
  return { channel, connection, registry, workerId };
}
