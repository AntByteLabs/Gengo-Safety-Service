import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { AppError } from '../domain/errors.js';
import { JwtPayload } from '../domain/types.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
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
export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    // Trust API Gateway header first (avoids double JWT verification in the mesh)
    const gatewayUserId = req.headers['x-user-id'];
    if (typeof gatewayUserId === 'string' && gatewayUserId.startsWith('usr_')) {
      req.userId = gatewayUserId;
      return next();
    }

    // Fall back to local JWT verification
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(AppError.unauthorized('Missing Bearer token'));
    }

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

    if (!payload.sub || !payload.sub.startsWith('usr_')) {
      return next(AppError.unauthorized('Token sub is not a valid user id'));
    }

    req.userId = payload.sub;
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired token'));
  }
}
