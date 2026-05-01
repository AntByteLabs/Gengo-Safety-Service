import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createSos, cancelSos, getActiveSos } from '../services/sos.service.js';
import { SosAlertDto } from '../domain/types.js';

const router = Router();

// ── Request schema ────────────────────────────────────────────────────────────

const createSosSchema = z
  .object({
    tripId: z.string().startsWith('trip_').optional(),
    location: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    message: z.string().max(500).optional(),
  })
  .strict();

type CreateSosBody = z.infer<typeof createSosSchema>;

// ── Response helpers ──────────────────────────────────────────────────────────

function ok<T>(req: Request, res: Response, data: T, status = 200): void {
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
router.post(
  '/sos',
  authMiddleware,
  validateBody(createSosSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as CreateSosBody;
      const dto: SosAlertDto = await createSos({
        userId: req.userId,
        lat: body.location.lat,
        lng: body.location.lng,
        ...(body.tripId !== undefined ? { tripId: body.tripId } : {}),
        ...(body.message !== undefined ? { message: body.message } : {}),
      });
      ok(req, res, dto, 201);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * DELETE /v1/safety/sos
 * Cancels the active SOS alert for the authenticated user.
 * Responds 204 on success. Responds 404 if no active alert exists.
 */
router.delete(
  '/sos',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await cancelSos(req.userId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /v1/safety/sos
 * Returns the active SOS alert for the authenticated user.
 * Responds 200 with the alert. Responds 404 if no active alert exists.
 */
router.get(
  '/sos',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: SosAlertDto = await getActiveSos(req.userId);
      ok(req, res, dto);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
