-- safety-svc initial schema
-- Run once per environment: psql $DATABASE_URL -f migrations/001_init.sql

CREATE SCHEMA IF NOT EXISTS safety;

CREATE TABLE IF NOT EXISTS safety.sos_alerts (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  trip_id    TEXT,
  status     TEXT NOT NULL DEFAULT 'active',
  lat        DOUBLE PRECISION NOT NULL,
  lng        DOUBLE PRECISION NOT NULL,
  message    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sos_alerts_user_id_status_idx
  ON safety.sos_alerts(user_id, status);

CREATE TABLE IF NOT EXISTS safety.emergency_contacts (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS emergency_contacts_user_id_active_idx
  ON safety.emergency_contacts(user_id)
  WHERE is_active = TRUE;
