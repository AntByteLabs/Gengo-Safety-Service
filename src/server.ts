import express from 'express';
import { requestIdMiddleware } from './middleware/request-id.js';
import { errorHandler } from './middleware/error-handler.js';
import safetyRoutes from './routes/safety.routes.js';

export function createApp(): express.Application {
  const app = express();

  // ── Global middleware ────────────────────────────────────────────────────
  app.use(express.json());
  app.use(requestIdMiddleware);

  // ── Health check ─────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'safety-svc', ts: Date.now() });
  });

  // ── Routes ────────────────────────────────────────────────────────────────
  app.use('/v1/safety', safetyRoutes);

  // ── Error handler (must be last) ─────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
