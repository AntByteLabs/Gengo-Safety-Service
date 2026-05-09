import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            userId: string;
        }
    }
}
/**
 * Validates the caller and attaches userId to the request.
 *
 * Authentication paths (in order of preference):
 *   1. Bearer JWT in Authorization — primary auth, always honoured.
 *   2. X-User-Id from a *trusted internal peer*. The header alone is NEVER
 *      sufficient — it must come from a trusted CIDR or carry a valid
 *      X-Internal-Auth HMAC. Fixes the audit finding where any direct caller
 *      could SOS-as-anyone by setting X-User-Id.
 */
export declare function authMiddleware(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map