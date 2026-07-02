import crypto from 'node:crypto';
import { createAccessToken, createRefreshToken } from '@enterprise/shared';
import { parseDuration } from './duration.service.js';
export async function createSessionTokens(prisma, env, userId, role) {
    const tokenId = crypto.randomUUID();
    const refreshToken = createRefreshToken(env, { sub: userId, tokenId });
    const expirationMs = parseDuration(env.JWT_REFRESH_TOKEN_EXPIRES_IN);
    await prisma.refreshToken.create({
        data: {
            id: tokenId,
            userId,
            expiresAt: new Date(Date.now() + expirationMs),
        },
    });
    const accessToken = createAccessToken(env, { sub: userId, role: role });
    return { accessToken, refreshToken };
}
export async function revokeRefreshToken(prisma, tokenId) {
    await prisma.refreshToken.deleteMany({ where: { id: tokenId } });
}
export async function rotateRefreshToken(prisma, env, oldTokenId, userId, role) {
    await revokeRefreshToken(prisma, oldTokenId);
    return createSessionTokens(prisma, env, userId, role);
}
//# sourceMappingURL=token.service.js.map