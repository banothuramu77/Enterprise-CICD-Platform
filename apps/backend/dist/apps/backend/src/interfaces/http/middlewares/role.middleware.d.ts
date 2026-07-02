import type { NextFunction, Request, Response } from 'express';
export declare function requireRole(requiredRole: string): (req: Request, _res: Response, next: NextFunction) => void;
