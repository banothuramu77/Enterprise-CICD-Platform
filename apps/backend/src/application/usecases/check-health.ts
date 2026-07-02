import type { PrismaClient } from '@prisma/client';
import type { HealthStatus } from '../../domain/health/health-status.js';

export async function checkHealth(prisma: PrismaClient): Promise<HealthStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      service: 'backend',
      timestamp: new Date().toISOString(),
      database: 'connected',
    };
  } catch {
    return {
      status: 'degraded',
      service: 'backend',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    };
  }
}
