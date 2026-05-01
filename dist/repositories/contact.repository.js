"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findActiveContactsByUserId = findActiveContactsByUserId;
const pg_js_1 = require("../infrastructure/pg.js");
/**
 * Returns all active emergency contacts for a given user.
 */
async function findActiveContactsByUserId(userId) {
    const { rows } = await pg_js_1.pool.query(`SELECT * FROM safety.emergency_contacts
     WHERE user_id = $1 AND is_active = TRUE`, [userId]);
    return rows;
}
//# sourceMappingURL=contact.repository.js.map