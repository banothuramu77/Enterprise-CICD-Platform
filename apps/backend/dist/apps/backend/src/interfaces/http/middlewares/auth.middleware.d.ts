import type { NextFunction, Request, Response } from 'express';
export interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        role: string;
    };
}
export declare function requireAuthentication(req: Request, _res: Response, next: NextFunction): void;
