import { z } from "zod";

export const createCommentSchema = z.object({
    productId: z.string().uuid(),
    description: z.string().trim().min(1).max(1000),
});

export const productIdParamsSchema = z.object({
    productId: z.string().uuid("Invalid product id"),
});

export const listCommentsQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
});
