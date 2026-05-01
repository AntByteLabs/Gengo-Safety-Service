import { Pool } from 'pg';
export declare const pool: Pool;
/** Verifies the pool can reach the database. Called at startup. */
export declare function checkDbConnection(): Promise<void>;
export declare function closePool(): Promise<void>;
//# sourceMappingURL=pg.d.ts.map