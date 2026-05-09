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
export declare function insertPendingDispatch(params: {
    id: string;
    sosId: string;
    contactId: string;
}): Promise<SosDispatchRow>;
/** Marks a dispatch row as successfully delivered. */
export declare function markDispatchSent(dispatchId: string, attempts: number): Promise<void>;
/**
 * Records a failed delivery attempt. Sets status='failed' once `final` is true
 * (i.e. all retries exhausted); otherwise keeps it 'pending' for the next try.
 */
export declare function markDispatchAttempt(params: {
    dispatchId: string;
    attempts: number;
    error: string;
    final: boolean;
}): Promise<void>;
/** Lists all dispatch rows for a single SOS, ordered by creation. */
export declare function findDispatchesBySosId(sosId: string): Promise<SosDispatchRow[]>;
//# sourceMappingURL=dispatch.repository.d.ts.map