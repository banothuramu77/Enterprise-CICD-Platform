import { createHmac } from 'crypto';
import { describe, expect, it, vi } from 'vitest';
import { HttpError } from '@enterprise/shared';
import { processGithubWebhook, retryGithubWebhookEvent, verifyGithubSignature } from './process-github-webhook.js';

function createEnv() {
  return {
    GITHUB_WEBHOOK_SECRET: 'super-secret',
  } as any;
}

function createSignature(body: Buffer, secret: string) {
  return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}

describe('github webhook use cases', () => {
  it('verifies a valid GitHub signature and rejects invalid signatures', () => {
    const body = Buffer.from(JSON.stringify({ zen: 'test' }));
    const signature = createSignature(body, 'super-secret');

    expect(verifyGithubSignature(body, signature, 'super-secret')).toBe(true);
    expect(verifyGithubSignature(body, 'sha256=bad', 'super-secret')).toBe(false);
  });

  it('stores webhook events and creates a workflow run for push events', async () => {
    const body = Buffer.from(JSON.stringify({ ref: 'refs/heads/main', repository: { full_name: 'octo/demo' } }));
    const signature = createSignature(body, 'super-secret');
    const prisma = {
      webhookEvent: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'evt-1', deliveryId: 'delivery-1', status: 'processing', attempts: 1 }),
        update: vi.fn().mockResolvedValue(undefined),
      },
      repository: {
        findUnique: vi.fn().mockResolvedValue({ id: 'repo-1', ownerId: 'user-1', fullName: 'octo/demo', branches: [{ name: 'main' }] }),
      },
      workflowRun: {
        create: vi.fn().mockResolvedValue({ id: 'run-1' }),
      },
    } as any;

    const result = await processGithubWebhook(prisma, createEnv(), {
      eventType: 'push',
      deliveryId: 'delivery-1',
      payload: { ref: 'refs/heads/main', repository: { full_name: 'octo/demo' } },
      rawBody: body,
      signature,
    });

    expect(result.status).toBe('processed');
    expect(prisma.workflowRun.create).toHaveBeenCalled();
  });

  it('handles duplicate deliveries without creating another build', async () => {
    const body = Buffer.from(JSON.stringify({ ref: 'refs/heads/main' }));
    const signature = createSignature(body, 'super-secret');
    const prisma = {
      webhookEvent: {
        findUnique: vi.fn().mockResolvedValue({ id: 'evt-1', deliveryId: 'delivery-2', status: 'processed' }),
      },
      workflowRun: {
        create: vi.fn(),
      },
    } as any;

    const result = await processGithubWebhook(prisma, createEnv(), {
      eventType: 'push',
      deliveryId: 'delivery-2',
      payload: { ref: 'refs/heads/main' },
      rawBody: body,
      signature,
    });

    expect(result.status).toBe('duplicate');
    expect(prisma.workflowRun.create).not.toHaveBeenCalled();
  });

  it('retries a failed webhook event', async () => {
    const body = Buffer.from(JSON.stringify({ action: 'opened', pull_request: { head: { ref: 'feature' } }, repository: { full_name: 'octo/demo' } }));
    const signature = createSignature(body, 'super-secret');
    const prisma = {
      webhookEvent: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'evt-2',
          deliveryId: 'delivery-3',
          eventType: 'pull_request',
          status: 'failed',
          payload: JSON.stringify({ action: 'opened', pull_request: { head: { ref: 'feature' } }, repository: { full_name: 'octo/demo' } }),
          attempts: 1,
          signature,
          rawPayload: body.toString('utf8'),
        }),
        update: vi.fn().mockResolvedValue(undefined),
      },
      repository: {
        findUnique: vi.fn().mockResolvedValue({ id: 'repo-1', ownerId: 'user-1', fullName: 'octo/demo', branches: [{ name: 'feature' }] }),
      },
      workflowRun: {
        create: vi.fn().mockResolvedValue({ id: 'run-2' }),
      },
    } as any;

    const result = await retryGithubWebhookEvent(prisma, createEnv(), 'evt-2');

    expect(result.status).toBe('processed');
    expect(prisma.workflowRun.create).toHaveBeenCalled();
  });

  it('throws when the webhook is missing a secret configuration', async () => {
    const prisma = {
      webhookEvent: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    } as any;

    await expect(processGithubWebhook(prisma, { GITHUB_WEBHOOK_SECRET: '' } as any, {
      eventType: 'push',
      deliveryId: 'delivery-4',
      payload: {},
      rawBody: Buffer.from('{}'),
      signature: 'sha256=abc',
    })).rejects.toBeInstanceOf(HttpError);
  });
});
