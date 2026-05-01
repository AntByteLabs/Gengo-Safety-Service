import { SosAlertRow } from '../domain/types.js';
/**
 * Inserts a new SOS alert row with status 'active'.
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