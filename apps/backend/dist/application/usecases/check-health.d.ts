import type { PrismaClient } from '@prisma/client';
import type { HealthStatus } from '../../domain/health/health-status.js';
export declare function checkHealth(prisma: PrismaClient): Promise<HealthStatus>;
