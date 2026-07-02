import { describe, expect, it } from 'vitest';
import { registerUser } from './register-user.js';
import { loginUser } from './login-user.js';
import { refreshTokens } from './refresh-tokens.js';
import { logoutUser } from './logout-user.js';
import { createAccessToken, createRefreshToken, RoleEnum } from '@enterprise/shared';
function createEnv() {
    return {
        NODE_ENV: 'test',
        PORT: 3001,
        DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
        JWT_ACCESS_TOKEN_SECRET: 'test-access-secret-123456',
        JWT_REFRESH_TOKEN_SECRET: 'test-refresh-secret-123456',
        JWT_ACCESS_TOKEN_EXPIRES_IN: '15m',
        JWT_REFRESH_TOKEN_EXPIRES_IN: '7d',
        GITHUB_CLIENT_ID: undefined,
        GITHUB_CLIENT_SECRET: undefined,
        GITHUB_CALLBACK_URL: 'http://localhost:3001/api/auth/oauth/github/callback',
        FRONTEND_URL: 'http://localhost:3000',
    };
}
describe('auth use cases', () => {
    it('registers a user and issues tokens', async () => {
        const env = createEnv();
        const prisma = {
            user: {
                findUnique: async ({ where }) => {
                    if (where.email === 'existing@example.com')
                        return { id: 'u1', role: RoleEnum.USER };
                    return null;
                },
                create: async ({ data }) => ({ id: 'u2', email: data.email, role: RoleEnum.USER }),
            },
            refreshToken: {
                create: async () => undefined,
                deleteMany: async () => undefined,
                findUnique: async () => null,
            },
        };
        const tokens = await registerUser(prisma, env, {
            email: 'new@example.com',
            password: 'supersecret',
            fullName: 'Test User',
        });
        expect(tokens.accessToken).toBeTruthy();
        expect(tokens.refreshToken).toBeTruthy();
    });
    it('logs in an existing user and refreshes tokens', async () => {
        const env = createEnv();
        const prisma = {
            user: {
                findUnique: async ({ where }) => {
                    if (where.email === 'user@example.com') {
                        return {
                            id: 'u3',
                            email: 'user@example.com',
                            passwordHash: '$2a$10$3x2fYLVYva8A0l10lUC7s.2Uisfn9ZQB2VIpFFbC6bLnlM.0XDlLq',
                            role: RoleEnum.USER,
                        };
                    }
                    if (where.id === 'u3') {
                        return {
                            id: 'u3',
                            email: 'user@example.com',
                            role: RoleEnum.USER,
                        };
                    }
                    return null;
                },
            },
            refreshToken: {
                create: async () => undefined,
                deleteMany: async () => undefined,
                findUnique: async () => ({ id: 'rt1', expiresAt: new Date(Date.now() + 1000) }),
            },
        };
        const loginResult = await loginUser(prisma, env, {
            email: 'user@example.com',
            password: 'supersecret',
        });
        expect(loginResult.accessToken).toBeTruthy();
        expect(loginResult.refreshToken).toBeTruthy();
        const refreshed = await refreshTokens(prisma, env, createRefreshToken(env, { sub: 'u3', tokenId: 'rt1' }));
        expect(refreshed.accessToken).toBeTruthy();
        expect(refreshed.refreshToken).toBeTruthy();
        await logoutUser(prisma, env, createRefreshToken(env, { sub: 'u3', tokenId: 'rt1' }));
        expect(createAccessToken(env, { sub: 'u3', role: RoleEnum.USER })).toBeTruthy();
    });
});
//# sourceMappingURL=auth.usecases.test.js.map