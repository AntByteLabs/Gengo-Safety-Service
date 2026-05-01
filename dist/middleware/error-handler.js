"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errors_js_1 = require("../domain/errors.js");
/**
 * Central error handler. Must be registered as the last middleware in the chain.
 * Converts AppError instances to the standard error envelope; all other errors
 * are treated as internal server errors and logged.
 */
function errorHandler(err, req, res, _next) {
    const requestId = req.requestId ?? 'unknown';
    const ts = Date.now();
    if (err instanceof errors_js_1.AppError) {
        const body = {
            success: false,
            error: {
                code: err.code,
                message: err.message,
                ...(err.field !== undefined ? { field: err.field } : {}),
            },
            meta: { requestId, ts },
        };
        res.status(err.statusCode).json(body);
        return;
    }
    console.error('[error-handler] Unhandled error:', err);
    const body = {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
        meta: { requestId, ts },
    };
    res.status(500).json(body);
}
//# sourceMappingURL=error-handler.js.map