"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertPendingDispatch = insertPendingDispatch;
exports.markDispatchSent = markDispatchSent;
exports.markDispatchAttempt = markDispatchAttempt;
exports.findDispatchesBySosId = findDispatchesBySosId;
const pg_js_1 = require("../infrastructure/pg.js");
/**
 * Creates a pending dispatch row for a single (sos_id, contact_id) pair.
 * Idempotent: if a row already exists for that pair (e.g. retry of the same
 * SOS), the existing row is returned unchanged.
 */
async function insertPendingDispatch(params) {
    const { rows } = await pg_js_1.pool.query(`INSERT INTO safety.sos_dispatch (id, sos_id, contact_id, status)
     VALUES ($1, $2, $3, 'pending')
     ON CONFLICT (sos_id, contact_id) DO UPDATE
       SET updated_at = NOW()
     RETURNING *`, [params.id, params.sosId, params.contactId]);
    const row = rows[0];
    if (!row)
        throw new Error('Insert/upsert returned no dispatch row');
    return row;
}
/** Marks a dispatch row as successfully delivered. */
async function markDispatchSent(dispatchId, attempts) {
    await pg_js_1.pool.query(`UPDATE safety.sos_dispatch
     SET status = 'sent', attempts = $2, last_error = NULL,
         sent_at = NOW(), updated_at = NOW()
     WHERE id = $1`, [dispatchId, attempts]);
}
/**
 * Records a failed delivery attempt. Sets status='failed' once `final` is true
 * (i.e. all retries exhausted); otherwise keeps it 'pending' for the next try.
 */
async function markDispatchAttempt(params) {
    await pg_js_1.pool.query(`UPDATE safety.sos_dispatch
     SET status = $4, attempts = $2, last_error = $3, updated_at = NOW()
     WHERE id = $1`, [
        params.dispatchId,
        params.attempts,
        params.error.slice(0, 1000), // bound stored error length
        params.final ? 'failed' : 'pending',
    ]);
}
/** Lists all dispatch rows for a single SOS, ordered by creation. */
async function findDispatchesBySosId(sosId) {
    const { rows } = await pg_js_1.pool.query(`SELECT * FROM safety.sos_dispatch
     WHERE sos_id = $1
     ORDER BY created_at ASC`, [sosId]);
    return rows;
}
//# sourceMappingURL=dispatch.repository.js.map