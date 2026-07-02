import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { checkHealth } from '../../../application/usecases/check-health.js';
const prisma = new PrismaClient();
const router = Router();
router.get('/', async (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'backend' });
});
router.get('/db', async (_req, res) => {
    const health = await checkHealth(prisma);
    res.status(health.database === 'connected' ? 200 : 503).json(health);
});
router.get('/ready', async (_req, res) => {
    const health = await checkHealth(prisma);
    res.status(health.database === 'connected' ? 200 : 503).json(health);
});
export default router;
//# sourceMappingURL=health.route.js.map