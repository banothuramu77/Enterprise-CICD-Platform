import { type AppEnv } from '@enterprise/shared';
import type { PrismaClient } from '@prisma/client';
export interface RegisterInput {
    email: string;
    password: string;
    fullName: string;
}
export declare function registerUser(prisma: PrismaClient, env: AppEnv, input: RegisterInput): Promise<import("../auth/token.service.js").SessionTokens>;
