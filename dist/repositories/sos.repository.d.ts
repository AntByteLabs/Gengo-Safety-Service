import { SosAlertRow } from '../domain/types.js';
/** Postgres unique-violation SQLSTATE — used to detect the active-SOS conflict. */
export declare const PG_UNIQUE_VIOLATION = "23505";
/**
 * Inserts a new SOS alert row with status 'active'.
 *
 * Atomicity: a partial UNIQUE index on (user_id) WHERE status='active'
 * (migration 002) makes "one active SOS per user" an INSERT-time invariant.
 * If a row already exists, Postgres raises SQLSTATE 23505; callers should
 * detect this via {@link PG_UNIQUE_VIOLATION} and fall back to the existing
 * row instead of erroring out.
 */
export declare function insertSosAlert(params: {
    id: string;
    userId: string;
    tripId: string | null;
    lat: number;
    lng: number;
    message: string | null;
}): Promise<SosAlertRow>;
/**
 * Returns the active SOS alert for a user, or null if none exists.
 */
export declare function findActiveSosAlert(userId: string): Promise<SosAlertRow | null>;
/**
 * Sets the status of the active SOS alert for a user to 'cancelled'.
 * Returns the updated row, or null if no active alert existed.
 */
export declare function cancelActiveSosAlert(userId: string): Promise<SosAlertRow | null>;
//# sourceMappingURL=sos.repository.d.ts.map