import { type AppEnv } from '@enterprise/shared';
import type { PrismaClient } from '@prisma/client';
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
export declare function verifyGithubSignature(body: Buffer | string, signature: string | undefined, secret: string): boolean;
export declare function processGithubWebhook(prisma: PrismaClient, env: AppEnv, input: GithubWebhookInput): Promise<GithubWebhookResult>;
export declare function retryGithubWebhookEvent(prisma: PrismaClient, env: AppEnv, eventId: string): Promise<GithubWebhookResult>;
