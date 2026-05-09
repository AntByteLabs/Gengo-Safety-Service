import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { AppError } from '../domain/errors.js';
import { JwtPayload } from '../domain/types.js';
import {
  parseCidrList,
  isAddressInCidrList,
  verifyInternalAuthHmac,
} from './internal-trust.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

// Pre-parse the trusted CIDR list once at module load.
const TRUSTED_CIDRS = parseCidrList(config.INTERNAL_TRUSTED_CIDRS);

/**
 * Returns the immediate-peer address. We deliberately use socket.remoteAddress
 * (NOT req.ip) here because trust-proxy resolution can be spoofed via
 * X-Forwarded-For — and the whole point of the CIDR check is "is the actual
 * TCP peer one of our trusted internal hops".
 */
function getPeerAddress(req: Request): string | undefined {
  return req.socket?.remoteAddress;
}

/**
 * Returns true if this request is allowed to assert identity via X-User-Id.
 * Two independent paths, either of which is sufficient:
 *   (a) immediate TCP peer is in INTERNAL_TRUSTED_CIDRS, OR
 *   (b) X-Internal-Auth is a valid HMAC-SHA256 of X-User-Id under
 *       INTERNAL_AUTH_SECRET.
 *
 * Default-deny: if neither configured nor matching, the header is ignored.
 */
function isInternalRequestTrusted(req: Request, userId: string): boolean {
  // Path (a): trusted CIDR
  if (TRUSTED_CIDRS.length > 0) {
    const peer = getPeerAddress(req);
    if (isAddressInCidrList(peer, TRUSTED_CIDRS)) return true;
  }

  // Path (b): HMAC
  const secret = config.INTERNAL_AUTH_SECRET;
  if (secret) {
    const sig = req.headers['x-internal-auth'];
    if (typeof sig === 'string' && verifyInternalAuthHmac(secret, userId, sig)) {
      return true;
    }
  }

  return false;
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
export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    // ── 1. Primary: JWT ───────────────────────────────────────────────────────
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

      if (!payload.sub || !payload.sub.startsWith('usr_')) {
        return next(AppError.unauthorized('Token sub is not a valid user id'));
      }

      req.userId = payload.sub;
      return next();
    }

    // ── 2. Internal mesh: X-User-Id, gated by CIDR or HMAC ──────────────────
    const gatewayUserId = req.headers['x-user-id'];
    if (typeof gatewayUserId === 'string' && gatewayUserId.startsWith('usr_')) {
      if (isInternalRequestTrusted(req, gatewayUserId)) {
        req.userId = gatewayUserId;
        return next();
      }
      // Header was sent but the caller is NOT a trusted internal peer.
      // Surface as 401 — pretend we never saw the header rather than leak
      // "you almost made it" signals.
      return next(AppError.unauthorized('Untrusted source for X-User-Id'));
    }

    return next(AppError.unauthorized('Missing Bearer token'));
  } catch {
    next(AppError.unauthorized('Invalid or expired token'));
  }
}
