"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = require("../config.js");
const errors_js_1 = require("../domain/errors.js");
/**
 * Validates the JWT in the Authorization header and attaches userId to the request.
 *
 * Dual-mode: if the API gateway forwards an X-User-Id header with a valid usr_ prefix,
 * that is trusted directly without re-verifying the JWT.
 */
function authMiddleware(req, _res, next) {
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
            return next(errors_js_1.AppError.unauthorized('Missing Bearer token'));
        }
        const token = authHeader.slice(7);
        const payload = jsonwebtoken_1.default.verify(token, config_js_1.config.JWT_SECRET);
        if (!payload.sub || !payload.sub.startsWith('usr_')) {
            return next(errors_js_1.AppError.unauthorized('Token sub is not a valid user id'));
        }
        req.userId = payload.sub;
        next();
    }
    catch {
        next(errors_js_1.AppError.unauthorized('Invalid or expired token'));
    }
}
//# sourceMappingURL=auth.js.map