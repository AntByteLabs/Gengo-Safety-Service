export declare const config: {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    JWT_SECRET: string;
    PG_HOST: string;
    PG_PORT: number;
    PG_USER: string;
    PG_PASSWORD: string;
    PG_DATABASE: string;
    KAFKA_BROKERS: string;
    KAFKA_CLIENT_ID: string;
    KAFKA_TOPIC_SAFETY_SOS: string;
    SPARROW_TOKEN: string;
    SPARROW_FROM: string;
    SPARROW_BASE_URL: string;
    INTERNAL_TRUSTED_CIDRS: string;
    INTERNAL_AUTH_SECRET?: string | undefined;
};
export type Config = typeof config;
//# sourceMappingURL=config.d.ts.map