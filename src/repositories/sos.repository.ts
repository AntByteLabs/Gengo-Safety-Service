import { pool } from '../infrastructure/pg.js';
import { SosAlertRow } from '../domain/types.js';

/**
 * Inserts a new SOS alert row with status 'active'.
 */
export async function insertSosAlert(params: {
  id: string;
  userId: string;
  tripId: string | null;
  lat: number;
  lng: number;
  message: string | null;
}): Promise<SosAlertRow> {
  const { rows } = await pool.query<SosAlertRow>(
    `INSERT INTO safety.sos_alerts (id, user_id, trip_id, lat, lng, message)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [params.id, params.userId, params.tripId, params.lat, params.lng, params.message],
  );

  const row = rows[0];
  if (!row) throw new Error('Insert returned no row');
  return row;
}

/**
 * Returns the active SOS alert for a user, or null if none exists.
 */
export async function findActiveSosAlert(userId: string): Promise<SosAlertRow | null> {
  const { rows } = await pool.query<SosAlertRow>(
    `SELECT * FROM safety.sos_alerts
     WHERE user_id = $1 AND status = 'active'
     LIMIT 1`,
    [userId],
  );
  return rows[0] ?? null;
}

/**
 * Sets the status of the active SOS alert for a user to 'cancelled'.
 * Returns the updated row, or null if no active alert existed.
 */
export async function cancelActiveSosAlert(userId: string): Promise<SosAlertRow | null> {
  const { rows } = await pool.query<SosAlertRow>(
    `UPDATE safety.sos_alerts
     SET status = 'cancelled', updated_at = NOW()
     WHERE user_id = $1 AND status = 'active'
     RETURNING *`,
    [userId],
  );
  return rows[0] ?? null;
}
