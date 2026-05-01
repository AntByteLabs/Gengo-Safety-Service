import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            userId: string;
        }
    }
}
/**
 * Validates the JWT in the Authorization header and attaches userId to the request.
 *
 * Dual-mode: if the API gateway forwards an X-User-Id header with a valid usr_ prefix,
 * that is trusted directly without re-verifying the JWT.
 */
export declare function authMiddleware(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map