import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '@enterprise/shared';
import type { ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new HttpError(400, 'Validation failed', 'VALIDATION_FAILED', result.error.flatten());
    }

    req.body = result.data;
    next();
  };
}
