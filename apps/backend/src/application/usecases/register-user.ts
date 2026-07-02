import { HttpError, hashPassword, RoleEnum, type AppEnv } from '@enterprise/shared';
import type { PrismaClient } from '@prisma/client';
import { createSessionTokens } from '../auth/token.service.js';

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
}

export async function registerUser(prisma: PrismaClient, env: AppEnv, input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new HttpError(409, 'Email already registered', 'EMAIL_EXISTS');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      fullName: input.fullName,
      passwordHash,
      role: RoleEnum.USER,
    },
  });

  return createSessionTokens(prisma, env, user.id, user.role);
}
