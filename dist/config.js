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
    // ── Internal-mesh trust (X-User-Id propagation from api-gateway) ──────────
    // Comma-separated CIDR allowlist for the *immediate peer* (req.socket.remoteAddress)
    // that may set X-User-Id. Empty list = CIDR check disabled (HMAC required).
    // Default is a permissive private-range list because docker-compose puts every
    // service in the same RFC1918 mesh; tighten in production via env override.
    INTERNAL_TRUSTED_CIDRS: zod_1.z
        .string()
        .default('10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,127.0.0.0/8,::1/128'),
    // HMAC-SHA256 shared secret. If set, an `X-Internal-Auth` header MUST accompany
    // X-User-Id; the value is hex(hmacSha256(secret, userId)). Constant-time compared.
    // Either CIDR match OR valid HMAC is sufficient. JWT path is always allowed.
    INTERNAL_AUTH_SECRET: zod_1.z.string().min(16).optional(),
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