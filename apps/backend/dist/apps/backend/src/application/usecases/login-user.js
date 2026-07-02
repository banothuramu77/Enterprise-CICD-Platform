import { comparePassword, HttpError } from '@enterprise/shared';
import { createSessionTokens } from '../auth/token.service.js';
export async function loginUser(prisma, env, input) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.passwordHash) {
        throw new HttpError(401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
    }
    const isValid = await comparePassword(input.password, user.passwordHash);
    if (!isValid) {
        throw new HttpError(401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
    }
    return createSessionTokens(prisma, env, user.id, user.role);
}
//# sourceMappingURL=login-user.js.map