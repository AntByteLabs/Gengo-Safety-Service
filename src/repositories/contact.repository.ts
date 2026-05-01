import { pool } from '../infrastructure/pg.js';
import { EmergencyContactRow } from '../domain/types.js';

/**
 * Returns all active emergency contacts for a given user.
 */
export async function findActiveContactsByUserId(userId: string): Promise<EmergencyContactRow[]> {
  const { rows } = await pool.query<EmergencyContactRow>(
    `SELECT * FROM safety.emergency_contacts
     WHERE user_id = $1 AND is_active = TRUE`,
    [userId],
  );
  return rows;
}
