-- safety-svc — second migration
-- Run once per environment: psql $DATABASE_URL -f migrations/002_sos_dispatch_and_active_unique.sql
--
-- Adds:
--   1. A partial UNIQUE index that makes "one active SOS per user" enforceable
--      atomically at INSERT time (eliminates the SELECT-then-INSERT race).
--   2. The safety.sos_dispatch table: one row per (sos_id, contact_id) so that
--      Sparrow SMS deliveries can be retried with exponential backoff and the
--      per-contact dispatch state is observable on GET /sos.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Atomic uniqueness for "active" SOS
-- ─────────────────────────────────────────────────────────────────────────────
-- A partial unique index lets multiple cancelled rows coexist for the same
-- user (the historical record stays intact), but only one row with
-- status='active' may exist at a time. INSERTs that violate this surface as
-- Postgres error 23505 and must be treated as "user already has an active
-- SOS — return the existing one" by the service layer.
CREATE UNIQUE INDEX IF NOT EXISTS sos_alerts_user_id_active_uniq_idx
  ON safety.sos_alerts(user_id)
  WHERE status = 'active';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Per-contact SMS dispatch tracking
-- ─────────────────────────────────────────────────────────────────────────────
-- status values:
--   'pending'   — created, not yet attempted (or between retries)
--   'sent'      — Sparrow accepted with response_code=200
--   'failed'    — all retry attempts exhausted
CREATE TABLE IF NOT EXISTS safety.sos_dispatch (
  id          TEXT PRIMARY KEY,
  sos_id      TEXT NOT NULL REFERENCES safety.sos_alerts(id) ON DELETE CASCADE,
  contact_id  TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',
  attempts    INTEGER NOT NULL DEFAULT 0,
  last_error  TEXT,
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sos_id, contact_id)
);

CREATE INDEX IF NOT EXISTS sos_dispatch_sos_id_idx
  ON safety.sos_dispatch(sos_id);

CREATE INDEX IF NOT EXISTS sos_dispatch_status_idx
  ON safety.sos_dispatch(status)
  WHERE status IN ('pending', 'failed');
