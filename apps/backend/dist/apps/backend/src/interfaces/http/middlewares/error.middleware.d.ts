import type { ErrorRequestHandler, Request, Response } from 'express';
export declare function asyncHandler(handler: (req: Request, res: Response) => Promise<unknown>): (req: Request, res: Response, next: (error: unknown) => void) => void;
export declare const errorHandler: ErrorRequestHandler;
