"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIdMiddleware = requestIdMiddleware;
const crypto_1 = require("crypto");
/**
 * Attaches a request-scoped UUID so every log line and error response
 * is traceable back to a single inbound HTTP request.
 * Respects an upstream X-Request-Id header when present (e.g. from the API gateway).
 */
function requestIdMiddleware(req, _res, next) {
    req.requestId = req.headers['x-request-id'] ?? (0, crypto_1.randomUUID)();
    next();
}
//# sourceMappingURL=request-id.js.map