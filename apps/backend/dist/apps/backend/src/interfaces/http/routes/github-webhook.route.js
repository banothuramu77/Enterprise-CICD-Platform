import { Router } from 'express';
import { HttpError, loadEnv } from '@enterprise/shared';
import { prisma } from '../../../lib/db.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { processGithubWebhook, retryGithubWebhookEvent } from '../../../application/usecases/process-github-webhook.js';
const env = loadEnv();
const router = Router();
/**
 * @openapi
 * /api/webhooks/github:
 *   post:
 *     summary: Receive GitHub webhook events
 *     parameters:
 *       - in: header
 *         name: X-GitHub-Event
 *         schema:
 *           type: string
 *       - in: header
 *         name: X-GitHub-Delivery
 *         schema:
 *           type: string
 *       - in: header
 *         name: X-Hub-Signature-256
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Webhook accepted
 */
router.post('/', asyncHandler(async (req, res) => {
    const signature = req.get('x-hub-signature-256') ?? req.get('x-hub-signature');
    const deliveryId = req.get('x-github-delivery');
    const eventType = req.get('x-github-event');
    if (!deliveryId || !eventType) {
        throw new HttpError(400, 'GitHub webhook headers are missing', 'GITHUB_WEBHOOK_HEADERS_MISSING');
    }
    const result = await processGithubWebhook(prisma, env, {
        eventType,
        deliveryId,
        payload: req.body,
        signature,
        rawBody: req.rawBody,
    });
    res.status(200).json(result);
}));
/**
 * @openapi
 * /api/webhooks/github/{id}/retry:
 *   post:
 *     summary: Retry a previously failed GitHub webhook event
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Webhook replayed successfully
 */
router.post('/:id/retry', asyncHandler(async (req, res) => {
    const eventId = req.params.id;
    if (typeof eventId !== 'string') {
        throw new HttpError(400, 'Webhook event id is invalid', 'INVALID_WEBHOOK_EVENT_ID');
    }
    const result = await retryGithubWebhookEvent(prisma, env, eventId);
    res.status(200).json(result);
}));
export default router;
//# sourceMappingURL=github-webhook.route.js.map