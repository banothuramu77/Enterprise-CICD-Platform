import { Router } from 'express';
import { requireAuthentication } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
const router = Router();
/**
 * @openapi
 * /api/users/me:
 *   get:
 *     summary: Retrieve the current authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user profile
 */
router.get('/me', requireAuthentication, (req, res) => {
    const user = req.user;
    res.json({ id: user.id, role: user.role });
});
/**
 * @openapi
 * /api/users/admin:
 *   get:
 *     summary: Admin-only access example
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin access granted
 */
router.get('/admin', requireAuthentication, requireRole('ADMIN'), (_req, res) => {
    res.json({ message: 'Admin-only access granted' });
});
export default router;
//# sourceMappingURL=user.route.js.map