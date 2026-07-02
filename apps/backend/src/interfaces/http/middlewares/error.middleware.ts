import type { ErrorRequestHandler, Request, Response } from 'express';
import { isHttpError } from '@enterprise/shared';

export function asyncHandler(handler: (req: Request, res: Response) => Promise<unknown>) {
  return (req: Request, res: Response, next: (error: unknown) => void) => {
    Promise.resolve(handler(req, res)).catch(next);
  };
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (isHttpError(error)) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      message: 'An unexpected error occurred',
      code: 'INTERNAL_SERVER_ERROR',
    },
  });
};
