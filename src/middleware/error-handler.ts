import { Request, Response, NextFunction } from 'express';
import { AppError } from '../domain/errors.js';

interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
  };
  meta: {
    requestId: string;
    ts: number;
  };
}

/**
 * Central error handler. Must be registered as the last middleware in the chain.
 * Converts AppError instances to the standard error envelope; all other errors
 * are treated as internal server errors and logged.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = req.requestId ?? 'unknown';
  const ts = Date.now();

  if (err instanceof AppError) {
    const body: ErrorEnvelope = {
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
  const body: ErrorEnvelope = {
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    meta: { requestId, ts },
  };
  res.status(500).json(body);
}
