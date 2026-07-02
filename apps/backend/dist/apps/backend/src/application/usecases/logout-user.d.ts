import { type AppEnv } from '@enterprise/shared';
import type { PrismaClient } from '@prisma/client';
export declare function logoutUser(prisma: PrismaClient, env: AppEnv, refreshToken: string): Promise<void>;
