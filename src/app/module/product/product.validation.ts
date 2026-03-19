import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),
  image: z.string().min(1),
  description: z.string().min(1),
  externalLink: z.string().url(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  externalLink: z.string().url().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const productIdParamsSchema = z.object({
  id: z.string().uuid("Invalid product id"),
});

export const listAcceptedProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().min(1).optional(),
  tag: z.string().min(1).optional(),
});

export const listMyProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
