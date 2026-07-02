import { comparePassword, HttpError, type AppEnv } from '@enterprise/shared';
import type { PrismaClient } from '@prisma/client';
import { createSessionTokens } from '../auth/token.service.js';

export interface LoginInput {
  email: string;
  password: string;
}

export async function loginUser(prisma: PrismaClient, env: AppEnv, input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.passwordHash) {
    throw new HttpError(401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
  }

  const isValid = await comparePassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new HttpError(401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
  }

  return createSessionTokens(prisma, env, user.id, user.role);
}
