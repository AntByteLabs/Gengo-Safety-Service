import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            requestId: string;
        }
    }
}
/**
 * Attaches a request-scoped UUID so every log line and error response
 * is traceable back to a single inbound HTTP request.
 * Respects an upstream X-Request-Id header when present (e.g. from the API gateway).
 */
export declare function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=request-id.d.ts.map