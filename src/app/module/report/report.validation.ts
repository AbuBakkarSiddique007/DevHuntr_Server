import { z } from "zod";

export const createReportSchema = z.object({
    productId: z.string().uuid("Invalid product id"),
    reason: z.string().trim().min(1).max(500),
});

export const reportIdParamsSchema = z.object({
    id: z.string().uuid("Invalid report id"),
});

export const listReportsQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
});
