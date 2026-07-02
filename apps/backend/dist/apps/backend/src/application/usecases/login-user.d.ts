import { type AppEnv } from '@enterprise/shared';
import type { PrismaClient } from '@prisma/client';
export interface LoginInput {
    email: string;
    password: string;
}
export declare function loginUser(prisma: PrismaClient, env: AppEnv, input: LoginInput): Promise<import("../auth/token.service.js").SessionTokens>;
