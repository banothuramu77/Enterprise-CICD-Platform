import { Router } from 'express';
import { HttpError, loadEnv } from '@enterprise/shared';
import { prisma } from '../../../lib/db.js';
import { registerUser } from '../../../application/usecases/register-user.js';
import { loginUser } from '../../../application/usecases/login-user.js';
import { refreshTokens } from '../../../application/usecases/refresh-tokens.js';
import { logoutUser } from '../../../application/usecases/logout-user.js';
import { githubOAuthLogin } from '../../../application/usecases/github-oauth-login.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { loginSchema, registerSchema } from '../schemas/auth.schemas.js';
const env = loadEnv();
const router = Router();
function getCookieOptions() {
    return {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: '/',
    };
}
function clearRefreshCookie(res) {
    res.clearCookie('refreshToken', { path: '/' });
}
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', validateBody(registerSchema), asyncHandler(async (req, res) => {
    const tokens = await registerUser(prisma, env, req.body);
    res.cookie('refreshToken', tokens.refreshToken, getCookieOptions());
    res.status(201).json({ accessToken: tokens.accessToken });
}));
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 */
router.post('/login', validateBody(loginSchema), asyncHandler(async (req, res) => {
    const tokens = await loginUser(prisma, env, req.body);
    res.cookie('refreshToken', tokens.refreshToken, getCookieOptions());
    res.status(200).json({ accessToken: tokens.accessToken });
}));
/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     responses:
 *       200:
 *         description: New access token issued
 */
router.post('/refresh', asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken ?? req.body.refreshToken;
    if (!refreshToken) {
        throw new HttpError(401, 'Refresh token is required', 'AUTH_REFRESH_REQUIRED');
    }
    const tokens = await refreshTokens(prisma, env, refreshToken);
    res.cookie('refreshToken', tokens.refreshToken, getCookieOptions());
    res.status(200).json({ accessToken: tokens.accessToken });
}));
/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Log out a user
 *     responses:
 *       204:
 *         description: User logged out successfully
 */
router.post('/logout', asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken ?? req.body.refreshToken;
    if (refreshToken) {
        await logoutUser(prisma, env, refreshToken);
    }
    clearRefreshCookie(res);
    res.status(204).send();
}));
/**
 * @openapi
 * /api/auth/oauth/github:
 *   get:
 *     summary: Start GitHub OAuth flow
 *     responses:
 *       302:
 *         description: Redirect to GitHub authorization page
 */
router.get('/oauth/github', asyncHandler(async (_req, res) => {
    if (!env.GITHUB_CLIENT_ID) {
        throw new HttpError(500, 'GitHub OAuth is not configured', 'OAUTH_MISCONFIGURED');
    }
    const redirectUrl = new URL('https://github.com/login/oauth/authorize');
    redirectUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
    redirectUrl.searchParams.set('scope', 'read:user user:email');
    redirectUrl.searchParams.set('redirect_uri', env.GITHUB_CALLBACK_URL);
    res.redirect(redirectUrl.toString());
}));
/**
 * @openapi
 * /api/auth/oauth/github/callback:
 *   get:
 *     summary: Handle GitHub OAuth callback
 *     responses:
 *       302:
 *         description: Redirect back to the frontend with an access token
 */
router.get('/oauth/github/callback', asyncHandler(async (req, res) => {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
        throw new HttpError(400, 'GitHub authorization code is missing', 'OAUTH_MISSING_CODE');
    }
    const tokens = await githubOAuthLogin(prisma, env, code);
    res.cookie('refreshToken', tokens.refreshToken, getCookieOptions());
    res.redirect(`${env.FRONTEND_URL}?accessToken=${tokens.accessToken}`);
}));
export default router;
//# sourceMappingURL=auth.route.js.map