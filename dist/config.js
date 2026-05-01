"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const schema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().int().positive().default(3010),
    JWT_SECRET: zod_1.z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
    PG_HOST: zod_1.z.string().min(1),
    PG_PORT: zod_1.z.coerce.number().int().positive().default(5432),
    PG_USER: zod_1.z.string().min(1),
    PG_PASSWORD: zod_1.z.string(),
    PG_DATABASE: zod_1.z.string().min(1),
    KAFKA_BROKERS: zod_1.z.string().min(1),
    KAFKA_CLIENT_ID: zod_1.z.string().min(1).default('safety-svc'),
    KAFKA_TOPIC_SAFETY_SOS: zod_1.z.string().min(1).default('safety.sos.triggered'),
    SPARROW_TOKEN: zod_1.z.string().min(1),
    SPARROW_FROM: zod_1.z.string().min(1).default('GenGo'),
    SPARROW_BASE_URL: zod_1.z.string().url().default('https://api.sparrowsms.com/v2'),
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) {
    // Crash early with a clear message so misconfigured containers fail fast
    console.error('Invalid environment configuration:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}
exports.config = parsed.data;
//# sourceMappingURL=config.js.map