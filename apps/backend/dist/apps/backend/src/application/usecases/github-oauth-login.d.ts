import { type AppEnv } from '@enterprise/shared';
import type { PrismaClient } from '@prisma/client';
export declare function githubOAuthLogin(prisma: PrismaClient, env: AppEnv, code: string): Promise<import("../auth/token.service.js").SessionTokens>;
