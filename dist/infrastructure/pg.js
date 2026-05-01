"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.checkDbConnection = checkDbConnection;
exports.closePool = closePool;
const pg_1 = require("pg");
const config_js_1 = require("../config.js");
// One pool shared across the process lifetime; pg handles connection reuse
exports.pool = new pg_1.Pool({
    host: config_js_1.config.PG_HOST,
    port: config_js_1.config.PG_PORT,
    user: config_js_1.config.PG_USER,
    password: config_js_1.config.PG_PASSWORD,
    database: config_js_1.config.PG_DATABASE,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
});
exports.pool.on('error', (err) => {
    // Surface pool-level errors without crashing — individual queries surface
    // their own errors through the normal Promise rejection path
    console.error('[pg] idle client error', err.message);
});
/** Verifies the pool can reach the database. Called at startup. */
async function checkDbConnection() {
    const client = await exports.pool.connect();
    client.release();
}
async function closePool() {
    await exports.pool.end();
}
//# sourceMappingURL=pg.js.map