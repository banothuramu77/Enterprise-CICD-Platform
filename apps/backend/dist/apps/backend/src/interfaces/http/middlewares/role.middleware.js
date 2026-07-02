import { HttpError } from '@enterprise/shared';
export function requireRole(requiredRole) {
    return (req, _res, next) => {
        const userRole = req.user?.role;
        if (!userRole) {
            throw new HttpError(403, 'Role required to access this route', 'ROLE_REQUIRED');
        }
        if (userRole !== requiredRole) {
            throw new HttpError(403, 'Insufficient permissions', 'FORBIDDEN');
        }
        next();
    };
}
//# sourceMappingURL=role.middleware.js.map