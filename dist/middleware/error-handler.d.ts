import { Request, Response, NextFunction } from 'express';
/**
 * Central error handler. Must be registered as the last middleware in the chain.
 * Converts AppError instances to the standard error envelope; all other errors
 * are treated as internal server errors and logged.
 */
export declare function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=error-handler.d.ts.map