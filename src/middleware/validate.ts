import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';
import { AppError } from '../domain/errors.js';

/**
 * Returns an Express middleware that validates req.body against a Zod schema.
 * Surfaces the first field-level error as a structured AppError so the
 * error-handler can emit the correct envelope.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstIssue = (result.error as ZodError).issues[0];
      const field = firstIssue?.path.join('.') ?? undefined;
      const message = firstIssue?.message ?? 'Validation error';
      return next(
        AppError.validationError(message, field),
      );
    }
    // Overwrite req.body with the parsed (type-safe) value
    req.body = result.data;
    next();
  };
}
