import { HttpError } from '@enterprise/shared';
export function validateBody(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            throw new HttpError(400, 'Validation failed', 'VALIDATION_FAILED', result.error.flatten());
        }
        req.body = result.data;
        next();
    };
}
//# sourceMappingURL=validate.middleware.js.map