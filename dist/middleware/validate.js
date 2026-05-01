"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
const errors_js_1 = require("../domain/errors.js");
/**
 * Returns an Express middleware that validates req.body against a Zod schema.
 * Surfaces the first field-level error as a structured AppError so the
 * error-handler can emit the correct envelope.
 */
function validateBody(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const firstIssue = result.error.issues[0];
            const field = firstIssue?.path.join('.') ?? undefined;
            const message = firstIssue?.message ?? 'Validation error';
            return next(errors_js_1.AppError.validationError(message, field));
        }
        // Overwrite req.body with the parsed (type-safe) value
        req.body = result.data;
        next();
    };
}
//# sourceMappingURL=validate.js.map