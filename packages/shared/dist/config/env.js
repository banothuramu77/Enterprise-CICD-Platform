import { z } from 'zod';
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(3001),
    DATABASE_URL: z.string().default('postgresql://cicd:cicd@localhost:5432/cicd_platform'),
    RABBITMQ_URL: z.string().default('amqp://localhost:5672'),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    MINIO_ENDPOINT: z.string().default('localhost'),
    MINIO_PORT: z.coerce.number().default(9000),
    MINIO_ACCESS_KEY: z.string().default('minioadmin'),
    MINIO_SECRET_KEY: z.string().default('minioadmin'),
    MINIO_BUCKET: z.string().default('artifacts'),
    JWT_ACCESS_TOKEN_SECRET: z.string().default('dev-access-secret-123456'),
    JWT_REFRESH_TOKEN_SECRET: z.string().default('dev-refresh-secret-123456'),
    JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GITHUB_CALLBACK_URL: z.string().default('http://localhost:3001/api/auth/oauth/github/callback'),
    FRONTEND_URL: z.string().default('http://localhost:3000'),
});
export function loadEnv() {
    return envSchema.parse(process.env);
}
//# sourceMappingURL=env.js.map