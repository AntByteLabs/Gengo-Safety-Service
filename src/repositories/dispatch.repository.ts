import { pool } from '../infrastructure/pg.js';

export type DispatchStatus = 'pending' | 'sent' | 'failed';

export interface SosDispatchRow {
  id: string;
  sos_id: string;
  contact_id: string;
  status: DispatchStatus;
  attempts: number;
  last_error: string | null;
  sent_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Creates a pending dispatch row for a single (sos_id, contact_id) pair.
 * Idempotent: if a row already exists for that pair (e.g. retry of the same
 * SOS), the existing row is returned unchanged.
 */
export async function insertPendingDispatch(params: {
  id: string;
  sosId: string;
  contactId: string;
}): Promise<SosDispatchRow> {
  const { rows } = await pool.query<SosDispatchRow>(
    `INSERT INTO safety.sos_dispatch (id, sos_id, contact_id, status)
     VALUES ($1, $2, $3, 'pending')
     ON CONFLICT (sos_id, contact_id) DO UPDATE
       SET updated_at = NOW()
     RETURNING *`,
    [params.id, params.sosId, params.contactId],
  );
  const row = rows[0];
  if (!row) throw new Error('Insert/upsert returned no dispatch row');
  return row;
}

/** Marks a dispatch row as successfully delivered. */
export async function markDispatchSent(dispatchId: string, attempts: number): Promise<void> {
  await pool.query(
    `UPDATE safety.sos_dispatch
     SET status = 'sent', attempts = $2, last_error = NULL,
         sent_at = NOW(), updated_at = NOW()
     WHERE id = $1`,
    [dispatchId, attempts],
  );
}

/**
 * Records a failed delivery attempt. Sets status='failed' once `final` is true
 * (i.e. all retries exhausted); otherwise keeps it 'pending' for the next try.
 */
export async function markDispatchAttempt(params: {
  dispatchId: string;
  attempts: number;
  error: string;
  final: boolean;
}): Promise<void> {
  await pool.query(
    `UPDATE safety.sos_dispatch
     SET status = $4, attempts = $2, last_error = $3, updated_at = NOW()
     WHERE id = $1`,
    [
      params.dispatchId,
      params.attempts,
      params.error.slice(0, 1000), // bound stored error length
      params.final ? 'failed' : 'pending',
    ],
  );
}

/** Lists all dispatch rows for a single SOS, ordered by creation. */
export async function findDispatchesBySosId(sosId: string): Promise<SosDispatchRow[]> {
  const { rows } = await pool.query<SosDispatchRow>(
    `SELECT * FROM safety.sos_dispatch
     WHERE sos_id = $1
     ORDER BY created_at ASC`,
    [sosId],
  );
  return rows;
}
