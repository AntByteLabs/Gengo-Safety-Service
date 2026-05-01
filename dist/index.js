"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./config.js"); // validate env vars first — crashes fast on misconfiguration
const server_js_1 = require("./server.js");
const pg_js_1 = require("./infrastructure/pg.js");
const kafka_js_1 = require("./infrastructure/kafka.js");
const config_js_1 = require("./config.js");
async function main() {
    // Verify DB connectivity before accepting traffic
    try {
        await (0, pg_js_1.checkDbConnection)();
        console.log('[safety-svc] Database connection established');
    }
    catch (err) {
        console.error('[safety-svc] Failed to connect to database:', err);
        process.exit(1);
    }
    const app = (0, server_js_1.createApp)();
    const server = app.listen(config_js_1.config.PORT, () => {
        console.log(`[safety-svc] Listening on port ${config_js_1.config.PORT} (${config_js_1.config.NODE_ENV})`);
    });
    const shutdown = async () => {
        console.log('[safety-svc] Shutting down…');
        server.close(async () => {
            try {
                await (0, kafka_js_1.closeKafka)();
                await (0, pg_js_1.closePool)();
            }
            catch (err) {
                console.error('[safety-svc] Error during shutdown:', err);
            }
            process.exit(0);
        });
    };
    process.on('SIGTERM', () => void shutdown());
    process.on('SIGINT', () => void shutdown());
}
main().catch((err) => {
    console.error('[safety-svc] Startup error:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map