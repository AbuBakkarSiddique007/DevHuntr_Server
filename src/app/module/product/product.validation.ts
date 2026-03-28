import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),
  image: z.string().min(1),
  description: z.string().min(1),
  externalLink: z.string().url(),
  tagIds: z.array(z.string().uuid()).optional(),
  pricingType: z.enum(["FREE", "PREMIUM"]).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  externalLink: z.string().url().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  pricingType: z.enum(["FREE", "PREMIUM"]).optional(),
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

export const listFeedProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const listMyProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const listPendingProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const listModeratedProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(["ACCEPTED", "REJECTED"]).optional(),
});

export const updateProductStatusSchema = z
  .object({
    status: z.enum(["ACCEPTED", "REJECTED"]),
    rejectionReason: z.string().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "REJECTED" && !value.rejectionReason) {
      ctx.addIssue({
        code: "custom",
        path: ["rejectionReason"],
        message: "rejectionReason is required when rejecting a product",
      });
    }

    if (value.status === "ACCEPTED" && value.rejectionReason) {
      ctx.addIssue({
        code: "custom",
        path: ["rejectionReason"],
        message: "rejectionReason must be omitted when accepting a product",
      });
    }
  });
