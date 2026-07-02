import type { PrismaClient } from '@prisma/client';
import { type AppEnv } from '@enterprise/shared';
export interface SessionTokens {
    accessToken: string;
    refreshToken: string;
}
export declare function createSessionTokens(prisma: PrismaClient, env: AppEnv, userId: string, role: string): Promise<SessionTokens>;
export declare function revokeRefreshToken(prisma: PrismaClient, tokenId: string): Promise<void>;
export declare function rotateRefreshToken(prisma: PrismaClient, env: AppEnv, oldTokenId: string, userId: string, role: string): Promise<SessionTokens>;
