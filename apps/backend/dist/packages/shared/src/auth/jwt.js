import * as jwt from 'jsonwebtoken';
export function createAccessToken(env, payload) {
    const secret = env.JWT_ACCESS_TOKEN_SECRET;
    const options = {
        expiresIn: env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    };
    return jwt.sign({ sub: payload.sub, role: payload.role, type: 'access' }, secret, options);
}
export function createRefreshToken(env, payload) {
    const secret = env.JWT_REFRESH_TOKEN_SECRET;
    const options = {
        expiresIn: env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    };
    return jwt.sign({ sub: payload.sub, tokenId: payload.tokenId, type: 'refresh' }, secret, options);
}
export function verifyAccessToken(env, token) {
    return jwt.verify(token, env.JWT_ACCESS_TOKEN_SECRET);
}
export function verifyRefreshToken(env, token) {
    return jwt.verify(token, env.JWT_REFRESH_TOKEN_SECRET);
}
//# sourceMappingURL=jwt.js.map