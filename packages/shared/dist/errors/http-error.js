export class HttpError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, message, code, details) {
        super(message);
        this.name = 'HttpError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}
export function isHttpError(error) {
    return error instanceof HttpError;
}
//# sourceMappingURL=http-error.js.map