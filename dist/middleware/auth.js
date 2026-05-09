"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = require("../config.js");
const errors_js_1 = require("../domain/errors.js");
const internal_trust_js_1 = require("./internal-trust.js");
// Pre-parse the trusted CIDR list once at module load.
const TRUSTED_CIDRS = (0, internal_trust_js_1.parseCidrList)(config_js_1.config.INTERNAL_TRUSTED_CIDRS);
/**
 * Returns the immediate-peer address. We deliberately use socket.remoteAddress
 * (NOT req.ip) here because trust-proxy resolution can be spoofed via
 * X-Forwarded-For — and the whole point of the CIDR check is "is the actual
 * TCP peer one of our trusted internal hops".
 */
function getPeerAddress(req) {
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
function isInternalRequestTrusted(req, userId) {
    // Path (a): trusted CIDR
    if (TRUSTED_CIDRS.length > 0) {
        const peer = getPeerAddress(req);
        if ((0, internal_trust_js_1.isAddressInCidrList)(peer, TRUSTED_CIDRS))
            return true;
    }
    // Path (b): HMAC
    const secret = config_js_1.config.INTERNAL_AUTH_SECRET;
    if (secret) {
        const sig = req.headers['x-internal-auth'];
        if (typeof sig === 'string' && (0, internal_trust_js_1.verifyInternalAuthHmac)(secret, userId, sig)) {
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
function authMiddleware(req, _res, next) {
    try {
        // ── 1. Primary: JWT ───────────────────────────────────────────────────────
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.slice(7);
            const payload = jsonwebtoken_1.default.verify(token, config_js_1.config.JWT_SECRET);
            if (!payload.sub || !payload.sub.startsWith('usr_')) {
                return next(errors_js_1.AppError.unauthorized('Token sub is not a valid user id'));
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
            return next(errors_js_1.AppError.unauthorized('Untrusted source for X-User-Id'));
        }
        return next(errors_js_1.AppError.unauthorized('Missing Bearer token'));
    }
    catch {
        next(errors_js_1.AppError.unauthorized('Invalid or expired token'));
    }
}
//# sourceMappingURL=auth.js.map