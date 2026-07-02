import crypto from 'node:crypto';
import type { PrismaClient } from '@prisma/client';
import { createAccessToken, createRefreshToken, type AppEnv } from '@enterprise/shared';
import { parseDuration } from './duration.service.js';

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

export async function createSessionTokens(
  prisma: PrismaClient,
  env: AppEnv,
  userId: string,
  role: string,
): Promise<SessionTokens> {
  const tokenId = crypto.randomUUID();
  const refreshToken = createRefreshToken(env, { sub: userId, tokenId });
  const expirationMs = parseDuration(env.JWT_REFRESH_TOKEN_EXPIRES_IN);

  await prisma.refreshToken.create({
    data: {
      id: tokenId,
      userId,
      expiresAt: new Date(Date.now() + expirationMs),
    },
  });

  const accessToken = createAccessToken(env, { sub: userId, role: role as any });

  return { accessToken, refreshToken };
}

export async function revokeRefreshToken(prisma: PrismaClient, tokenId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { id: tokenId } });
}

export async function rotateRefreshToken(
  prisma: PrismaClient,
  env: AppEnv,
  oldTokenId: string,
  userId: string,
  role: string,
): Promise<SessionTokens> {
  await revokeRefreshToken(prisma, oldTokenId);
  return createSessionTokens(prisma, env, userId, role);
}
