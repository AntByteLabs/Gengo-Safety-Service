"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    code;
    statusCode;
    field;
    constructor(code, message, statusCode, field) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.field = field;
        this.name = 'AppError';
        // Maintain proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, AppError.prototype);
    }
    static unauthorized(message = 'Missing or invalid token') {
        return new AppError('UNAUTHORIZED', message, 401);
    }
    static forbidden(message = 'Forbidden') {
        return new AppError('FORBIDDEN', message, 403);
    }
    static notFound(resource = 'Resource') {
        return new AppError('NOT_FOUND', `${resource} not found`, 404);
    }
    static conflict(message) {
        return new AppError('CONFLICT', message, 409);
    }
    static validationError(message, field) {
        return new AppError('VALIDATION_ERROR', message, 400, field);
    }
    static internal(message = 'Internal server error') {
        return new AppError('INTERNAL_ERROR', message, 500);
    }
}
exports.AppError = AppError;
//# sourceMappingURL=errors.js.map