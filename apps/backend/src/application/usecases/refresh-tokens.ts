import { HttpError, type AppEnv, verifyRefreshToken } from '@enterprise/shared';
import type { PrismaClient } from '@prisma/client';
import { rotateRefreshToken } from '../auth/token.service.js';

export async function refreshTokens(prisma: PrismaClient, env: AppEnv, refreshToken: string) {
  const payload = verifyRefreshToken(env, refreshToken);
  if (payload.type !== 'refresh') {
    throw new HttpError(401, 'Invalid refresh token', 'AUTH_INVALID_TOKEN');
  }

  const storedToken = await prisma.refreshToken.findUnique({ where: { id: payload.tokenId } });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new HttpError(401, 'Refresh token expired or revoked', 'AUTH_TOKEN_EXPIRED');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new HttpError(401, 'User not found for refresh token', 'AUTH_INVALID_TOKEN');
  }

  return rotateRefreshToken(prisma, env, payload.tokenId, user.id, user.role);
}
