import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
/**
 * Returns an Express middleware that validates req.body against a Zod schema.
 * Surfaces the first field-level error as a structured AppError so the
 * error-handler can emit the correct envelope.
 */
export declare function validateBody<T>(schema: ZodSchema<T>): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.d.ts.map