import { HttpError, loadEnv, verifyAccessToken } from '@enterprise/shared';
const env = loadEnv();
export function requireAuthentication(req, _res, next) {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
        throw new HttpError(401, 'Missing or invalid authorization header', 'AUTH_REQUIRED');
    }
    const token = authorization.slice(7);
    try {
        const payload = verifyAccessToken(env, token);
        req.user = { id: payload.sub, role: payload.role };
        next();
    }
    catch (error) {
        throw new HttpError(401, 'Invalid access token', 'AUTH_INVALID_TOKEN', error);
    }
}
//# sourceMappingURL=auth.middleware.js.map