export declare class HttpError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown;
    constructor(statusCode: number, message: string, code: string, details?: unknown);
}
export declare function isHttpError(error: unknown): error is HttpError;
