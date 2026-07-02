import { type AppEnv } from '@enterprise/shared';
import type { PrismaClient } from '@prisma/client';
export declare function refreshTokens(prisma: PrismaClient, env: AppEnv, refreshToken: string): Promise<import("../auth/token.service.js").SessionTokens>;
