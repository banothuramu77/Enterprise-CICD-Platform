import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "test", "production"]>>;
    PORT: z.ZodDefault<z.ZodNumber>;
    DATABASE_URL: z.ZodDefault<z.ZodString>;
    RABBITMQ_URL: z.ZodDefault<z.ZodString>;
    REDIS_URL: z.ZodDefault<z.ZodString>;
    MINIO_ENDPOINT: z.ZodDefault<z.ZodString>;
    MINIO_PORT: z.ZodDefault<z.ZodNumber>;
    MINIO_ACCESS_KEY: z.ZodDefault<z.ZodString>;
    MINIO_SECRET_KEY: z.ZodDefault<z.ZodString>;
    MINIO_BUCKET: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    DATABASE_URL: string;
    RABBITMQ_URL: string;
    REDIS_URL: string;
    MINIO_ENDPOINT: string;
    MINIO_PORT: number;
    MINIO_ACCESS_KEY: string;
    MINIO_SECRET_KEY: string;
    MINIO_BUCKET: string;
}, {
    NODE_ENV?: "development" | "test" | "production" | undefined;
    PORT?: number | undefined;
    DATABASE_URL?: string | undefined;
    RABBITMQ_URL?: string | undefined;
    REDIS_URL?: string | undefined;
    MINIO_ENDPOINT?: string | undefined;
    MINIO_PORT?: number | undefined;
    MINIO_ACCESS_KEY?: string | undefined;
    MINIO_SECRET_KEY?: string | undefined;
    MINIO_BUCKET?: string | undefined;
}>;
export declare function loadEnv(): {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    DATABASE_URL: string;
    RABBITMQ_URL: string;
    REDIS_URL: string;
    MINIO_ENDPOINT: string;
    MINIO_PORT: number;
    MINIO_ACCESS_KEY: string;
    MINIO_SECRET_KEY: string;
    MINIO_BUCKET: string;
};
export type AppEnv = z.infer<typeof envSchema>;
export {};
