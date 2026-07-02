import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
export declare function validateBody(schema: ZodSchema): (req: Request, _res: Response, next: NextFunction) => void;
