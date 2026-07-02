import { Router } from 'express';
import { HttpError } from '@enterprise/shared';
import { prisma } from '../../../lib/db.js';
import { requireAuthentication } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { connectRepository } from '../../../application/usecases/connect-repository.js';
import { listRepositories } from '../../../application/usecases/list-repositories.js';
import { getRepositoryBranches } from '../../../application/usecases/get-repository-branches.js';
import { triggerBuild } from '../../../application/usecases/trigger-build.js';
import { connectRepositorySchema, triggerBuildSchema } from '../schemas/repository.schemas.js';

const router = Router();

/**
 * @openapi
 * /api/repositories:
 *   get:
 *     summary: List connected repositories for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Repository list returned successfully
 */
router.get(
  '/',
  requireAuthentication,
  asyncHandler(async (req, res) => {
    const user = req as unknown as { user: { id: string; role: string } };
    const repositories = await listRepositories(prisma, user.user.id, user.user.role === 'ADMIN');
    res.json(repositories);
  }),
);

/**
 * @openapi
 * /api/repositories:
 *   post:
 *     summary: Connect a GitHub repository and store branch metadata
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               owner:
 *                 type: string
 *               repo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Repository connected successfully
 */
router.post(
  '/',
  requireAuthentication,
  validateBody(connectRepositorySchema),
  asyncHandler(async (req, res) => {
    const user = req as unknown as { user: { id: string } };
    const repository = await connectRepository(prisma, user.user.id, req.body.owner, req.body.repo);
    res.status(201).json(repository);
  }),
);

/**
 * @openapi
 * /api/repositories/{id}/branches:
 *   get:
 *     summary: Get branches for a connected repository
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Repository ID
 *     responses:
 *       200:
 *         description: Branch list returned successfully
 */
router.get(
  '/:id/branches',
  requireAuthentication,
  asyncHandler(async (req, res) => {
    const user = req as unknown as { user: { id: string; role: string } };
    const repositoryId = req.params.id;
    if (typeof repositoryId !== 'string') {
      throw new HttpError(400, 'Repository id is invalid', 'INVALID_REPOSITORY_ID');
    }
    const branches = await getRepositoryBranches(prisma, repositoryId, user.user.id, user.user.role === 'ADMIN');
    res.json(branches);
  }),
);

/**
 * @openapi
 * /api/repositories/{id}/builds:
 *   post:
 *     summary: Manually trigger a build for a repository
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Repository ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               branch:
 *                 type: string
 *     responses:
 *       201:
 *         description: Build was queued successfully
 */
router.post(
  '/:id/builds',
  requireAuthentication,
  validateBody(triggerBuildSchema),
  asyncHandler(async (req, res) => {
    const user = req as unknown as { user: { id: string } };
    const repositoryId = req.params.id;
    if (typeof repositoryId !== 'string') {
      throw new HttpError(400, 'Repository id is invalid', 'INVALID_REPOSITORY_ID');
    }
    const branch = typeof req.body.branch === 'string' ? req.body.branch : undefined;
    const workflowRun = await triggerBuild(prisma, user.user.id, repositoryId, branch);
    res.status(201).json(workflowRun);
  }),
);

export default router;
