import { HttpError, verifyRefreshToken } from '@enterprise/shared';
export async function logoutUser(prisma, env, refreshToken) {
    const payload = verifyRefreshToken(env, refreshToken);
    if (payload.type !== 'refresh') {
        throw new HttpError(401, 'Invalid refresh token', 'AUTH_INVALID_TOKEN');
    }
    await prisma.refreshToken.deleteMany({ where: { id: payload.tokenId, userId: payload.sub } });
}
//# sourceMappingURL=logout-user.js.map