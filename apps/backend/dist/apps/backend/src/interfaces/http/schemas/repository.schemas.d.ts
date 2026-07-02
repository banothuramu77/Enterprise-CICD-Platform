import { z } from 'zod';
export declare const connectRepositorySchema: z.ZodObject<{
    owner: z.ZodString;
    repo: z.ZodString;
}, "strip", z.ZodTypeAny, {
    owner: string;
    repo: string;
}, {
    owner: string;
    repo: string;
}>;
export declare const triggerBuildSchema: z.ZodObject<{
    branch: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    branch?: string | undefined;
}, {
    branch?: string | undefined;
}>;
