import { HttpError, type AppEnv, verifyRefreshToken } from '@enterprise/shared';
import type { PrismaClient } from '@prisma/client';

export async function logoutUser(prisma: PrismaClient, env: AppEnv, refreshToken: string) {
  const payload = verifyRefreshToken(env, refreshToken);
  if (payload.type !== 'refresh') {
    throw new HttpError(401, 'Invalid refresh token', 'AUTH_INVALID_TOKEN');
  }

  await prisma.refreshToken.deleteMany({ where: { id: payload.tokenId, userId: payload.sub } });
}
