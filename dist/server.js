"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const request_id_js_1 = require("./middleware/request-id.js");
const error_handler_js_1 = require("./middleware/error-handler.js");
const safety_routes_js_1 = __importDefault(require("./routes/safety.routes.js"));
function createApp() {
    const app = (0, express_1.default)();
    // ── Global middleware ────────────────────────────────────────────────────
    app.use(express_1.default.json());
    app.use(request_id_js_1.requestIdMiddleware);
    // ── Health check ─────────────────────────────────────────────────────────
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', service: 'safety-svc', ts: Date.now() });
    });
    // ── Routes ────────────────────────────────────────────────────────────────
    app.use('/v1/safety', safety_routes_js_1.default);
    // ── Error handler (must be last) ─────────────────────────────────────────
    app.use(error_handler_js_1.errorHandler);
    return app;
}
//# sourceMappingURL=server.js.map