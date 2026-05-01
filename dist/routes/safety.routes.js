"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_js_1 = require("../middleware/auth.js");
const validate_js_1 = require("../middleware/validate.js");
const sos_service_js_1 = require("../services/sos.service.js");
const router = (0, express_1.Router)();
// ── Request schema ────────────────────────────────────────────────────────────
const createSosSchema = zod_1.z
    .object({
    tripId: zod_1.z.string().startsWith('trip_').optional(),
    location: zod_1.z.object({
        lat: zod_1.z.number().min(-90).max(90),
        lng: zod_1.z.number().min(-180).max(180),
    }),
    message: zod_1.z.string().max(500).optional(),
})
    .strict();
// ── Response helpers ──────────────────────────────────────────────────────────
function ok(req, res, data, status = 200) {
    res.status(status).json({
        success: true,
        data,
        meta: { requestId: req.requestId, ts: Date.now() },
    });
}
// ── Routes ────────────────────────────────────────────────────────────────────
/**
 * POST /v1/safety/sos
 * Creates an active SOS alert for the authenticated user.
 * Responds 201 with the created alert. Responds 409 if one already exists.
 */
router.post('/sos', auth_js_1.authMiddleware, (0, validate_js_1.validateBody)(createSosSchema), async (req, res, next) => {
    try {
        const body = req.body;
        const dto = await (0, sos_service_js_1.createSos)({
            userId: req.userId,
            lat: body.location.lat,
            lng: body.location.lng,
            ...(body.tripId !== undefined ? { tripId: body.tripId } : {}),
            ...(body.message !== undefined ? { message: body.message } : {}),
        });
        ok(req, res, dto, 201);
    }
    catch (err) {
        next(err);
    }
});
/**
 * DELETE /v1/safety/sos
 * Cancels the active SOS alert for the authenticated user.
 * Responds 204 on success. Responds 404 if no active alert exists.
 */
router.delete('/sos', auth_js_1.authMiddleware, async (req, res, next) => {
    try {
        await (0, sos_service_js_1.cancelSos)(req.userId);
        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
});
/**
 * GET /v1/safety/sos
 * Returns the active SOS alert for the authenticated user.
 * Responds 200 with the alert. Responds 404 if no active alert exists.
 */
router.get('/sos', auth_js_1.authMiddleware, async (req, res, next) => {
    try {
        const dto = await (0, sos_service_js_1.getActiveSos)(req.userId);
        ok(req, res, dto);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=safety.routes.js.map