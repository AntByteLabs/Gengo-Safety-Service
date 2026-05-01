import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3010),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),

  PG_HOST: z.string().min(1),
  PG_PORT: z.coerce.number().int().positive().default(5432),
  PG_USER: z.string().min(1),
  PG_PASSWORD: z.string(),
  PG_DATABASE: z.string().min(1),

  KAFKA_BROKERS: z.string().min(1),
  KAFKA_CLIENT_ID: z.string().min(1).default('safety-svc'),
  KAFKA_TOPIC_SAFETY_SOS: z.string().min(1).default('safety.sos.triggered'),

  SPARROW_TOKEN: z.string().min(1),
  SPARROW_FROM: z.string().min(1).default('GenGo'),
  SPARROW_BASE_URL: z.string().url().default('https://api.sparrowsms.com/v2'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // Crash early with a clear message so misconfigured containers fail fast
  console.error('Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;
