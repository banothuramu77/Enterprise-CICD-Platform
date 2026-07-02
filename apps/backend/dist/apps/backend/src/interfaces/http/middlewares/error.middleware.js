import { isHttpError } from '@enterprise/shared';
export function asyncHandler(handler) {
    return (req, res, next) => {
        Promise.resolve(handler(req, res)).catch(next);
    };
}
export const errorHandler = (error, _req, res, _next) => {
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
//# sourceMappingURL=error.middleware.js.map