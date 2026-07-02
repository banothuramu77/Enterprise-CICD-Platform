import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '@enterprise/shared';
import type { AuthenticatedRequest } from './auth.middleware.js';

export function requireRole(requiredRole: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = (req as AuthenticatedRequest).user?.role;

    if (!userRole) {
      throw new HttpError(403, 'Role required to access this route', 'ROLE_REQUIRED');
    }

    if (userRole !== requiredRole) {
      throw new HttpError(403, 'Insufficient permissions', 'FORBIDDEN');
    }

    next();
  };
}
