import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
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
export function requestIdMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  req.requestId = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
  next();
}
