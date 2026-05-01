export type ErrorCode = 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR';
export declare class AppError extends Error {
    readonly code: ErrorCode;
    readonly statusCode: number;
    readonly field?: string | undefined;
    constructor(code: ErrorCode, message: string, statusCode: number, field?: string | undefined);
    static unauthorized(message?: string): AppError;
    static forbidden(message?: string): AppError;
    static notFound(resource?: string): AppError;
    static conflict(message: string): AppError;
    static validationError(message: string, field?: string): AppError;
    static internal(message?: string): AppError;
}
//# sourceMappingURL=errors.d.ts.map