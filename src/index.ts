import './config.js'; // validate env vars first — crashes fast on misconfiguration
import { createApp } from './server.js';
import { checkDbConnection, closePool } from './infrastructure/pg.js';
import { closeKafka } from './infrastructure/kafka.js';
import { config } from './config.js';

async function main(): Promise<void> {
  // Verify DB connectivity before accepting traffic
  try {
    await checkDbConnection();
    console.log('[safety-svc] Database connection established');
  } catch (err) {
    console.error('[safety-svc] Failed to connect to database:', err);
    process.exit(1);
  }

  const app = createApp();

  const server = app.listen(config.PORT, () => {
    console.log(
      `[safety-svc] Listening on port ${config.PORT} (${config.NODE_ENV})`,
    );
  });

  const shutdown = async (): Promise<void> => {
    console.log('[safety-svc] Shutting down…');
    server.close(async () => {
      try {
        await closeKafka();
        await closePool();
      } catch (err) {
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
