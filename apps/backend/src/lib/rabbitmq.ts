import { connect as amqpConnect, type ConsumeMessage } from 'amqplib';
import { loadEnv } from '@enterprise/shared';
import { logger } from './logger.js';

const env = loadEnv();

export const BUILD_QUEUE = 'build-queue';
export const BUILD_DLQ = 'build-dlq';
export const BUILD_QUEUE_RETRY = 'build-retry';

export interface BuildQueuePublisher {
  publishBuildJob(job: unknown): Promise<void>;
}

export async function createRabbitMqConnection() {
  return amqpConnect(env.RABBITMQ_URL);
}

export async function createBuildQueueChannel() {
  const connection = await createRabbitMqConnection();
  const channel = await connection.createChannel();
  await channel.assertQueue(BUILD_QUEUE, { durable: true });
  await channel.assertQueue(BUILD_DLQ, { durable: true });
  await channel.assertQueue(BUILD_QUEUE_RETRY, { durable: true });
  return { connection, channel };
}

export async function publishBuildJob(job: unknown): Promise<void> {
  try {
    const { connection, channel } = await createBuildQueueChannel();
    try {
      channel.sendToQueue(BUILD_QUEUE, Buffer.from(JSON.stringify(job)), { persistent: true });
      logger.info(`Published build job to ${BUILD_QUEUE}`);
    } finally {
      await channel.close();
      await connection.close();
    }
  } catch (error) {
    logger.warn(`Build queue publishing is unavailable: ${error instanceof Error ? error.message : error}`);
  }
}

export async function consumeBuildJobs(handler: (job: unknown) => Promise<void>) {
  const { connection, channel } = await createBuildQueueChannel();
  await channel.prefetch(1);
  await channel.consume(BUILD_QUEUE, async (message: ConsumeMessage | null) => {
    if (!message) {
      return;
    }

    const job = JSON.parse(message.content.toString());
    try {
      await handler(job);
      channel.ack(message);
    } catch (error) {
      logger.error(`Build job failed: ${error instanceof Error ? error.message : error}`);
      channel.nack(message, false, false);
    }
  });

  return { connection, channel };
}

export async function handleBuildJobFailure(
  prisma: { workflowRun: { update: (args: { where: { id: string }; data: { status: string } }) => Promise<unknown> } },
  job: { id: string; repository: string; branch: string; status: string; attempt?: number; maxAttempts?: number },
  error: unknown,
  publisher: { publishBuildJob: (job: unknown) => Promise<void> },
) {
  const attempt = job.attempt ?? 0;
  const maxAttempts = job.maxAttempts ?? 3;
  const nextAttempt = attempt + 1;

  logger.error(`Build job ${job.id} failed: ${error instanceof Error ? error.message : error}`);

  if (nextAttempt < maxAttempts) {
    await prisma.workflowRun.update({
      where: { id: job.id },
      data: { status: 'retrying' },
    });

    await publisher.publishBuildJob({
      ...job,
      attempt: nextAttempt,
      status: 'retrying',
    });

    return { status: 'retrying', attempt: nextAttempt };
  }

  await prisma.workflowRun.update({
    where: { id: job.id },
    data: { status: 'failed' },
  });

  await publisher.publishBuildJob({
    ...job,
    status: 'failed',
    attempt: nextAttempt,
  });

  return { status: 'failed', attempt: nextAttempt };
}
