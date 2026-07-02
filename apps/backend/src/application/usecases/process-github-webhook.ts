import { createHmac, timingSafeEqual } from 'crypto';
import { HttpError, type AppEnv } from '@enterprise/shared';
import type { PrismaClient } from '@prisma/client';
import { logger } from '../../lib/logger.js';
import { enqueueBuildJob } from './enqueue-build-job.js';
import { publishBuildJob } from '../../lib/rabbitmq.js';

export interface GithubWebhookInput {
  eventType: string;
  deliveryId: string;
  payload: unknown;
  signature?: string;
  rawBody?: Buffer | string;
  isRetry?: boolean;
}

export interface GithubWebhookResult {
  status: 'processed' | 'duplicate' | 'ignored' | 'failed';
  eventId?: string;
  workflowRunId?: string;
  message: string;
}

export function verifyGithubSignature(body: Buffer | string, signature: string | undefined, secret: string): boolean {
  if (!secret || !signature) {
    return false;
  }

  const expected = createHmac('sha256', secret).update(body).digest('hex');
  const provided = signature.startsWith('sha256=') ? signature.slice(7) : signature;

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  } catch {
    return false;
  }
}

function getBodyBuffer(rawBody: Buffer | string | undefined, payload: unknown): Buffer {
  if (Buffer.isBuffer(rawBody)) {
    return rawBody;
  }

  if (typeof rawBody === 'string') {
    return Buffer.from(rawBody);
  }

  return Buffer.from(JSON.stringify(payload ?? {}));
}

function getPayloadString(payload: unknown): string {
  if (typeof payload === 'string') {
    return payload;
  }

  return JSON.stringify(payload ?? {});
}

function getBranchFromPush(payload: Record<string, unknown>): string | undefined {
  const ref = typeof payload.ref === 'string' ? payload.ref : undefined;
  if (!ref) {
    return undefined;
  }

  return ref.replace(/^refs\/heads\//, '');
}

function getBranchFromPullRequest(payload: Record<string, unknown>): string | undefined {
  const pullRequest = payload.pull_request as Record<string, unknown> | undefined;
  const head = pullRequest?.head as Record<string, unknown> | undefined;
  const ref = typeof head?.ref === 'string' ? head.ref : undefined;
  return ref;
}

async function createWorkflowRunForEvent(prisma: PrismaClient, eventType: string, payload: unknown) {
  const payloadRecord = (payload ?? {}) as Record<string, unknown>;
  const repositoryPayload = payloadRecord.repository as Record<string, unknown> | undefined;
  const fullName =
    (typeof repositoryPayload?.full_name === 'string' && repositoryPayload.full_name) ||
    (typeof repositoryPayload?.name === 'string' && repositoryPayload.name) ||
    'unknown/repository';

  let branch: string | undefined;
  if (eventType === 'push') {
    branch = getBranchFromPush(payloadRecord);
  } else if (eventType === 'pull_request') {
    branch = getBranchFromPullRequest(payloadRecord);
  }

  if (!branch) {
    return undefined;
  }

  const workflowRun = await prisma.workflowRun.create({
    data: {
      repository: fullName,
      branch,
      status: 'queued',
    },
  });

  await enqueueBuildJob(prisma, { publishBuildJob }, {
    id: workflowRun.id,
    repository: fullName,
    branch,
    status: workflowRun.status,
  });

  return workflowRun;
}

export async function processGithubWebhook(
  prisma: PrismaClient,
  env: AppEnv,
  input: GithubWebhookInput,
): Promise<GithubWebhookResult> {
  if (!env.GITHUB_WEBHOOK_SECRET) {
    throw new HttpError(500, 'GitHub webhook secret is not configured', 'GITHUB_WEBHOOK_SECRET_MISSING');
  }

  const bodyBuffer = getBodyBuffer(input.rawBody, input.payload);
  if (!verifyGithubSignature(bodyBuffer, input.signature, env.GITHUB_WEBHOOK_SECRET)) {
    throw new HttpError(401, 'GitHub webhook signature is invalid', 'GITHUB_WEBHOOK_SIGNATURE_INVALID');
  }

  const existingEvent = await prisma.webhookEvent.findUnique({ where: { deliveryId: input.deliveryId } });
  if (existingEvent && !input.isRetry) {
    logger.warn(`Duplicate GitHub delivery ${input.deliveryId}`);
    return {
      status: 'duplicate',
      eventId: existingEvent.id,
      message: 'Duplicate webhook delivery ignored',
    };
  }

  const payloadString = getPayloadString(input.payload);
  const event =
    (existingEvent
      ? await prisma.webhookEvent.update({
          where: { id: existingEvent.id },
          data: {
            payload: payloadString,
            rawPayload: bodyBuffer.toString('utf8'),
            signature: input.signature ?? null,
            status: 'processing',
            attempts: (existingEvent.attempts ?? 0) + 1,
            lastError: null,
          },
        })
      : await prisma.webhookEvent.create({
          data: {
            provider: 'github',
            eventType: input.eventType,
            deliveryId: input.deliveryId,
            payload: payloadString,
            rawPayload: bodyBuffer.toString('utf8'),
            signature: input.signature ?? null,
            status: 'processing',
            attempts: 1,
          },
        })) ?? existingEvent;

  try {
    logger.info(`Processing GitHub webhook ${input.eventType} ${input.deliveryId}`);
    let workflowRun;
    if (input.eventType === 'push' || input.eventType === 'pull_request') {
      workflowRun = await createWorkflowRunForEvent(prisma, input.eventType, input.payload);
    } else {
      logger.warn(`Unhandled GitHub event type ${input.eventType}`);
    }

    await prisma.webhookEvent.update({
      where: { id: event.id },
      data: {
        status: workflowRun ? 'processed' : 'ignored',
        lastError: null,
      },
    });

    return {
      status: workflowRun ? 'processed' : 'ignored',
      eventId: event.id,
      workflowRunId: workflowRun?.id,
      message: workflowRun ? 'Webhook processed and build queued' : 'Webhook processed without a build trigger',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`GitHub webhook processing failed for ${input.deliveryId}: ${errorMessage}`);
    await prisma.webhookEvent.update({
      where: { id: event.id },
      data: {
        status: 'failed',
        lastError: errorMessage,
      },
    });
    throw new HttpError(500, 'GitHub webhook processing failed', 'GITHUB_WEBHOOK_PROCESSING_FAILED', error);
  }
}

export async function retryGithubWebhookEvent(prisma: PrismaClient, env: AppEnv, eventId: string): Promise<GithubWebhookResult> {
  const event = await prisma.webhookEvent.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new HttpError(404, 'Webhook event not found', 'WEBHOOK_EVENT_NOT_FOUND');
  }

  const parsedPayload = JSON.parse(event.payload ?? '{}');
  return processGithubWebhook(prisma, env, {
    eventType: event.eventType,
    deliveryId: event.deliveryId,
    payload: parsedPayload,
    rawBody: event.rawPayload ?? JSON.stringify(parsedPayload),
    signature: event.signature ?? undefined,
    isRetry: true,
  });
}
