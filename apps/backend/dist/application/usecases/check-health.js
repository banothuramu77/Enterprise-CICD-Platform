export async function checkHealth(prisma) {
    try {
        await prisma.$queryRaw `SELECT 1`;
        return {
            status: 'ok',
            service: 'backend',
            timestamp: new Date().toISOString(),
            database: 'connected',
        };
    }
    catch {
        return {
            status: 'degraded',
            service: 'backend',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
        };
    }
}
//# sourceMappingURL=check-health.js.map