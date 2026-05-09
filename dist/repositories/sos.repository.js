"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PG_UNIQUE_VIOLATION = void 0;
exports.insertSosAlert = insertSosAlert;
exports.findActiveSosAlert = findActiveSosAlert;
exports.cancelActiveSosAlert = cancelActiveSosAlert;
const pg_js_1 = require("../infrastructure/pg.js");
/** Postgres unique-violation SQLSTATE — used to detect the active-SOS conflict. */
exports.PG_UNIQUE_VIOLATION = '23505';
/**
 * Inserts a new SOS alert row with status 'active'.
 *
 * Atomicity: a partial UNIQUE index on (user_id) WHERE status='active'
 * (migration 002) makes "one active SOS per user" an INSERT-time invariant.
 * If a row already exists, Postgres raises SQLSTATE 23505; callers should
 * detect this via {@link PG_UNIQUE_VIOLATION} and fall back to the existing
 * row instead of erroring out.
 */
async function insertSosAlert(params) {
    const { rows } = await pg_js_1.pool.query(`INSERT INTO safety.sos_alerts (id, user_id, trip_id, lat, lng, message)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`, [params.id, params.userId, params.tripId, params.lat, params.lng, params.message]);
    const row = rows[0];
    if (!row)
        throw new Error('Insert returned no row');
    return row;
}
/**
 * Returns the active SOS alert for a user, or null if none exists.
 */
async function findActiveSosAlert(userId) {
    const { rows } = await pg_js_1.pool.query(`SELECT * FROM safety.sos_alerts
     WHERE user_id = $1 AND status = 'active'
     LIMIT 1`, [userId]);
    return rows[0] ?? null;
}
/**
 * Sets the status of the active SOS alert for a user to 'cancelled'.
 * Returns the updated row, or null if no active alert existed.
 */
async function cancelActiveSosAlert(userId) {
    const { rows } = await pg_js_1.pool.query(`UPDATE safety.sos_alerts
     SET status = 'cancelled', updated_at = NOW()
     WHERE user_id = $1 AND status = 'active'
     RETURNING *`, [userId]);
    return rows[0] ?? null;
}
//# sourceMappingURL=sos.repository.js.map