import { z } from 'zod';
export const connectRepositorySchema = z.object({
    owner: z.string().min(1),
    repo: z.string().min(1),
});
export const triggerBuildSchema = z.object({
    branch: z.string().min(1).optional(),
});
//# sourceMappingURL=repository.schemas.js.map