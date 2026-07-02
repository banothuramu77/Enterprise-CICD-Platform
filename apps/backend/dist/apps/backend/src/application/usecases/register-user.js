import { HttpError, hashPassword, RoleEnum } from '@enterprise/shared';
import { createSessionTokens } from '../auth/token.service.js';
export async function registerUser(prisma, env, input) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
        throw new HttpError(409, 'Email already registered', 'EMAIL_EXISTS');
    }
    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
        data: {
            email: input.email,
            fullName: input.fullName,
            passwordHash,
            role: RoleEnum.USER,
        },
    });
    return createSessionTokens(prisma, env, user.id, user.role);
}
//# sourceMappingURL=register-user.js.map